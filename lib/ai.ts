import { z } from "zod";
import { buildAdaptivePracticeQuestions, buildFallbackStudyPack, deriveWeakTopics } from "@/lib/study-engine";
import type { ProgressState, QuizQuestion, StudyGenerationInput, StudyPack } from "@/lib/types";
import { normalizeWhitespace, slugify, unique } from "@/lib/utils";

const difficultySchema = z.enum(["easy", "medium", "hard"]);

const aiFlashcardSchema = z.object({
  concept: z.string().min(2).max(80),
  front: z.string().min(6).max(180),
  back: z.string().min(12).max(240),
});

const aiQuizSchema = z.object({
  concept: z.string().min(2).max(80),
  question: z.string().min(12).max(240),
  options: z.array(z.string().min(2).max(220)).min(4).max(4),
  correctAnswer: z.string().min(2).max(220),
  explanation: z.string().min(12).max(240),
  difficulty: difficultySchema,
});

const aiPlanSchema = z.object({
  dayLabel: z.string().min(2).max(40),
  title: z.string().min(4).max(80),
  focusConcepts: z.array(z.string().min(2).max(80)).min(1).max(3),
  durationMinutes: z.number().int().min(20).max(120),
  objective: z.string().min(10).max(180),
  tasks: z.array(z.string().min(6).max(180)).min(2).max(4),
});

const aiDrillSchema = z.object({
  concept: z.string().min(2).max(80),
  question: z.string().min(12).max(240),
  answer: z.string().min(12).max(240),
  hint: z.string().min(6).max(180),
  difficulty: difficultySchema,
});

const aiStudyPackSchema = z.object({
  keyConcepts: z.array(z.string().min(2).max(80)).min(4).max(8),
  summary: z.object({
    short: z.string().min(40).max(480),
    bullets: z.array(z.string().min(10).max(180)).min(3).max(5),
    misconceptions: z.array(z.string().min(10).max(180)).min(2).max(4),
  }),
  checklist: z.array(z.string().min(10).max(180)).min(4).max(8),
  flashcards: z.array(aiFlashcardSchema).min(4).max(8),
  quiz: z.array(aiQuizSchema).min(5).max(8),
  studyPlan: z.array(aiPlanSchema).min(4).max(6),
  weakDrills: z.array(aiDrillSchema).min(3).max(6),
});

const aiPracticeSchema = z.object({
  questions: z.array(aiQuizSchema).min(3).max(8),
});

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "openai/gpt-oss-20b";

function getBaseUrl() {
  return (process.env.NVIDIA_NIM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function getModel() {
  return process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL;
}

function stripFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function extractJsonObject(text: string) {
  const cleaned = stripFence(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON object.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function summarizeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 180);
  return "AI generation failed. Demo fallback used.";
}

async function callNvidia(
  apiKey: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
  maxTokens: number,
) {
  const response = await fetch(`${getBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.25,
      max_tokens: maxTokens,
      stream: false,
      messages,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`NVIDIA NIM ${response.status}: ${text.slice(0, 220)}`);
  }

  const data = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (Array.isArray(content)) {
    return content.map((part) => part.text ?? "").join("");
  }

  if (typeof content !== "string") {
    throw new Error("NVIDIA NIM returned an empty completion.");
  }

  return content;
}

function normalizeQuizQuestion(question: QuizQuestion, index: number, prefix: string) {
  const options = unique([
    question.correctAnswer,
    ...question.options.map((option) => normalizeWhitespace(option)),
  ]).slice(0, 4);

  while (options.length < 4) {
    options.push("Review the original notes and connect the concept back to the topic.");
  }

  return {
    ...question,
    id: `${prefix}-${slugify(question.concept)}-${index + 1}`,
    question: normalizeWhitespace(question.question).slice(0, 220),
    options,
    correctAnswer: options.includes(question.correctAnswer)
      ? normalizeWhitespace(question.correctAnswer)
      : options[0],
    explanation: normalizeWhitespace(question.explanation).slice(0, 220),
  } satisfies QuizQuestion;
}

export async function generateStudyPack(input: StudyGenerationInput): Promise<StudyPack> {
  const fallback = buildFallbackStudyPack({
    ...input,
    provider: "demo-fallback",
    fallbackReason: undefined,
  });
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    return {
      ...fallback,
      provider: input.provider === "instant-demo" ? "instant-demo" : "demo-fallback",
      fallbackReason: "No NVIDIA_NIM_API_KEY configured. StudySprint switched to demo mode.",
    };
  }

  const prompt = {
    role: "user" as const,
    content: `Create a grounded study pack from the source notes below. Use only facts supported by the notes. If the notes are thin, keep explanations generic rather than inventing details. Return JSON only with this shape: { keyConcepts, summary: { short, bullets, misconceptions }, checklist, flashcards, quiz, studyPlan, weakDrills }.

Subject: ${input.subject}
Topic: ${input.topic}
Exam date: ${input.examDate ?? "not provided"}
Available hours per week: ${input.availableHoursPerWeek ?? "not provided"}
Seed concept hints: ${fallback.keyConcepts.join(", ")}

Source notes:\n${input.notes.slice(0, 9000)}`,
  };

  try {
    const content = await callNvidia(
      apiKey,
      [
        {
          role: "system",
          content:
            "You are a precise study assistant. Return valid JSON only. Keep every output useful for a student revising under time pressure.",
        },
        prompt,
      ],
      2200,
    );

    const parsed = aiStudyPackSchema.parse(extractJsonObject(content));

    return {
      ...fallback,
      provider: "nvidia-nim",
      fallbackReason: undefined,
      keyConcepts: unique(parsed.keyConcepts).slice(0, 6),
      summary: {
        short: normalizeWhitespace(parsed.summary.short).slice(0, 420),
        bullets: parsed.summary.bullets.slice(0, 4).map((item) => normalizeWhitespace(item)),
        misconceptions: parsed.summary.misconceptions
          .slice(0, 3)
          .map((item) => normalizeWhitespace(item)),
      },
      checklist: parsed.checklist.slice(0, 6).map((item) => normalizeWhitespace(item)),
      flashcards: parsed.flashcards.slice(0, 6).map((card, index) => ({
        id: `flashcard-${slugify(card.concept)}-${index + 1}`,
        concept: normalizeWhitespace(card.concept),
        front: normalizeWhitespace(card.front),
        back: normalizeWhitespace(card.back),
      })),
      quiz: parsed.quiz.slice(0, 6).map((question, index) =>
        normalizeQuizQuestion(
          {
            id: question.concept,
            concept: normalizeWhitespace(question.concept),
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
          },
          index,
          "quiz",
        ),
      ),
      studyPlan: parsed.studyPlan.slice(0, 6).map((session, index) => ({
        id: `plan-${index + 1}`,
        dayLabel: normalizeWhitespace(session.dayLabel),
        title: normalizeWhitespace(session.title),
        focusConcepts: session.focusConcepts.map((concept) => normalizeWhitespace(concept)).slice(0, 3),
        durationMinutes: session.durationMinutes,
        objective: normalizeWhitespace(session.objective),
        tasks: session.tasks.map((task) => normalizeWhitespace(task)).slice(0, 4),
      })),
      weakDrills: parsed.weakDrills.slice(0, 4).map((drill, index) => ({
        id: `drill-${slugify(drill.concept)}-${index + 1}`,
        concept: normalizeWhitespace(drill.concept),
        question: normalizeWhitespace(drill.question),
        answer: normalizeWhitespace(drill.answer),
        hint: normalizeWhitespace(drill.hint),
        difficulty: drill.difficulty,
      })),
    };
  } catch (error) {
    return {
      ...fallback,
      provider: "demo-fallback",
      fallbackReason: summarizeError(error),
    };
  }
}

export async function generateAdaptivePractice(
  pack: StudyPack,
  progress: ProgressState,
  requestedCount = 5,
): Promise<{ questions: QuizQuestion[]; provider: "nvidia-nim" | "demo-fallback"; fallbackReason?: string }> {
  const fallbackQuestions = buildAdaptivePracticeQuestions(pack, progress, requestedCount);
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    return {
      questions: fallbackQuestions,
      provider: "demo-fallback",
      fallbackReason: "No NVIDIA_NIM_API_KEY configured. Generated fallback weak-topic questions.",
    };
  }

  const weakTopics = deriveWeakTopics(pack, progress);

  try {
    const content = await callNvidia(
      apiKey,
      [
        {
          role: "system",
          content:
            "You generate grounded multiple-choice revision drills. Return valid JSON only in the shape { questions: [...] }.",
        },
        {
          role: "user",
          content: `Create ${requestedCount} weak-area quiz questions for this student. Focus on these weak topics first: ${weakTopics.join(", ") || "use the most difficult concepts"}. Only use facts from the notes. Keep questions short, practical, and exam-style.

Topic: ${pack.topic}
Key concepts: ${pack.keyConcepts.join(", ")}
Source notes:\n${pack.inputText.slice(0, 9000)}`,
        },
      ],
      1400,
    );

    const parsed = aiPracticeSchema.parse(extractJsonObject(content));

    return {
      provider: "nvidia-nim",
      questions: parsed.questions.slice(0, requestedCount).map((question, index) =>
        normalizeQuizQuestion(
          {
            id: question.concept,
            concept: normalizeWhitespace(question.concept),
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
          },
          index,
          "practice",
        ),
      ),
    };
  } catch (error) {
    return {
      questions: fallbackQuestions,
      provider: "demo-fallback",
      fallbackReason: summarizeError(error),
    };
  }
}

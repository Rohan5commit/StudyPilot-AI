import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAdaptivePractice } from "@/lib/ai";

const difficultySchema = z.enum(["easy", "medium", "hard"]);

const requestSchema = z.object({
  pack: z.object({
    subject: z.string(),
    topic: z.string(),
    inputText: z.string(),
    keyConcepts: z.array(z.string()),
    flashcards: z.array(
      z.object({
        id: z.string(),
        concept: z.string(),
        front: z.string(),
        back: z.string(),
      }),
    ),
    weakDrills: z.array(
      z.object({
        id: z.string(),
        concept: z.string(),
        question: z.string(),
        answer: z.string(),
        hint: z.string(),
        difficulty: difficultySchema,
      }),
    ),
  }).passthrough(),
  progress: z.object({
    completedChecklist: z.array(z.string()),
    flashcardsMastered: z.array(z.string()),
    topicRatings: z.record(z.string(), difficultySchema),
    quizAttempts: z.array(
      z.object({
        questionId: z.string(),
        selectedAnswer: z.string(),
        correct: z.boolean(),
        concept: z.string(),
        difficulty: difficultySchema,
        createdAt: z.string(),
      }),
    ),
    lastGeneratedPractice: z.array(z.any()),
  }),
  requestedCount: z.number().int().min(3).max(8).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = requestSchema.parse(await request.json());
    const practice = await generateAdaptivePractice(
      body.pack,
      body.progress,
      body.requestedCount ?? 5,
    );

    return NextResponse.json(practice, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create weak-area drill.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

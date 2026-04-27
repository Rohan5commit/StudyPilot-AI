"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert, FileUp, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { demoPresets } from "@/lib/demo-presets";
import { loadInstantDemoPack, saveGeneratedPack } from "@/lib/store";

export function WorkspaceScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPresetId, setSelectedPresetId] = useState<string>(demoPresets[0].id);
  const [subject, setSubject] = useState(demoPresets[0].subject);
  const [topic, setTopic] = useState(demoPresets[0].topic);
  const [notes, setNotes] = useState(demoPresets[0].notes);
  const [examDate, setExamDate] = useState(demoPresets[0].examDate);
  const [availableHours, setAvailableHours] = useState(String(demoPresets[0].availableHoursPerWeek));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedPreset = useMemo(
    () => demoPresets.find((preset) => preset.id === selectedPresetId) ?? demoPresets[0],
    [selectedPresetId],
  );

  useEffect(() => {
    const presetId = searchParams.get("preset");
    if (!presetId) return;

    const preset = demoPresets.find((entry) => entry.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setSubject(preset.subject);
    setTopic(preset.topic);
    setNotes(preset.notes);
    setExamDate(preset.examDate);
    setAvailableHours(String(preset.availableHoursPerWeek));
  }, [searchParams]);

  const applyPreset = (presetId: string) => {
    const preset = demoPresets.find((entry) => entry.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setSubject(preset.subject);
    setTopic(preset.topic);
    setNotes(preset.notes);
    setExamDate(preset.examDate);
    setAvailableHours(String(preset.availableHoursPerWeek));
    setError(null);
  };

  const launchInstantDemo = (presetId: string) => {
    loadInstantDemoPack(presetId);
    router.push("/dashboard");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 2_000_000) {
        throw new Error("This demo accepts note uploads up to 2MB.");
      }

      const isTextFile =
        file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);

      if (!isTextFile) {
        throw new Error(
          "For speed and reliability, this demo accepts text-based notes only. For PDF or image notes, paste the extracted text instead.",
        );
      }

      const content = await file.text();
      setNotes((current) => `${current.trim()}\n\n${content.trim()}`.trim());
      setError(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to read that file.");
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          notes,
          examDate: examDate || null,
          availableHoursPerWeek: availableHours ? Number(availableHours) : null,
          selectedPresetId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed.");
      }

      saveGeneratedPack(payload.studyPack);
      router.push("/dashboard");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "StudySprint could not generate a pack right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      eyebrow="Study workspace"
      title="Build a revision pack from any topic, syllabus, or note dump"
      description="Paste notes, upload text files, or start from a preset. StudySprint AI will return a summary, checklist, quiz, flashcards, study plan, and weak-topic drills."
      actions={
        <button
          onClick={() => launchInstantDemo(selectedPreset.id)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Instant demo mode
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Study pack generator</h2>
              <p className="mt-1 text-sm text-slate-300">
                Keep the input grounded. The stronger the notes, the sharper the quiz and flashcards.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-300"
                placeholder="Biology"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Topic or unit</span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-300"
                placeholder="Cellular respiration"
                required
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Exam date</span>
              <input
                value={examDate}
                onChange={(event) => setExamDate(event.target.value)}
                type="date"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-300"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Available study hours per week</span>
              <input
                value={availableHours}
                onChange={(event) => setAvailableHours(event.target.value)}
                type="number"
                min={1}
                max={40}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-sky-300"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm text-slate-200">
            <span>Notes / syllabus / messy study dump</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={14}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm leading-6 text-white outline-none transition focus:border-sky-300"
              placeholder="Paste raw study notes here..."
              required
            />
          </label>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/8">
              <FileUp className="h-4 w-4" />
              Upload text notes
              <input type="file" accept=".txt,.md,.csv,.json,text/*" className="hidden" onChange={handleFileUpload} />
            </label>

            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {notes.trim().length} characters loaded
            </div>
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || notes.trim().length < 24}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? "Generating study pack..." : "Generate study pack"}
          </button>
        </form>

        <div className="space-y-6">
          <section className="surface-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="pill-chip">Selected preset</span>
                <h2 className="mt-3 text-xl font-semibold text-white">{selectedPreset.topic}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedPreset.highlight}</p>
              </div>
              <button
                onClick={() => launchInstantDemo(selectedPreset.id)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Try demo
              </button>
            </div>
            <p className="mt-4 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-4 text-sm leading-6 text-slate-200">
              <span className="font-semibold text-white">Focus:</span> {selectedPreset.focus}
            </p>
          </section>

          <section className="surface-card p-6 sm:p-7">
            <span className="pill-chip">Demo presets</span>
            <div className="mt-4 space-y-3">
              {demoPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    preset.id === selectedPresetId
                      ? "border-sky-300 bg-sky-400/10"
                      : "border-white/8 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{preset.topic}</p>
                      <p className="mt-1 text-sm text-slate-300">{preset.subject}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      {preset.availableHoursPerWeek}h/week
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="surface-card p-6 sm:p-7">
            <span className="pill-chip">Reliability guardrails</span>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>• If the NVIDIA NIM key is missing, StudySprint still works with a seeded demo and local fallback generator.</p>
              <p>• Text uploads are supported out of the box. PDF/image notes gracefully fall back to paste-in text for demo speed.</p>
              <p>• Every output is grounded to the user’s notes first, not generic advice.</p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

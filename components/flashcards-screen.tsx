"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { toggleFlashcardMastered, useStudyStore } from "@/lib/store";
import { percentage } from "@/lib/utils";

export function FlashcardsScreen() {
  const { currentPack, progress } = useStudyStore();
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  if (!currentPack) {
    return (
      <AppShell
        eyebrow="Flashcards"
        title="No flashcards yet"
        description="Generate a study pack first to unlock the flashcard deck."
        actions={
          <Link href="/workspace" className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">
            Open workspace
          </Link>
        }
      >
        <div className="surface-card p-8 text-sm leading-7 text-slate-300">
          Flashcards are generated from the notes and stay tied to the same study pack as the quiz and revision plan.
        </div>
      </AppShell>
    );
  }

  const masteredRate = percentage(progress.flashcardsMastered.length, currentPack.flashcards.length);

  return (
    <AppShell
      eyebrow="Flashcard deck"
      title="Review key concepts in short, repeatable chunks"
      description="Flip cards, mark mastered concepts, and use the progress signal to see which topics still need attention."
      actions={
        <Link href="/quiz" className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">
          Go to quiz
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 text-white">
            <BookOpen className="h-5 w-5 text-sky-200" />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Deck size</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{currentPack.flashcards.length} cards</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Mastered</p>
          <p className="mt-4 text-2xl font-semibold text-white">{progress.flashcardsMastered.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Completion</p>
          <p className="mt-4 text-2xl font-semibold text-white">{masteredRate}%</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentPack.flashcards.map((card) => {
          const mastered = progress.flashcardsMastered.includes(card.id);
          const isFlipped = flipped[card.id];

          return (
            <article key={card.id} className="surface-card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="pill-chip">{card.concept}</span>
                {mastered ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : null}
              </div>

              <button
                onClick={() => setFlipped((current) => ({ ...current, [card.id]: !current[card.id] }))}
                className="mt-5 min-h-44 w-full rounded-3xl border border-white/8 bg-slate-950/70 p-5 text-left"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {isFlipped ? "Back" : "Front"}
                </p>
                <p className="mt-4 text-base leading-7 text-white">
                  {isFlipped ? card.back : card.front}
                </p>
              </button>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setFlipped((current) => ({ ...current, [card.id]: !current[card.id] }))}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {isFlipped ? "Show front" : "Flip card"}
                </button>
                <button
                  onClick={() => toggleFlashcardMastered(card.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    mastered
                      ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "bg-emerald-300 text-slate-950"
                  }`}
                >
                  {mastered ? "Undo" : "Mastered"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}

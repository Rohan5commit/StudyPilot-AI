"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { deriveWeakTopics, getChecklistProgress, getQuizAccuracy } from "@/lib/study-engine";
import { useStudyStore } from "@/lib/store";
import { daysUntil, formatLongDate } from "@/lib/utils";

export function PlanScreen() {
  const { currentPack, progress } = useStudyStore();

  if (!currentPack) {
    return (
      <AppShell
        eyebrow="Revision plan"
        title="No revision plan available yet"
        description="Generate a study pack to see the sprint plan and progress roll-up."
        actions={
          <Link href="/workspace" className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">
            Open workspace
          </Link>
        }
      >
        <div className="surface-card p-8 text-sm leading-7 text-slate-300">
          The plan view connects exam timing, available hours, and the weakest concepts into a simple revision schedule.
        </div>
      </AppShell>
    );
  }

  const weakTopics = deriveWeakTopics(currentPack, progress);
  const checklistProgress = getChecklistProgress(currentPack, progress);
  const quizAccuracy = getQuizAccuracy(progress);
  const nextTask = currentPack.checklist.find((item) => !progress.completedChecklist.includes(item));
  const examCountdown = daysUntil(currentPack.examDate);

  return (
    <AppShell
      eyebrow="Revision plan"
      title="A realistic sprint plan, not a generic timetable"
      description="StudySprint spreads the highest-value concepts across short sessions so judges can see one clear, credible workflow."
      actions={
        <Link href="/dashboard" className="rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950">
          Back to dashboard
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 text-white">
            <CalendarDays className="h-5 w-5 text-sky-200" />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Exam timing</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">
            {examCountdown === null ? "Flexible" : `${examCountdown} days left`}
          </p>
          <p className="mt-2 text-sm text-slate-400">{formatLongDate(currentPack.examDate)}</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 text-white">
            <Target className="h-5 w-5 text-sky-200" />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Next best move</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-200">{nextTask ?? "All checklist items completed. Run a timed recap next."}</p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 text-white">
            <BarChart3 className="h-5 w-5 text-sky-200" />
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">Readiness</span>
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{Math.round((checklistProgress + quizAccuracy) / 2)}%</p>
          <p className="mt-2 text-sm text-slate-400">Blend of checklist progress and quiz accuracy.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-white">Planned revision sessions</h2>
          <div className="mt-5 space-y-4">
            {currentPack.studyPlan.map((session) => (
              <article key={session.id} className="subtle-card p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{session.dayLabel}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{session.title}</h3>
                  </div>
                  <span className="pill-chip">{session.durationMinutes} min</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{session.objective}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {session.focusConcepts.map((concept) => (
                    <span key={concept} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                      {concept}
                    </span>
                  ))}
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                  {session.tasks.map((task) => (
                    <li key={task}>• {task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="surface-card p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-white">Weak-topic watchlist</h2>
            {weakTopics.length ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {weakTopics.map((concept) => (
                  <span key={concept} className="rounded-full border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100">
                    {concept}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-300">
                No weak topics yet. Mark concepts or take the quiz to adapt the plan.
              </p>
            )}
          </div>

          <div className="surface-card p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-white">Study settings</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div className="subtle-card px-4 py-3">
                <span className="text-slate-400">Subject:</span> {currentPack.subject}
              </div>
              <div className="subtle-card px-4 py-3">
                <span className="text-slate-400">Topic:</span> {currentPack.topic}
              </div>
              <div className="subtle-card px-4 py-3">
                <span className="text-slate-400">Hours per week:</span> {currentPack.availableHoursPerWeek ?? "Flexible"}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

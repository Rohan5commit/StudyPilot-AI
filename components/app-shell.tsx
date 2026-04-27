"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/workspace", label: "Workspace" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "Quiz" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/plan", label: "Revision plan" },
];

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ eyebrow, title, description, actions, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <div className="surface-card mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="pill-chip">{eyebrow}</span>
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                {description}
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-sky-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>

      {children}
    </main>
  );
}

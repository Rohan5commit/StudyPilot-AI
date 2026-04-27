import { Suspense } from "react";
import { WorkspaceScreen } from "@/components/workspace-screen";

function WorkspaceLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 text-sm text-slate-300 sm:px-6 lg:px-8">
      Loading workspace...
    </main>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceScreen />
    </Suspense>
  );
}

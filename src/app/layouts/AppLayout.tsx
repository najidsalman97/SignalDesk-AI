import type { ReactNode } from "react";

import Sidebar from "@/shared/components/Sidebar";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen">
      {/* Premium Background - Layered & Alive */}
      <div className="premium-bg" />
      <div className="noise-overlay" />

      {/* Floating Sidebar */}
      <Sidebar />

      {/* Main Content - Offset for sidebar */}
      <main className="ml-[17.5rem] min-h-screen">
        <div className="p-8 pt-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

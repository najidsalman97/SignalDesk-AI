import type { ReactNode } from "react";

import Sidebar from "@/shared/components/Sidebar";
import Navbar from "@/shared/components/Navbar";

interface Props {
  children: ReactNode;
}

export function AppLayout({
  children,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 overflow-auto p-8">

          {children}

        </main>

      </div>

    </div>
  );
}
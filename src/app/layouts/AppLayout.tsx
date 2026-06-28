import type { ReactNode } from "react";

import Sidebar from "@/shared/components/Sidebar";
import Navbar from "@/shared/components/Navbar";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#060816]" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-purple-950/10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-[1600px] mx-auto animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

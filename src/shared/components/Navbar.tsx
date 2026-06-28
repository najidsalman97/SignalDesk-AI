import { Link } from "react-router-dom";
import { Bell, Search, Settings } from "lucide-react";

import { useSettingsStore } from "@/store/settings.store";

export default function Navbar() {
  const { project } = useSettingsStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#060816]/80 backdrop-blur-xl px-6">
      {/* Left - Project selector */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-4 py-2 text-sm transition-all hover:bg-white/[0.08] border border-white/[0.06]">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
          <span className="font-medium text-white">{project || "Default Project"}</span>
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, reports, reviews..."
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white">
          <Bell size={18} />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-indigo-500">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          </span>
        </button>

        <Link
          to="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
        >
          <Settings size={18} />
        </Link>

        <div className="ml-2 h-8 w-px bg-white/[0.06]" />

        <button className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 px-3 py-2 transition-all hover:from-indigo-600/30 hover:to-purple-600/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25">
            SD
          </div>
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}

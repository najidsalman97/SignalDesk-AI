import { useSettingsStore } from "@/store/settings.store";

export default function Navbar() {
  const { project } = useSettingsStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#060816]/80 backdrop-blur-xl px-6">
      {/* Left - Project name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-4 py-2 text-sm border border-white/[0.06]">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
          <span className="font-medium text-white">{project || "Default Project"}</span>
        </div>
      </div>

      {/* Right - Minimal */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>SignalDesk AI</span>
        <span className="text-slate-600">•</span>
        <span className="text-indigo-400">v1.0</span>
      </div>
    </header>
  );
}

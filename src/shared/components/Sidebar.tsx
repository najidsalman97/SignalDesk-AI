import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { useSettingsStore } from "@/store/settings.store";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Sources",
    description: "Import Reviews",
    icon: Database,
    path: "/sources",
    step: 1,
  },
  {
    label: "Analysis",
    description: "AI Processing",
    icon: BrainCircuit,
    path: "/analysis",
    step: 2,
  },
  {
    label: "Reports",
    description: "Export & Share",
    icon: FileText,
    path: "/reports",
    step: 3,
  },
  {
    label: "Insights",
    description: "Deep Dive",
    icon: BarChart3,
    path: "/insights",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { items } = useReviewStore();
  const { result } = useAnalysisStore();
  const { providers } = useSettingsStore();

  const activeProvider = providers.find((p) => p.enabled);
  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  return (
    <aside
      className={clsx(
        "relative flex flex-col border-r border-white/[0.06] transition-all duration-300",
        "bg-gradient-to-b from-[#0a0f1a]/90 to-[#080d18]/95 backdrop-blur-xl",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <Sparkles size={22} className="text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        
        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="font-bold text-white tracking-tight">SignalDesk</h1>
            <span className="text-[11px] text-indigo-300/70 font-medium">AI Crisis Intel</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-3 pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isComplete =
            (item.path === "/sources" && hasReviews) ||
            (item.path === "/analysis" && hasAnalysis) ||
            (item.path === "/reports" && hasAnalysis);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white shadow-lg shadow-indigo-500/10"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                  )}
                  
                  {/* Step number or icon */}
                  {item.step ? (
                    <div className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all",
                      isActive 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30"
                        : isComplete
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-white/[0.06] text-slate-500"
                    )}>
                      {isComplete && !isActive ? "✓" : item.step}
                    </div>
                  ) : (
                    <div className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                      isActive 
                        ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/20"
                        : "bg-white/[0.04]"
                    )}>
                      <Icon size={18} className={isActive ? "text-indigo-300" : ""} />
                    </div>
                  )}

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                      )}
                    </div>
                  )}

                  {/* Arrow indicator on hover */}
                  {!collapsed && isActive && (
                    <ChevronRight size={16} className="text-indigo-400/60" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {/* AI Provider Status */}
        {!collapsed && (
          <div className="rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/30 p-3.5 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
                <Zap size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">AI Provider</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {activeProvider?.provider ?? "Not configured"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200",
              isActive
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            )
          }
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
            <Settings size={18} />
          </div>
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </NavLink>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-slate-500 transition-all hover:bg-white/[0.04] hover:text-white"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>

        {/* Help link */}
        {!collapsed && (
          <div className="pt-2 flex items-center justify-between px-1 text-xs text-slate-600">
            <span>Need Help?</span>
            <a href="#" className="flex items-center gap-1 text-slate-500 hover:text-indigo-400 transition-colors">
              View Documentation <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

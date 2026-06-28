import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  FileText,
  Sparkles,
  Zap,
  Plug,
  Settings,
  Activity,
} from "lucide-react";

import { NavLink, Link } from "react-router-dom";
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
    label: "Connectors",
    description: "Data Sources",
    icon: Plug,
    path: "/connectors",
  },
];

export default function Sidebar() {
  const { items } = useReviewStore();
  const { result } = useAnalysisStore();
  const { providers } = useSettingsStore();

  const activeProvider = providers.find((p) => p.enabled && p.connectionStatus === "connected");
  const connectedCount = providers.filter((p) => p.enabled && p.connectionStatus === "connected").length;
  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  return (
    <aside className="sidebar-floating">
      {/* Logo - Clickable to home */}
      <Link 
        to="/"
        className="flex items-center gap-3 p-5 pb-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
        data-testid="sidebar-logo"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
          <Sparkles size={20} className="text-white" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-white text-[15px] tracking-tight">SignalDesk</h1>
          <span className="text-[10px] text-blue-400/80 font-medium tracking-wide">AI CRISIS INTEL</span>
        </div>
      </Link>

      {/* Status Bar */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-[10px] font-medium text-slate-500 tracking-wide">
            {hasReviews ? `${items.length} reviews loaded` : "Ready to analyze"}
          </span>
          {hasAnalysis && (
            <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
              data-testid={`sidebar-link-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                clsx(
                  "sidebar-nav-item group",
                  isActive && "active"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Step number or icon */}
                  {item.step ? (
                    <div className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all",
                      isActive 
                        ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                        : isComplete
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/[0.04] text-slate-500"
                    )}>
                      {isComplete && !isActive ? "✓" : item.step}
                    </div>
                  ) : (
                    <div className={clsx(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                      isActive 
                        ? "bg-blue-500/15"
                        : "bg-white/[0.02]"
                    )}>
                      <Icon size={16} strokeWidth={1.5} className={isActive ? "text-blue-400" : ""} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className={clsx("text-sm", isActive ? "text-white" : "")}>{item.label}</span>
                    {item.description && (
                      <p className="text-[10px] text-slate-600 truncate">{item.description}</p>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section - AI Provider */}
      <div className="p-3 border-t border-white/[0.04]">
        <NavLink
          to="/settings"
          data-testid="sidebar-link-settings"
          className={({ isActive }) =>
            clsx(
              "block rounded-xl p-3 transition-all",
              isActive 
                ? "bg-white/[0.04] border border-blue-500/30"
                : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
            )
          }
        >
          <div className="flex items-center gap-3">
            <div className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
              activeProvider 
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-amber-500/10 border border-amber-500/20"
            )}>
              <Zap size={16} strokeWidth={1.5} className={activeProvider ? "text-emerald-400" : "text-amber-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">
                  {activeProvider ? "AI Active" : "Configure AI"}
                </span>
                {activeProvider && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {activeProvider 
                  ? `${activeProvider.provider}${connectedCount > 1 ? ` +${connectedCount - 1}` : ""}`
                  : "Click to setup"
                }
              </p>
            </div>
            <Settings size={14} strokeWidth={1.5} className="text-slate-600" />
          </div>
        </NavLink>

        {/* Version */}
        <div className="mt-3 px-1 text-center">
          <span className="text-[9px] text-slate-600 font-medium tracking-wider">v1.0.0 • BETA</span>
        </div>
      </div>
    </aside>
  );
}

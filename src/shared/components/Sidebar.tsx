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
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Sources",
    icon: Database,
    path: "/sources",
    step: 1,
  },
  {
    label: "Analysis",
    icon: BrainCircuit,
    path: "/analysis",
    step: 2,
  },
  {
    label: "Insights",
    icon: BarChart3,
    path: "/insights",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
    step: 3,
  },
];

const settingsItem = {
  label: "Settings",
  icon: Settings,
  path: "/settings",
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { items } = useReviewStore();
  const { result } = useAnalysisStore();

  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  return (
    <aside
      className={clsx(
        "flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center justify-between border-b px-5">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Sparkles size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold">SignalDesk</h1>
              <p className="text-xs text-muted-foreground">AI Crisis Intel</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles size={20} className="text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const showBadge =
            (item.path === "/sources" && hasReviews) ||
            (item.path === "/analysis" && hasAnalysis) ||
            (item.path === "/reports" && hasAnalysis);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent"
                )
              }
            >
              <Icon size={20} className="shrink-0" />

              {!collapsed && (
                <>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.step && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground group-[.bg-primary]:bg-primary-foreground/20 group-[.bg-primary]:text-primary-foreground">
                      {item.step}
                    </span>
                  )}
                  {showBadge && !item.step && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t p-3">
        <NavLink
          to={settingsItem.path}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-accent"
            )
          }
        >
          <Settings size={20} className="shrink-0" />
          {!collapsed && (
            <span className="font-medium">{settingsItem.label}</span>
          )}
        </NavLink>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

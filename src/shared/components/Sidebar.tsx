import {
  LayoutDashboard,
  Database,
  BrainCircuit,
  BarChart3,
  FileText,
  PlugZap,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Sources",
    icon: Database,
    path: "/sources",
  },
  {
    label: "Analysis",
    icon: BrainCircuit,
    path: "/analysis",
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
  },
  {
    label: "Integrations",
    icon: PlugZap,
    path: "/integrations",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-20 items-center justify-between border-b px-5">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">
              SignalDesk AI
            </h1>

            <p className="text-xs text-muted-foreground">
              Crisis Intelligence
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg border p-2 hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <div className="space-y-2 p-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )
              }
            >
              <Icon size={20} />

              {!collapsed && (
                <span className="font-medium">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
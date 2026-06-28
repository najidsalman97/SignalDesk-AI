/**
 * Premium Design System Components
 * Inspired by Linear, Vercel, Perplexity Pro, Cursor
 */

import { type ReactNode, forwardRef } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

// ============================================
// GLASS CARD
// ============================================

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "blue" | "purple" | "cyan" | "emerald" | "amber" | "rose";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow,
  padding = "lg",
  onClick,
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  const glowClasses = {
    blue: "hover:shadow-[0_0_60px_-20px_rgba(59,130,246,0.3)]",
    purple: "hover:shadow-[0_0_60px_-20px_rgba(139,92,246,0.3)]",
    cyan: "hover:shadow-[0_0_60px_-20px_rgba(6,182,212,0.3)]",
    emerald: "hover:shadow-[0_0_60px_-20px_rgba(16,185,129,0.3)]",
    amber: "hover:shadow-[0_0_60px_-20px_rgba(245,158,11,0.3)]",
    rose: "hover:shadow-[0_0_60px_-20px_rgba(244,63,94,0.3)]",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card",
        paddingClasses[padding],
        hover && "glass-panel-hover cursor-pointer",
        glow && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// METRIC TILE
// ============================================

interface MetricTileProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive?: boolean };
  color?: "blue" | "purple" | "cyan" | "emerald" | "amber" | "rose";
  subtitle?: string;
  className?: string;
}

export function MetricTile({
  label,
  value,
  icon,
  trend,
  color = "blue",
  subtitle,
  className,
}: MetricTileProps) {
  const colorClasses = {
    blue: {
      icon: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      glow: "--tile-glow: rgba(59, 130, 246, 0.3)",
    },
    purple: {
      icon: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      glow: "--tile-glow: rgba(139, 92, 246, 0.3)",
    },
    cyan: {
      icon: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      glow: "--tile-glow: rgba(6, 182, 212, 0.3)",
    },
    emerald: {
      icon: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      glow: "--tile-glow: rgba(16, 185, 129, 0.3)",
    },
    amber: {
      icon: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      glow: "--tile-glow: rgba(245, 158, 11, 0.3)",
    },
    rose: {
      icon: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glow: "--tile-glow: rgba(244, 63, 94, 0.3)",
    },
  };

  return (
    <div
      className={clsx("metric-tile group", className)}
      style={{ [colorClasses[color].glow.split(": ")[0]]: colorClasses[color].glow.split(": ")[1] } as any}
    >
      <div className="flex items-start justify-between">
        <div
          className={clsx(
            "icon-container",
            colorClasses[color].icon,
            "group-hover:scale-110 transition-transform duration-300"
          )}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={clsx(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.positive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-rose-500/10 text-rose-400"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="label-caps">{label}</p>
        <p className="metric-display text-4xl text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// GLOW BUTTON
// ============================================

interface GlowButtonProps {
  children: ReactNode;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
  "data-testid"?: string;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      icon,
      onClick,
      disabled,
      className,
      href,
      "data-testid": testId,
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 rounded-xl";

    const variantClasses = {
      default:
        "bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
      primary:
        "bg-gradient-to-r from-blue-600 to-blue-500 border border-blue-500/50 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]",
      ghost:
        "bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.05]",
    };

    const sizeClasses = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    if (href) {
      return (
        <Link to={href} className={classes} data-testid={testId}>
          {icon}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        data-testid={testId}
      >
        {icon}
        {children}
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";

// ============================================
// GRADIENT BADGE
// ============================================

interface GradientBadgeProps {
  children: ReactNode;
  variant?: "default" | "critical" | "high" | "medium" | "low" | "info";
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function GradientBadge({
  children,
  variant = "default",
  icon,
  size = "md",
  className,
}: GradientBadgeProps) {
  const variantClasses = {
    default: "gradient-badge",
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
    info: "bg-blue-500/10 border border-blue-500/30 text-blue-300",
  };

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// ============================================
// ICON CONTAINER
// ============================================

interface IconContainerProps {
  children: ReactNode;
  color?: "blue" | "purple" | "cyan" | "emerald" | "amber" | "rose" | "slate";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IconContainer({
  children,
  color = "blue",
  size = "md",
  className,
}: IconContainerProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    slate: "bg-slate-500/10 border-slate-500/20 text-slate-400",
  };

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-xl",
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center border transition-all duration-300",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <div>
        <h2 className="heading-section text-xl text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center py-16 px-8",
        className
      )}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

// ============================================
// TIMELINE
// ============================================

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon: ReactNode;
  status?: "completed" | "active" | "pending";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={clsx("space-y-1", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                item.status === "completed"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : item.status === "active"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-500"
              )}
            >
              {item.icon}
            </div>
            {index < items.length - 1 && (
              <div
                className={clsx(
                  "w-px flex-1 my-1",
                  item.status === "completed"
                    ? "bg-emerald-500/30"
                    : "bg-white/[0.06]"
                )}
              />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <p
                className={clsx(
                  "text-sm font-medium",
                  item.status === "completed"
                    ? "text-white"
                    : item.status === "active"
                    ? "text-blue-300"
                    : "text-slate-500"
                )}
              >
                {item.title}
              </p>
              {item.time && (
                <span className="text-[10px] text-slate-600">{item.time}</span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// ISSUE CARD
// ============================================

interface IssueCardProps {
  title: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  affectedCount?: number;
  rootCause?: string;
  action?: ReactNode;
  className?: string;
}

export function IssueCard({
  title,
  description,
  severity,
  affectedCount,
  rootCause,
  action,
  className,
}: IssueCardProps) {
  const severityColors = {
    Critical: {
      bar: "bg-gradient-to-b from-red-500 to-red-600",
      badge: "critical" as const,
    },
    High: {
      bar: "bg-gradient-to-b from-orange-500 to-orange-600",
      badge: "high" as const,
    },
    Medium: {
      bar: "bg-gradient-to-b from-amber-500 to-amber-600",
      badge: "medium" as const,
    },
    Low: {
      bar: "bg-gradient-to-b from-emerald-500 to-emerald-600",
      badge: "low" as const,
    },
  };

  return (
    <div
      className={clsx(
        "glass-card p-0 overflow-hidden group hover:border-white/[0.12] transition-all duration-300",
        className
      )}
    >
      <div className="flex">
        {/* Severity Strip */}
        <div className={clsx("w-1 flex-shrink-0", severityColors[severity].bar)} />
        
        {/* Content */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <GradientBadge variant={severityColors[severity].badge} size="sm">
                  {severity}
                </GradientBadge>
                {affectedCount && (
                  <span className="text-[10px] text-slate-500">
                    {affectedCount} affected
                  </span>
                )}
              </div>
              <h4 className="text-sm font-medium text-white mb-1 truncate">
                {title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
              {rootCause && (
                <p className="text-[10px] text-slate-500 mt-2 italic">
                  Root cause: {rootCause}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {action}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT CARD
// ============================================

interface ExportCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  format: string;
  onExport: () => void;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function ExportCard({
  title,
  description,
  icon,
  format,
  onExport,
  disabled,
  className,
  "data-testid": testId,
}: ExportCardProps) {
  return (
    <div
      className={clsx(
        "glass-card p-6 group cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onExport}
      data-testid={testId}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">{title}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-500 font-mono">
              {format}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.04]">
        <button
          disabled={disabled}
          className="w-full py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-slate-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-all duration-300"
        >
          Export {format}
        </button>
      </div>
    </div>
  );
}

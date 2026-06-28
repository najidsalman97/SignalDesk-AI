import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Clock,
  FileText,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import clsx from "clsx";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { useSettingsStore } from "@/store/settings.store";

const severityConfig = {
  Low: { bg: "from-emerald-500/20 to-emerald-600/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Medium: { bg: "from-amber-500/20 to-amber-600/10", text: "text-amber-400", border: "border-amber-500/30" },
  High: { bg: "from-orange-500/20 to-orange-600/10", text: "text-orange-400", border: "border-orange-500/30" },
  Critical: { bg: "from-red-500/20 to-red-600/10", text: "text-red-400", border: "border-red-500/30" },
};

function GlassCard({ children, className, hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl",
      hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-white/[0.12]",
      className
    )}>
      {children}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.Low;
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
      `bg-gradient-to-r ${config.bg} ${config.text} ${config.border}`
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity}
    </span>
  );
}

export default function Dashboard() {
  const { items, importedFiles } = useReviewStore();
  const { result } = useAnalysisStore();
  const { providers } = useSettingsStore();

  const activeProvider = providers.find((p) => p.enabled);
  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  // Empty state - no reviews
  if (!hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Monitor customer feedback, incidents and AI powered insights.</p>
        </div>

        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 p-6 border border-indigo-500/20">
            <Upload size={40} className="text-indigo-400" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Get Started with SignalDesk</h2>
          <p className="mt-3 max-w-md text-center text-slate-400">
            Import customer reviews from CSV, Excel, JSON, or paste them directly.
            Then let AI analyze the feedback and generate actionable insights.
          </p>
          <Link to="/sources" className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
            <Upload size={20} />
            Import Reviews
            <ArrowRight size={18} />
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Reviews but no analysis
  if (hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Monitor customer feedback, incidents and AI powered insights.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <GlassCard hover className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reviews Imported</p>
                <p className="mt-2 text-3xl font-bold text-white">{items.length}</p>
                <p className="mt-1 text-xs text-slate-500">From {importedFiles} file{importedFiles !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
                <BarChart3 size={22} className="text-blue-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Provider</p>
                <p className="mt-2 text-2xl font-bold text-white capitalize">{activeProvider?.provider ?? "Not configured"}</p>
                <p className="mt-1 text-xs text-slate-500">{activeProvider?.model || "Go to Settings"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
                <BrainCircuit size={22} className="text-purple-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Analysis Status</p>
                <p className="mt-2 text-2xl font-bold text-amber-400">Pending</p>
                <p className="mt-1 text-xs text-slate-500">Ready for analysis</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
                <Clock size={22} className="text-amber-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 p-6 border border-violet-500/20">
            <Sparkles size={40} className="text-violet-400" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Ready to Analyze</h2>
          <p className="mt-3 max-w-md text-center text-slate-400">
            You have {items.length} reviews imported. Run AI analysis to discover
            issues, generate Jira tickets, and create customer communications.
          </p>
          <Link to="/analysis" className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
            <BrainCircuit size={20} />
            Start AI Analysis
            <ArrowRight size={18} />
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Full dashboard with analysis
  const criticalIssues = result!.topIssues.filter(i => i.severity === "Critical").length;
  const highIssues = result!.topIssues.filter(i => i.severity === "High").length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">Monitor customer feedback, incidents and AI powered insights.</p>
        </div>
        <Link to="/reports" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
          <FileText size={18} />
          Export Reports
        </Link>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reviews Analyzed</p>
              <p className="mt-2 text-4xl font-bold text-white">{items.length}</p>
              <p className="mt-1 text-xs text-slate-500">From {importedFiles} file{importedFiles !== 1 ? "s" : ""}</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
              <Users size={22} className="text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Severity</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={clsx(
                  "text-3xl font-bold",
                  result!.severity === "Critical" ? "text-red-400" :
                  result!.severity === "High" ? "text-orange-400" :
                  result!.severity === "Medium" ? "text-amber-400" : "text-emerald-400"
                )}>{result!.severity}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{criticalIssues} critical, {highIssues} high</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
              <AlertTriangle size={22} className="text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Severity Score</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{result!.severityScore}</span>
                <span className="text-lg text-slate-500">/100</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div 
                  className={clsx("h-full rounded-full transition-all duration-700",
                    result!.severityScore >= 80 ? "bg-gradient-to-r from-red-500 to-red-400" :
                    result!.severityScore >= 60 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                    result!.severityScore >= 40 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  )}
                  style={{ width: `${result!.severityScore}%` }}
                />
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
              <TrendingUp size={22} className="text-cyan-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Provider</p>
              <p className="mt-2 text-2xl font-bold text-white capitalize">{activeProvider?.provider ?? "—"}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
              <Sparkles size={22} className="text-purple-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-5 md:grid-cols-3">
        <GlassCard hover className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
                <AlertTriangle size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{result!.topIssues.length}</p>
                <p className="text-xs text-slate-500">Top Issues</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                <TicketCheck size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{result!.jiraTickets.length}</p>
                <p className="text-xs text-slate-500">Jira Tickets</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20">
                <FileText size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">1</p>
                <p className="text-xs text-slate-500">Reports Ready</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Two Column */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Executive Summary */}
        <GlassCard className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20">
                <FileText size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
            </div>
            <Link to="/analysis" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Full Analysis <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-slate-300 leading-relaxed line-clamp-4">{result!.executiveSummary}</p>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
              <Zap size={20} className="text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Quick Actions</h3>
          </div>
          
          <div className="space-y-2">
            {[
              { label: "View Full Analysis", to: "/analysis", icon: BrainCircuit },
              { label: "Export Reports", to: "/reports", icon: FileText },
              { label: "Import More Reviews", to: "/sources", icon: Upload },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04] hover:border-white/[0.1] group">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                    <action.icon size={16} className="text-slate-400" />
                  </div>
                  <span className="font-medium text-white text-sm">{action.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Top Issues Preview */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
              <AlertTriangle size={20} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Top Issues</h3>
          </div>
          <Link to="/analysis" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All {result!.topIssues.length} Issues <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {result!.topIssues.slice(0, 3).map((issue, index) => (
            <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold",
                    issue.severity === "Critical" ? "bg-red-500/20 text-red-400" :
                    issue.severity === "High" ? "bg-orange-500/20 text-orange-400" :
                    issue.severity === "Medium" ? "bg-amber-500/20 text-amber-400" :
                    "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-white text-sm line-clamp-1">{issue.title}</h4>
                </div>
              </div>
              <SeverityBadge severity={issue.severity} />
              <p className="mt-3 text-sm text-slate-400 line-clamp-2">{issue.description}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                <Users size={12} />
                {issue.affectedCount} affected
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

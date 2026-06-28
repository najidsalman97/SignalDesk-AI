import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Clock,
  FileText,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import clsx from "clsx";

import MetricCard from "@/shared/components/MetricCard";
import PageHeader from "@/shared/components/PageHeader";
import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { useSettingsStore } from "@/store/settings.store";

const severityColors = {
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

const severityBadgeColors = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        severityColors[severity as keyof typeof severityColors] ||
          severityColors.Low
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          severityBadgeColors[severity as keyof typeof severityBadgeColors] ||
            severityBadgeColors.Low
        )}
      />
      {severity}
    </span>
  );
}

function SeverityMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-4xl font-bold tracking-tight">{score}</span>
        <span className="pb-0.5 text-sm text-muted-foreground">/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", getColor())}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { items, importedFiles } = useReviewStore();
  const { result } = useAnalysisStore();
  const { providers } = useSettingsStore();

  const activeProvider = providers.find((p) => p.enabled);
  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  // Empty state - no reviews imported
  if (!hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-10" data-testid="dashboard-empty">
        <PageHeader
          title="Dashboard"
          description="Monitor customer feedback, incidents and AI powered insights."
        />

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20">
          <div className="rounded-full bg-primary/10 p-6">
            <Upload size={40} className="text-primary" />
          </div>
          <h2 className="mt-8 text-2xl font-bold">Get Started with SignalDesk</h2>
          <p className="mt-3 max-w-md text-center text-muted-foreground">
            Import customer reviews from CSV, Excel, JSON, or paste them directly.
            Then let AI analyze the feedback and generate actionable insights.
          </p>
          <Link
            to="/sources"
            data-testid="go-to-sources-btn"
            className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <Upload size={20} />
            Import Reviews
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Reviews imported but no analysis yet
  if (hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-10" data-testid="dashboard-no-analysis">
        <PageHeader
          title="Dashboard"
          description="Monitor customer feedback, incidents and AI powered insights."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Reviews Imported"
            value={items.length}
            subtitle={`From ${importedFiles} file${importedFiles !== 1 ? "s" : ""}`}
            icon={BarChart3}
            color="text-blue-500"
          />
          <MetricCard
            title="AI Provider"
            value={activeProvider?.provider ?? "Not configured"}
            subtitle={activeProvider?.model || "Go to Settings"}
            icon={BrainCircuit}
            color="text-violet-500"
          />
          <MetricCard
            title="Analysis Status"
            value="Pending"
            subtitle="Ready for analysis"
            icon={Clock}
            color="text-amber-500"
          />
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-16">
          <div className="rounded-full bg-violet-500/10 p-6">
            <Sparkles size={40} className="text-violet-500" />
          </div>
          <h2 className="mt-8 text-2xl font-bold">Ready to Analyze</h2>
          <p className="mt-3 max-w-md text-center text-muted-foreground">
            You have {items.length} reviews imported. Run AI analysis to discover
            issues, generate Jira tickets, and create customer communications.
          </p>
          <Link
            to="/analysis"
            data-testid="go-to-analysis-btn"
            className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <BrainCircuit size={20} />
            Start AI Analysis
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Has analysis results - show full dashboard
  const criticalIssues = result!.topIssues.filter(
    (i) => i.severity === "Critical"
  ).length;
  const highIssues = result!.topIssues.filter(
    (i) => i.severity === "High"
  ).length;

  return (
    <div className="space-y-10" data-testid="dashboard-with-analysis">
      <PageHeader
        title="Dashboard"
        description="Monitor customer feedback, incidents and AI powered insights."
      />

      {/* Primary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Reviews Imported"
          value={items.length}
          subtitle={`From ${importedFiles} file${importedFiles !== 1 ? "s" : ""}`}
          icon={BarChart3}
          color="text-blue-500"
        />

        <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid="kpi-severity">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Severity</p>
              <div className="mt-3">
                <SeverityBadge severity={result!.severity} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {criticalIssues} critical, {highIssues} high
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3 text-orange-500">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" data-testid="kpi-severity-score">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Severity Score</p>
              <div className="mt-2">
                <SeverityMeter score={result!.severityScore} />
              </div>
            </div>
            <div className="rounded-xl bg-muted p-3 text-red-500">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <MetricCard
          title="AI Provider"
          value={activeProvider?.provider ?? "—"}
          subtitle={activeProvider?.model || ""}
          icon={BrainCircuit}
          color="text-violet-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Top Issues"
          value={result!.topIssues.length}
          subtitle="Issues identified"
          icon={AlertTriangle}
          color="text-orange-500"
        />
        <MetricCard
          title="Jira Tickets"
          value={result!.jiraTickets.length}
          subtitle="Ready to create"
          icon={TicketCheck}
          color="text-violet-500"
        />
        <MetricCard
          title="Reports"
          value="1"
          subtitle="Analysis complete"
          icon={FileText}
          color="text-emerald-500"
        />
      </div>

      {/* Executive Summary */}
      <div className="rounded-2xl border bg-card p-6" data-testid="executive-summary-preview">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <FileText size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Executive Summary</h3>
          </div>
          <Link
            to="/analysis"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View Full Analysis
            <ArrowRight size={16} />
          </Link>
        </div>
        <p className="mt-4 line-clamp-3 text-muted-foreground">
          {result!.executiveSummary}
        </p>
      </div>

      {/* Top 3 Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Top Issues</h3>
          <Link
            to="/analysis"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All {result!.topIssues.length} Issues
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3" data-testid="top-issues-preview">
          {result!.topIssues.slice(0, 3).map((issue, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold line-clamp-1">{issue.title}</h4>
                </div>
                <SeverityBadge severity={issue.severity} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {issue.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {issue.affectedCount} affected
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/analysis"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent"
        >
          <BrainCircuit size={18} />
          View Full Analysis
        </Link>
        <Link
          to="/reports"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent"
        >
          <FileText size={18} />
          Export Reports
        </Link>
        <Link
          to="/sources"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent"
        >
          <Upload size={18} />
          Import More Reviews
        </Link>
      </div>
    </div>
  );
}

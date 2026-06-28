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
  CheckCircle,
  Activity,
  Play,
} from "lucide-react";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { useSettingsStore } from "@/store/settings.store";
import {
  GlassCard,
  MetricTile,
  GlowButton,
  GradientBadge,
  IconContainer,
  SectionHeader,
  EmptyState,
  Timeline,
  IssueCard,
} from "@/shared/components/premium";

export default function Dashboard() {
  const { items, importedFiles } = useReviewStore();
  const { result, stats } = useAnalysisStore();
  const { providers } = useSettingsStore();

  const activeProvider = providers.find((p) => p.enabled && p.connectionStatus === "connected");
  const hasReviews = items.length > 0;
  const hasAnalysis = result !== null;

  // Empty state - no reviews
  if (!hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto pt-8">
          <GradientBadge icon={<Sparkles size={12} />} className="mb-4">
            AI-Powered Analysis
          </GradientBadge>
          <h1 className="heading-display text-4xl sm:text-5xl text-white mb-4">
            Welcome to <span className="gradient-text">SignalDesk</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Transform customer feedback into actionable insights with AI-powered crisis intelligence.
          </p>
        </div>

        <GlassCard className="max-w-xl mx-auto" padding="xl">
          <EmptyState
            icon={<Upload size={32} className="text-slate-500" strokeWidth={1.5} />}
            title="Start Your Analysis"
            description="Import customer reviews from CSV, Excel, JSON, or use our demo data to explore SignalDesk's powerful AI analysis."
            action={
              <div className="flex flex-col sm:flex-row gap-3">
                <GlowButton
                  variant="primary"
                  size="lg"
                  href="/sources"
                  icon={<Upload size={18} />}
                  data-testid="dashboard-import-btn"
                >
                  Import Reviews
                </GlowButton>
                <GlowButton
                  variant="default"
                  size="lg"
                  href="/sources"
                  icon={<Play size={18} />}
                  data-testid="dashboard-demo-btn"
                >
                  Try Demo Data
                </GlowButton>
              </div>
            }
          />
        </GlassCard>
      </div>
    );
  }

  // Reviews but no analysis
  if (hasReviews && !hasAnalysis) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <GradientBadge icon={<Activity size={12} />} className="mb-3">
            Ready for Analysis
          </GradientBadge>
          <h1 className="heading-display text-3xl sm:text-4xl text-white">
            {items.length} Reviews Loaded
          </h1>
          <p className="text-slate-500 mt-2">Run AI analysis to discover issues and generate insights.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <MetricTile
            label="Reviews Imported"
            value={items.length}
            icon={<BarChart3 size={20} strokeWidth={1.5} />}
            color="blue"
            subtitle={`From ${importedFiles} file${importedFiles !== 1 ? "s" : ""}`}
          />
          <MetricTile
            label="AI Provider"
            value={activeProvider?.provider ?? "—"}
            icon={<BrainCircuit size={20} strokeWidth={1.5} />}
            color="purple"
            subtitle={activeProvider?.model || "Not configured"}
          />
          <MetricTile
            label="Status"
            value="Pending"
            icon={<Clock size={20} strokeWidth={1.5} />}
            color="amber"
            subtitle="Ready for analysis"
          />
        </div>

        <GlassCard padding="xl">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Sparkles size={28} className="text-blue-400" strokeWidth={1.5} />
            </div>
            <h2 className="heading-section text-2xl text-white mb-3">Ready to Analyze</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Our AI will analyze {items.length} reviews to discover issues, generate Jira tickets, and create customer communications.
            </p>
            <GlowButton
              variant="primary"
              size="lg"
              href="/analysis"
              icon={<BrainCircuit size={20} />}
              data-testid="dashboard-analyze-btn"
            >
              Start AI Analysis
            </GlowButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Full dashboard with analysis
  const criticalIssues = result!.topIssues.filter(i => i.severity === "Critical").length;
  const highIssues = result!.topIssues.filter(i => i.severity === "High").length;

  const timelineItems = [
    {
      id: "1",
      title: "Reviews Imported",
      description: `${items.length} reviews from ${importedFiles} source${importedFiles !== 1 ? "s" : ""}`,
      icon: <Upload size={14} strokeWidth={1.5} />,
      status: "completed" as const,
    },
    {
      id: "2",
      title: "AI Analysis Complete",
      description: stats ? `Processed in ${Math.round(stats.elapsedMs / 1000)}s` : "Analysis complete",
      icon: <BrainCircuit size={14} strokeWidth={1.5} />,
      status: "completed" as const,
    },
    {
      id: "3",
      title: `${result!.topIssues.length} Issues Identified`,
      description: `${criticalIssues} critical, ${highIssues} high priority`,
      icon: <AlertTriangle size={14} strokeWidth={1.5} />,
      status: "completed" as const,
    },
    {
      id: "4",
      title: "Reports Generated",
      description: "Ready for export",
      icon: <FileText size={14} strokeWidth={1.5} />,
      status: "completed" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GradientBadge icon={<CheckCircle size={12} />} variant="low">
              Analysis Complete
            </GradientBadge>
          </div>
          <h1 className="heading-display text-3xl sm:text-4xl text-white">
            Executive Dashboard
          </h1>
          <p className="text-slate-500 mt-1">AI-powered insights from {items.length} customer reviews</p>
        </div>
        <GlowButton
          variant="primary"
          href="/reports"
          icon={<FileText size={18} />}
          data-testid="dashboard-export-btn"
        >
          Export Reports
        </GlowButton>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Reviews Analyzed"
          value={items.length}
          icon={<Users size={20} strokeWidth={1.5} />}
          color="blue"
          trend={{ value: "100%", positive: true }}
          subtitle={`${importedFiles} source${importedFiles !== 1 ? "s" : ""}`}
        />
        <MetricTile
          label="Overall Severity"
          value={result!.severity}
          icon={<AlertTriangle size={20} strokeWidth={1.5} />}
          color={result!.severity === "Critical" ? "rose" : result!.severity === "High" ? "amber" : "emerald"}
          subtitle={`${criticalIssues} critical, ${highIssues} high`}
        />
        <MetricTile
          label="Severity Score"
          value={`${result!.severityScore}/100`}
          icon={<TrendingUp size={20} strokeWidth={1.5} />}
          color={result!.severityScore >= 70 ? "rose" : result!.severityScore >= 40 ? "amber" : "emerald"}
          subtitle="Based on issue analysis"
        />
        <MetricTile
          label="AI Provider"
          value={activeProvider?.provider ?? "—"}
          icon={<Sparkles size={20} strokeWidth={1.5} />}
          color="purple"
          subtitle="Active"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Executive Summary - Large Hero Card */}
        <GlassCard className="lg:col-span-8" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <IconContainer color="blue" size="md">
              <FileText size={18} strokeWidth={1.5} />
            </IconContainer>
            <div>
              <h3 className="heading-section text-lg text-white">Executive Summary</h3>
              <p className="text-xs text-slate-500">AI-generated analysis overview</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
            <p className="pl-5 text-slate-300 leading-relaxed text-[15px]">
              {result!.executiveSummary}
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TicketCheck size={14} />
                {result!.jiraTickets.length} tickets generated
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <AlertTriangle size={14} />
                {result!.topIssues.length} issues identified
              </div>
            </div>
            <GlowButton variant="ghost" href="/analysis" icon={<ArrowRight size={14} />}>
              View Details
            </GlowButton>
          </div>
        </GlassCard>

        {/* Activity Timeline */}
        <GlassCard className="lg:col-span-4" padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <IconContainer color="emerald" size="md">
              <Activity size={18} strokeWidth={1.5} />
            </IconContainer>
            <div>
              <h3 className="heading-section text-lg text-white">Activity</h3>
              <p className="text-xs text-slate-500">Analysis timeline</p>
            </div>
          </div>
          <Timeline items={timelineItems} />
        </GlassCard>
      </div>

      {/* Top Issues */}
      <div>
        <SectionHeader
          title="Top Issues"
          subtitle={`${result!.topIssues.length} issues require attention`}
          action={
            <GlowButton variant="ghost" href="/analysis" icon={<ChevronRight size={14} />}>
              View All
            </GlowButton>
          }
          className="mb-5"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result!.topIssues.slice(0, 6).map((issue, index) => (
            <IssueCard
              key={index}
              title={issue.title}
              description={issue.description}
              severity={issue.severity}
              affectedCount={issue.affectedCount}
              rootCause={issue.rootCause}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: "Full Analysis", desc: "View complete report", to: "/analysis", icon: BrainCircuit, color: "blue" as const },
          { label: "Export Reports", desc: "PDF, Markdown, JSON", to: "/reports", icon: FileText, color: "purple" as const },
          { label: "Import More", desc: "Add more reviews", to: "/sources", icon: Upload, color: "cyan" as const },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="glass-card p-5 group"
          >
            <div className="flex items-center gap-4">
              <IconContainer color={action.color} size="lg">
                <action.icon size={22} strokeWidth={1.5} />
              </IconContainer>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">{action.label}</h4>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
              <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

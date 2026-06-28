import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Radio,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import clsx from "clsx";

import { analyzeReviews } from "@/services/ai/providerFactory";
import { chunkReviews } from "@/services/ai/reviewChunker";
import { getActiveProvider } from "@/services/ai/provider";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";

import PageHeader from "@/shared/components/PageHeader";
import MetricCard from "@/shared/components/MetricCard";
import EmptyState from "@/shared/components/EmptyState";

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
        <span className="text-5xl font-bold tracking-tight">{score}</span>
        <span className="pb-1 text-sm text-muted-foreground">/100</span>
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

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-accent/50"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Icon size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {badge}
        </div>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="border-t px-6 pb-6 pt-4">{children}</div>}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
    >
      {copied ? (
        <>
          <CheckCircle2 size={14} className="text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy
        </>
      )}
    </button>
  );
}

function TextBlock({ content, label }: { content: string; label?: string }) {
  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <CopyButton text={content} />
        </div>
      )}
      <div className="whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

export default function Analysis() {
  const { items } = useReviewStore();
  const {
    result,
    loading,
    error,
    setLoading,
    setResult,
    setError,
  } = useAnalysisStore();

  let provider = null;
  try {
    provider = getActiveProvider();
  } catch {}

  async function handleAnalyze() {
    try {
      setLoading(true);
      const chunks = chunkReviews(items);

      if (chunks.length > 1) {
        console.log(`Created ${chunks.length} analysis chunks`);
      }

      const response = await analyzeReviews(chunks[0].reviews);
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  // No reviews state
  if (items.length === 0 && !result) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="AI Analysis"
          description="Generate executive crisis reports powered by AI."
        />
        <EmptyState
          title="No reviews to analyze"
          description="Import customer feedback from the Sources page to begin AI-powered analysis."
        />
      </div>
    );
  }

  // Ready to analyze state
  if (!result && !loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="AI Analysis"
          description="Generate executive crisis reports powered by AI."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Reviews Ready"
            value={items.length}
            subtitle="Imported and ready for analysis"
            icon={BarChart3}
            color="text-blue-500"
          />
          <MetricCard
            title="AI Provider"
            value={provider?.provider ?? "Not configured"}
            subtitle={provider?.model || "Go to Settings to configure"}
            icon={BrainCircuit}
            color="text-violet-500"
          />
          <MetricCard
            title="Estimated Time"
            value="~30s"
            subtitle="Depending on review count"
            icon={Clock}
            color="text-amber-500"
          />
        </div>

        {!provider && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-500/10 p-3">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">AI Provider Required</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure an AI provider in Settings before running analysis.
                  Supported providers: Gemini, OpenAI, OpenRouter.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          disabled={loading || !provider || items.length === 0}
          onClick={handleAnalyze}
          data-testid="start-analysis-btn"
          className="group flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
        >
          <Sparkles size={24} className="transition-transform group-hover:rotate-12" />
          Start AI Analysis
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="AI Analysis"
          description="Generate executive crisis reports powered by AI."
        />

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <BrainCircuit
              size={28}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
            />
          </div>
          <h2 className="mt-8 text-2xl font-bold">Analyzing Reviews</h2>
          <p className="mt-2 text-muted-foreground">
            AI is processing {items.length} reviews...
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Radio size={14} className="animate-pulse text-primary" />
            Clustering issues and generating insights
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="AI Analysis"
          description="Generate executive crisis reports powered by AI."
        />

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/10 p-3">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-600">Analysis Failed</h3>
              <p className="mt-2 text-sm">{error}</p>
              <button
                onClick={handleAnalyze}
                className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results state
  if (!result) return null;

  return (
    <div className="space-y-8" data-testid="analysis-results">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Analysis Results"
          description="AI-powered insights from your customer feedback."
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            data-testid="reanalyze-btn"
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent"
          >
            <Zap size={18} />
            Re-analyze
          </button>
          <button
            data-testid="export-btn"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="kpi-cards">
        <div className="rounded-2xl border bg-card p-6" data-testid="kpi-reviews-analyzed">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Reviews Analyzed</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <p className="mt-3 text-4xl font-bold">{items.length}</p>
        </div>

        <div className="rounded-2xl border bg-card p-6" data-testid="kpi-severity">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Severity</span>
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <div className="mt-3">
            <SeverityBadge severity={result.severity} />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6" data-testid="kpi-severity-score">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Severity Score</span>
            <TrendingUp size={18} className="text-red-500" />
          </div>
          <div className="mt-1">
            <SeverityMeter score={result.severityScore} />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Provider</span>
            <BrainCircuit size={18} className="text-violet-500" />
          </div>
          <p className="mt-3 text-2xl font-bold capitalize">
            {provider?.provider ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">{provider?.model}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <CollapsibleSection title="Executive Summary" icon={FileText}>
        <p className="text-base leading-7 text-foreground/90">
          {result.executiveSummary}
        </p>
      </CollapsibleSection>

      {/* Top Issues */}
      <CollapsibleSection
        title="Top Issues"
        icon={AlertTriangle}
        badge={
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {result.topIssues.length}
          </span>
        }
      >
        <div className="space-y-4">
          {result.topIssues.map((issue, index) => (
            <div
              key={index}
              className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold">{issue.title}</h4>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {issue.description}
                  </p>
                </div>
                <SeverityBadge severity={issue.severity} />
              </div>

              <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Affected Users
                  </span>
                  <p className="mt-1 font-semibold">{issue.affectedCount}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Root Cause
                  </span>
                  <p className="mt-1 text-sm">{issue.rootCause}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended Fix
                  </span>
                  <p className="mt-1 text-sm">{issue.recommendedFix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Jira Tickets */}
      <CollapsibleSection
        title="Engineering Tickets"
        icon={TicketCheck}
        badge={
          <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600">
            {result.jiraTickets.length}
          </span>
        }
      >
        <div className="space-y-4">
          {result.jiraTickets.map((ticket, index) => (
            <div
              key={index}
              className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <TicketCheck size={16} className="text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{ticket.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      SIGNAL-{String(index + 1).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <SeverityBadge severity={ticket.priority} />
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {ticket.description}
              </p>

              {ticket.acceptanceCriteria.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Acceptance Criteria
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {ticket.acceptanceCriteria.map((criteria, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Customer Communications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <CollapsibleSection title="Customer Email" icon={Mail} defaultOpen={false}>
          <TextBlock content={result.customerEmail} />
        </CollapsibleSection>

        <CollapsibleSection title="Status Page" icon={Radio} defaultOpen={false}>
          <TextBlock content={result.statusPageUpdate} />
        </CollapsibleSection>

        <CollapsibleSection title="Social Media" icon={MessageSquare} defaultOpen={false}>
          <TextBlock content={result.socialMediaUpdate} />
        </CollapsibleSection>
      </div>

      {/* Next Steps */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Analysis Complete!</h3>
            <p className="text-sm text-muted-foreground">
              View your dashboard or export reports
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/reports"
            className="flex items-center gap-2 rounded-xl border px-5 py-2.5 font-medium transition-colors hover:bg-accent"
          >
            <Download size={18} />
            Export Reports
          </Link>
          <Link
            to="/dashboard"
            data-testid="go-to-dashboard-btn"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            View Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

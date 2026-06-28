import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

import PageHeader from "@/shared/components/PageHeader";
import { useAnalysisStore } from "@/store/analysis.store";

export default function Insights() {
  const { result } = useAnalysisStore();

  // Empty state
  if (!result) {
    return (
      <div className="space-y-10" data-testid="insights-empty">
        <PageHeader
          title="Insights"
          description="Discover trends and patterns in customer feedback."
        />

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20">
          <div className="rounded-full bg-primary/10 p-6">
            <BarChart3 size={40} className="text-primary" />
          </div>
          <h2 className="mt-8 text-2xl font-bold">No Insights Yet</h2>
          <p className="mt-3 max-w-md text-center text-muted-foreground">
            Run AI analysis to generate insights about customer sentiment,
            issue trends, and areas for improvement.
          </p>
          <Link
            to="/analysis"
            data-testid="go-to-analysis-btn"
            className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <BrainCircuit size={20} />
            Go to Analysis
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Has analysis - show insights preview
  const criticalCount = result.topIssues.filter(i => i.severity === "Critical").length;
  const highCount = result.topIssues.filter(i => i.severity === "High").length;
  const mediumCount = result.topIssues.filter(i => i.severity === "Medium").length;
  const lowCount = result.topIssues.filter(i => i.severity === "Low").length;

  return (
    <div className="space-y-10" data-testid="insights-ready">
      <PageHeader
        title="Insights"
        description="Discover trends and patterns in customer feedback."
      />

      {/* Severity Distribution */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">Issue Severity Distribution</h3>
        <div className="mt-6 flex h-8 overflow-hidden rounded-full">
          {criticalCount > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(criticalCount / result.topIssues.length) * 100}%` }}
              title={`Critical: ${criticalCount}`}
            />
          )}
          {highCount > 0 && (
            <div
              className="bg-orange-500 transition-all"
              style={{ width: `${(highCount / result.topIssues.length) * 100}%` }}
              title={`High: ${highCount}`}
            />
          )}
          {mediumCount > 0 && (
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(mediumCount / result.topIssues.length) * 100}%` }}
              title={`Medium: ${mediumCount}`}
            />
          )}
          {lowCount > 0 && (
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(lowCount / result.topIssues.length) * 100}%` }}
              title={`Low: ${lowCount}`}
            />
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            Critical: {criticalCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            High: {highCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            Medium: {mediumCount}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            Low: {lowCount}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <TrendingUp size={20} className="text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground">Severity Score</span>
          </div>
          <p className="mt-4 text-4xl font-bold">{result.severityScore}/100</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-2.5">
              <BarChart3 size={20} className="text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Affected</span>
          </div>
          <p className="mt-4 text-4xl font-bold">
            {result.topIssues.reduce((sum, i) => sum + i.affectedCount, 0)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2.5">
              <BrainCircuit size={20} className="text-violet-500" />
            </div>
            <span className="text-sm text-muted-foreground">Action Items</span>
          </div>
          <p className="mt-4 text-4xl font-bold">{result.jiraTickets.length}</p>
        </div>
      </div>

      {/* Link to full analysis */}
      <div className="flex justify-center">
        <Link
          to="/analysis"
          className="flex items-center gap-2 rounded-xl border px-6 py-3 font-medium transition-colors hover:bg-accent"
        >
          View Full Analysis
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

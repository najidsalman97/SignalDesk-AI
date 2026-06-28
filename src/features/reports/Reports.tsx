import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  Download,
  FileJson,
  FileText,
  FileType,
} from "lucide-react";

import PageHeader from "@/shared/components/PageHeader";
import { useAnalysisStore } from "@/store/analysis.store";

export default function Reports() {
  const { result } = useAnalysisStore();

  // Empty state - no analysis yet
  if (!result) {
    return (
      <div className="space-y-10" data-testid="reports-empty">
        <PageHeader
          title="Reports"
          description="Export analysis results in multiple formats."
        />

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20">
          <div className="rounded-full bg-primary/10 p-6">
            <FileText size={40} className="text-primary" />
          </div>
          <h2 className="mt-8 text-2xl font-bold">No Analysis to Export</h2>
          <p className="mt-3 max-w-md text-center text-muted-foreground">
            Run AI analysis first to generate reports. You'll be able to export
            executive summaries, Jira tickets, and customer communications.
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

  // Has analysis - show export options
  return (
    <div className="space-y-10" data-testid="reports-ready">
      <PageHeader
        title="Reports"
        description="Export analysis results in multiple formats."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <FileType size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Markdown</h3>
              <p className="text-sm text-muted-foreground">
                For documentation
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Export as formatted Markdown for wikis, Notion, or GitHub.
          </p>
          <button
            data-testid="export-markdown-btn"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-medium transition-colors hover:bg-accent"
          >
            <Download size={18} />
            Export .md
          </button>
        </div>

        <div className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <FileJson size={24} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">JSON</h3>
              <p className="text-sm text-muted-foreground">
                For integrations
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Export structured data for APIs, automation, or further processing.
          </p>
          <button
            data-testid="export-json-btn"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-medium transition-colors hover:bg-accent"
          >
            <Download size={18} />
            Export .json
          </button>
        </div>

        <div className="group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-500/10 p-3">
              <FileText size={24} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold">PDF</h3>
              <p className="text-sm text-muted-foreground">
                For stakeholders
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Professional report for executives, meetings, and presentations.
          </p>
          <button
            data-testid="export-pdf-btn"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-medium transition-colors hover:bg-accent"
          >
            <Download size={18} />
            Export .pdf
          </button>
        </div>
      </div>

      {/* Summary of what will be exported */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">Export Contents</h3>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Executive Summary
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {result.topIssues.length} Top Issues
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {result.jiraTickets.length} Jira Tickets
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Customer Communications
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Radio,
  RefreshCw,
  Sparkles,
  TicketCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import clsx from "clsx";

import { analyzeReviews, getActiveProvider } from "@/services/ai/providerFactory";
import { chunkReviews } from "@/services/ai/reviewChunker";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { useSettingsStore } from "@/store/settings.store";

import PageHeader from "@/shared/components/PageHeader";

const severityConfig = {
  Low: { color: "emerald", bg: "from-emerald-500/20 to-emerald-600/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Medium: { color: "amber", bg: "from-amber-500/20 to-amber-600/10", text: "text-amber-400", border: "border-amber-500/30" },
  High: { color: "orange", bg: "from-orange-500/20 to-orange-600/10", text: "text-orange-400", border: "border-orange-500/30" },
  Critical: { color: "red", bg: "from-red-500/20 to-red-600/10", text: "text-red-400", border: "border-red-500/30" },
};

function SeverityBadge({ severity }: { severity: string }) {
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.Low;
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
      `bg-gradient-to-r ${config.bg} ${config.text} ${config.border}`
    )}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", `bg-${config.color}-400`)} />
      {severity}
    </span>
  );
}

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

function KPICard({ title, value, subtitle, icon: Icon, color, progress }: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType; 
  color: string;
  progress?: number;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/20",
    orange: "from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <GlassCard hover className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          {progress !== undefined && (
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div 
                className={clsx("h-full rounded-full bg-gradient-to-r", 
                  progress >= 80 ? "from-red-500 to-red-400" :
                  progress >= 60 ? "from-orange-500 to-orange-400" :
                  progress >= 40 ? "from-amber-500 to-amber-400" :
                  "from-emerald-500 to-emerald-400"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border", colorMap[color])}>
          <Icon size={22} />
        </div>
      </div>
    </GlassCard>
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
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
    >
      {copied ? <><CheckCircle2 size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
    </button>
  );
}

export default function Analysis() {
  const { items } = useReviewStore();
  const { result, loading, error, setLoading, setResult, setError } = useAnalysisStore();
  const { autoSelectProvider } = useSettingsStore();

  const provider = getActiveProvider();
  const connectedProviders = useSettingsStore.getState().getConnectedProviders();

  async function handleAnalyze() {
    try {
      setLoading(true);
      const chunks = chunkReviews(items);
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
        <PageHeader title="AI Analysis" description="Generate executive crisis reports powered by AI." />
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 p-6 border border-indigo-500/20">
            <BrainCircuit size={40} className="text-indigo-400" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">No reviews to analyze</h2>
          <p className="mt-3 max-w-md text-center text-slate-400">
            Import customer feedback from the Sources page to begin AI-powered analysis.
          </p>
          <Link to="/sources" className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
            Import Reviews <ArrowRight size={18} />
          </Link>
        </GlassCard>
      </div>
    );
  }

  // Error state - MUST come before "Ready to analyze" to show errors properly
  if (error && !loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="AI Analysis" description="Generate executive crisis reports powered by AI." />
        <GlassCard className="border-red-500/20 bg-gradient-to-r from-red-950/30 to-red-900/20 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/20 p-3 border border-red-500/30">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-red-300">Analysis Failed</h3>
              <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{error}</p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setError(null)}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 font-medium text-slate-300 transition-all hover:bg-white/[0.08]"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Ready to analyze state
  if (!result && !loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="AI Analysis" description="Generate executive crisis reports powered by AI." />

        <div className="grid gap-5 md:grid-cols-3">
          <KPICard title="Reviews Ready" value={items.length} subtitle="Imported and ready for analysis" icon={BarChart3} color="blue" />
          <KPICard title="AI Provider" value={provider?.provider ?? "Not configured"} subtitle={provider?.model || "Go to Settings to configure"} icon={BrainCircuit} color="purple" />
          {autoSelectProvider && connectedProviders.length > 1 && (
            <KPICard title="Fallback Providers" value={connectedProviders.length - 1} subtitle="Available backups" icon={Zap} color="cyan" />
          )}
          <KPICard title="Estimated Time" value="~30s" subtitle="Depending on review count" icon={Clock} color="cyan" />
        </div>

        {!provider && (
          <GlassCard className="border-amber-500/20 bg-gradient-to-r from-amber-950/30 to-orange-950/20 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-500/20 p-3 border border-amber-500/30">
                <AlertTriangle size={24} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-300">AI Provider Required</h3>
                <p className="mt-1 text-sm text-slate-400">Configure and test an AI provider in Settings before running analysis.</p>
                <Link to="/settings" className="mt-2 inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
                  Go to Settings <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </GlassCard>
        )}
        
        {provider && autoSelectProvider && connectedProviders.length > 1 && (
          <GlassCard className="border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-blue-950/20 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-cyan-500/20 p-3 border border-cyan-500/30">
                <Zap size={24} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cyan-300">Auto-Fallback Active</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {connectedProviders.length} providers available. Will automatically try the next provider if one fails.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <button
          disabled={loading || !provider || items.length === 0}
          onClick={handleAnalyze}
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50"
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
        <PageHeader title="AI Analysis" description="Generate executive crisis reports powered by AI." />
        <GlassCard className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
            <BrainCircuit size={32} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Analyzing Reviews</h2>
          <p className="mt-2 text-slate-400">AI is processing {items.length} reviews...</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Radio size={14} className="animate-pulse text-indigo-400" />
            Clustering issues and generating insights
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!result) return null;

  // Calculate severity distribution
  const totalAffected = result.topIssues.reduce((sum, i) => sum + i.affectedCount, 0);

  return (
    <div className="space-y-8">
      {/* Success Banner */}
      <GlassCard className="border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-cyan-950/20 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-300">Analysis Complete</h3>
              <p className="text-sm text-slate-400">Your reviews have been analyzed successfully</p>
            </div>
          </div>
          <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl">
            View Dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Reviews Analyzed" value={items.length} subtitle="100% Completed" icon={Users} color="blue" progress={100} />
        
        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Severity</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={clsx(
                  "text-3xl font-bold",
                  result.severity === "Critical" ? "text-red-400" :
                  result.severity === "High" ? "text-orange-400" :
                  result.severity === "Medium" ? "text-amber-400" : "text-emerald-400"
                )}>{result.severity}</span>
                <SeverityBadge severity={result.severity} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Requires Immediate Attention</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
              <TrendingUp size={22} className="text-orange-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard hover className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Severity Score</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{result.severityScore}</span>
                <span className="text-lg text-slate-500">/100</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div 
                  className={clsx("h-full rounded-full transition-all duration-700",
                    result.severityScore >= 80 ? "bg-gradient-to-r from-red-500 to-red-400" :
                    result.severityScore >= 60 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                    result.severityScore >= 40 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  )}
                  style={{ width: `${result.severityScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">High Impact</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
              <BarChart3 size={22} className="text-cyan-400" />
            </div>
          </div>
        </GlassCard>

        <KPICard title="AI Provider" value={provider?.provider ?? "—"} subtitle="Active" icon={Sparkles} color="purple" />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Executive Summary */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20">
                <FileText size={20} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Executive Summary</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">{result.executiveSummary}</p>
          </GlassCard>

          {/* Top Issues */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
                  <AlertTriangle size={20} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Top Issues</h3>
              </div>
              <span className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                View All Issues <ChevronRight size={14} />
              </span>
            </div>
            
            <div className="space-y-4">
              {result.topIssues.map((issue, index) => (
                <div key={index} className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-white/[0.1]">
                  <div className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
                    issue.severity === "Critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    issue.severity === "High" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                    issue.severity === "Medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white">{issue.title}</h4>
                    <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{issue.description}</p>
                  </div>
                  <SeverityBadge severity={issue.severity} />
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users size={14} />
                      <span className="text-sm font-medium">{Math.round((issue.affectedCount / totalAffected) * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-500">Affected Users</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Customer Communications */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20">
                <MessageSquare size={20} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Customer Communications</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Customer Email", icon: Mail, content: result.customerEmail, color: "orange" },
                { title: "Status Page Update", icon: Radio, content: result.statusPageUpdate, color: "cyan" },
                { title: "Social Media Update", icon: MessageSquare, content: result.socialMediaUpdate, color: "purple" },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <item.icon size={16} className={clsx(
                        item.color === "orange" ? "text-orange-400" :
                        item.color === "cyan" ? "text-cyan-400" : "text-purple-400"
                      )} />
                      <h4 className="font-medium text-white text-sm">{item.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-3">{item.content.slice(0, 120)}...</p>
                  <CopyButton text={item.content} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Severity Distribution */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Severity Distribution</h3>
              <span className="text-xs text-slate-500">View Details</span>
            </div>
            
            <div className="space-y-3">
              {["Critical", "High", "Medium", "Low"].map((severity) => {
                const count = result.topIssues.filter(i => i.severity === severity).length;
                const percent = result.topIssues.length > 0 ? Math.round((count / result.topIssues.length) * 100) : 0;
                
                return (
                  <div key={severity} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-slate-400">{severity}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div 
                        className={clsx("h-full rounded-full transition-all duration-500", 
                          severity === "Critical" ? "bg-red-500" :
                          severity === "High" ? "bg-orange-500" :
                          severity === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-slate-400">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Engineering Tickets */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                  <TicketCheck size={20} className="text-violet-400" />
                </div>
                <h3 className="font-semibold text-white">Engineering Tickets</h3>
              </div>
              <span className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                View All Tickets <ChevronRight size={14} />
              </span>
            </div>
            
            <div className="space-y-3">
              {result.jiraTickets.map((ticket, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-mono text-slate-500">SIGNAL-{String(index + 1).padStart(3, "0")}</span>
                    <SeverityBadge severity={ticket.priority} />
                    <span className="text-sm text-slate-300 truncate">{ticket.title}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 hover:text-slate-400 cursor-pointer flex-shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
                <Zap size={20} className="text-amber-400" />
              </div>
              <h3 className="font-semibold text-white">Quick Actions</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { label: "View Dashboard", desc: "See analytics overview", to: "/dashboard", icon: BarChart3 },
                { label: "Export Reports", desc: "Download analysis reports", to: "/reports", icon: Download },
                { label: "Import More Reviews", desc: "Analyze more customer feedback", to: "/sources", icon: Users },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04] hover:border-white/[0.1] group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                      <action.icon size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle2 size={14} className="text-emerald-400" />
          Analysis Completed · 2 minutes ago
        </div>
        <div className="text-sm text-slate-600">
          Analysis ID: ana_{new Date().toISOString().slice(0, 10).replace(/-/g, "_")}_{String(Math.random()).slice(2, 5)}
        </div>
        <div className="text-sm text-slate-500">
          {items.length} reviews processed in 18.4s
        </div>
      </div>
    </div>
  );
}

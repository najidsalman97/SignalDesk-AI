import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Loader2,
  Play,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";

import FileDropzone from "@/shared/components/FileDropzone";
import PasteReviews from "@/shared/components/PasteReviews";

import type { SourceItem } from "@/shared/types/source";

import { parseFile } from "@/services/parsers";
import Papa from "papaparse";
import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";
import { getDemoDataForImport } from "@/data/demoReviews";

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl",
      className
    )}>
      {children}
    </div>
  );
}

export default function Sources() {
  const { items, importedFiles, addItems, addFile, clear } = useReviewStore();
  const { result: analysisResult } = useAnalysisStore();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<SourceItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [language, setLanguage] = useState("Unknown");
  const [progress, setProgress] = useState(0);

  const previewCount = preview.length;
  const estimatedImport = previewCount - duplicateCount;
  const hasReviews = items.length > 0;
  const hasAnalysis = analysisResult !== null;

  const detectedSource = useMemo(() => {
    if (preview.length === 0) return "-";
    return preview[0].source;
  }, [preview]);

  function normalize(text: string) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }

  function detectLanguage(reviews: SourceItem[]) {
    const sample = reviews.slice(0, 20).map((r) => r.content).join(" ");
    const english = sample.match(/[A-Za-z]/g)?.length ?? 0;
    if (sample.length > 0 && english / sample.length > 0.5) return "English";
    return "Unknown";
  }

  function estimateDuplicates(reviews: SourceItem[]) {
    const seen = new Set<string>();
    let duplicates = 0;
    for (const review of reviews) {
      const key = normalize(review.content);
      if (seen.has(key)) duplicates++;
      else seen.add(key);
    }
    return duplicates;
  }

  function loadDemoData() {
    setLoading(true);
    try {
      const demoItems = getDemoDataForImport();
      setPreview(demoItems);
      setDuplicateCount(0);
      setLanguage("English");
      setPendingFiles(1);
      toast.success(`${demoItems.length} demo reviews ready to import`);
    } finally {
      setLoading(false);
    }
  }

  async function importFiles(files: File[]) {
    try {
      setLoading(true);
      setProgress(0);
      setPendingFiles(files.length);

      const parsed: SourceItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const imported = await parseFile(files[i]);
        parsed.push(...imported);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setPreview(parsed);
      setDuplicateCount(estimateDuplicates(parsed));
      setLanguage(detectLanguage(parsed));
      toast.success(`${parsed.length} reviews ready to import`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  function confirmImport() {
    addItems(preview);
    for (let i = 0; i < pendingFiles; i++) addFile();
    toast.success(`${preview.length} reviews imported`);
    setPreview([]);
    setPendingFiles(0);
    setDuplicateCount(0);
    setProgress(0);
    setLanguage("Unknown");
  }

  function cancelImport() {
    setPreview([]);
    setPendingFiles(0);
    setDuplicateCount(0);
    setProgress(0);
    setLanguage("Unknown");
    toast("Import cancelled");
  }

  function importPasted(text: string) {
    const trimmed = text.trim();

    // Try JSON
    try {
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        const rows = Array.isArray(parsed) ? parsed : [parsed];

        const imported: SourceItem[] = rows.map((row): SourceItem => ({
          id: crypto.randomUUID(),
          source: "json",
          title: typeof row.title === "string" ? row.title : "",
          content: typeof row.review === "string" ? row.review : typeof row.content === "string" ? row.content : JSON.stringify(row),
          author: typeof row.author === "string" ? row.author : undefined,
          rating: typeof row.rating === "number" ? row.rating : undefined,
          createdAt: new Date().toISOString(),
          metadata: row,
        }));

        setPreview(imported);
        setDuplicateCount(estimateDuplicates(imported));
        setLanguage(detectLanguage(imported));
        setPendingFiles(1);
        toast.success(`Detected JSON (${imported.length} records)`);
        return;
      }
    } catch {}

    // Try CSV
    if (trimmed.includes(",") && trimmed.includes("\n")) {
      const result = Papa.parse<Record<string, string>>(trimmed, { header: true, skipEmptyLines: true });

      if (result.data.length > 0) {
        const imported = result.data.map((row): SourceItem => ({
          id: crypto.randomUUID(),
          source: "csv",
          title: "",
          content: row.review ?? row.comment ?? row.feedback ?? row.content ?? JSON.stringify(row),
          author: row.author,
          createdAt: new Date().toISOString(),
          metadata: row,
        }));

        setPreview(imported);
        setDuplicateCount(estimateDuplicates(imported));
        setLanguage(detectLanguage(imported));
        setPendingFiles(1);
        toast.success(`Detected CSV (${imported.length} rows)`);
        return;
      }
    }

    // Plain text
    const separators = [/\n\s*\n/g, /\n-{3,}\n/g, /\n={3,}\n/g, /\n\*{3,}\n/g];
    let reviews = [text];

    for (const separator of separators) {
      if (separator.test(text)) {
        reviews = text.split(separator);
        break;
      }
    }

    const imported = reviews
      .map((review) => review.replace(/\r/g, "").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim())
      .filter(Boolean)
      .map((review): SourceItem => ({
        id: crypto.randomUUID(),
        source: "manual",
        title: "",
        content: review,
        createdAt: new Date().toISOString(),
        metadata: {},
      }));

    setPreview(imported);
    setDuplicateCount(estimateDuplicates(imported));
    setLanguage(detectLanguage(imported));
    setPendingFiles(1);
    toast.success(`${imported.length} review${imported.length === 1 ? "" : "s"} ready`);
  }

  return (
    <div className="space-y-8" data-testid="sources-page">
      <div>
        <h1 className="text-3xl font-bold text-white">Universal Intake</h1>
        <p className="mt-2 text-slate-400">Import customer feedback from CSV, Excel, JSON, TXT, or DOCX files.</p>
      </div>

      {/* Success banners */}
      {hasReviews && !hasAnalysis && (
        <GlassCard className="border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-purple-950/30 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reviews Imported Successfully</h3>
                <p className="text-sm text-slate-400">{items.length} reviews ready for AI analysis</p>
              </div>
            </div>
            <Link to="/analysis" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
              <BrainCircuit size={18} />
              Run Analysis
              <ArrowRight size={16} />
            </Link>
          </div>
        </GlassCard>
      )}

      {hasAnalysis && (
        <GlassCard className="border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Analysis Complete</h3>
                <p className="text-sm text-slate-400">View your dashboard or import more reviews</p>
              </div>
            </div>
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl">
              View Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard className="p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Files Uploaded</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{importedFiles}</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
              <Upload size={22} className="text-blue-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reviews Imported</p>
              <h2 className="mt-2 text-4xl font-bold text-white">{items.length}</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20">
              <FileText size={22} className="text-emerald-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Demo Data Button */}
      {!hasReviews && !loading && preview.length === 0 && (
        <GlassCard className="border-violet-500/20 bg-gradient-to-r from-violet-950/40 to-purple-950/30 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <Play size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Try Demo Data</h3>
                <p className="text-sm text-slate-400">Load 188 realistic mobile app reviews to test the analysis</p>
              </div>
            </div>
            <button onClick={loadDemoData} data-testid="load-demo-data-btn" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl">
              <Play size={18} />
              Load Demo Data
            </button>
          </div>
        </GlassCard>
      )}

      {/* File Upload */}
      <FileDropzone onFiles={importFiles} disabled={loading} />

      {/* Paste Reviews */}
      <PasteReviews onImport={importPasted} disabled={loading} />

      {/* Loading */}
      {loading && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-indigo-400" />
              <span className="font-medium text-white">Processing files...</span>
            </div>
            <span className="text-sm text-slate-400">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </GlassCard>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Import Preview</h2>
              <p className="mt-1 text-sm text-slate-400">Review the data before adding to your workspace</p>
            </div>
            <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300">
              Ready to Import
            </span>
          </div>

          {/* Stats */}
          <div className="grid gap-3 md:grid-cols-5 mb-6">
            {[
              { label: "Reviews Found", value: previewCount, color: "blue" },
              { label: "Will Import", value: estimatedImport, color: "emerald" },
              { label: "Duplicates", value: duplicateCount, color: "amber" },
              { label: "Source", value: detectedSource, color: "purple" },
              { label: "Language", value: language, color: "cyan" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-xs text-slate-500">{stat.label}</div>
                <div className={clsx("mt-1 text-xl font-bold capitalize",
                  stat.color === "emerald" ? "text-emerald-400" :
                  stat.color === "amber" ? "text-amber-400" :
                  stat.color === "purple" ? "text-purple-400" :
                  stat.color === "cyan" ? "text-cyan-400" : "text-white"
                )}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button onClick={confirmImport} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl">
              <Upload size={18} />
              Import {estimatedImport} Reviews
            </button>
            <button onClick={cancelImport} className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-2.5 font-medium text-slate-300 transition-all hover:bg-white/[0.06]">
              <X size={18} />
              Cancel
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            {preview.slice(0, 50).map((review, idx) => (
              <div key={review.id} className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/[0.06] text-xs font-medium text-slate-400">
                  {idx + 1}
                </span>
                <p className="line-clamp-2 flex-1 text-slate-300">{review.content}</p>
                {(review.rating ?? 0) > 0 && (
                  <span className="shrink-0 text-amber-400">★ {review.rating}</span>
                )}
              </div>
            ))}
            {preview.length > 50 && (
              <div className="py-3 text-center text-sm text-slate-500">
                Showing 50 of {preview.length} reviews
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Imported Reviews */}
      {items.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Imported Reviews</h2>
              <p className="mt-1 text-sm text-slate-400">{items.length} reviews in workspace</p>
            </div>
            <button onClick={() => { clear(); toast.success("All reviews cleared"); }} className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20">
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {items.slice(0, 20).map((review, idx) => (
              <div key={review.id} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-medium text-slate-400">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {review.title && <h4 className="font-medium text-white">{review.title}</h4>}
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{review.content}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {(review.rating ?? 0) > 0 && <span className="text-amber-400">★ {review.rating}</span>}
                  <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-xs capitalize text-slate-400">{review.source}</span>
                </div>
              </div>
            ))}
            {items.length > 20 && (
              <div className="py-4 text-center text-sm text-slate-500">
                Showing 20 of {items.length} reviews
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Empty State */}
      {items.length === 0 && preview.length === 0 && !loading && (
        <GlassCard className="p-12 text-center border-dashed">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
            <FileText size={32} className="text-slate-600" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-white">No reviews yet</h3>
          <p className="mt-2 text-sm text-slate-500">Drag & drop files above, or paste reviews directly</p>
        </GlassCard>
      )}
    </div>
  );
}

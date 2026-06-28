import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import FileDropzone from "@/shared/components/FileDropzone";
import PasteReviews from "@/shared/components/PasteReviews";
import ImportStats from "@/shared/components/ImportStats";
import PageHeader from "@/shared/components/PageHeader";

import type { SourceItem } from "@/shared/types/source";

import { parseFile } from "@/services/parsers";
import Papa from "papaparse";
import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";

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
    const sample = reviews
      .slice(0, 20)
      .map((r) => r.content)
      .join(" ");
    const english = sample.match(/[A-Za-z]/g)?.length ?? 0;
    if (sample.length > 0 && english / sample.length > 0.5) {
      return "English";
    }
    return "Unknown";
  }

  function estimateDuplicates(reviews: SourceItem[]) {
    const seen = new Set<string>();
    let duplicates = 0;
    for (const review of reviews) {
      const key = normalize(review.content);
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    }
    return duplicates;
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
    for (let i = 0; i < pendingFiles; i++) {
      addFile();
    }
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

        const imported: SourceItem[] = rows.map(
          (row): SourceItem => ({
            id: crypto.randomUUID(),
            source: "json",
            title: typeof row.title === "string" ? row.title : "",
            content:
              typeof row.review === "string"
                ? row.review
                : typeof row.content === "string"
                ? row.content
                : JSON.stringify(row),
            author: typeof row.author === "string" ? row.author : undefined,
            rating: typeof row.rating === "number" ? row.rating : undefined,
            createdAt: new Date().toISOString(),
            metadata: row,
          })
        );

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
      const result = Papa.parse<Record<string, string>>(trimmed, {
        header: true,
        skipEmptyLines: true,
      });

      if (result.data.length > 0) {
        const imported = result.data.map(
          (row): SourceItem => ({
            id: crypto.randomUUID(),
            source: "csv",
            title: "",
            content:
              row.review ??
              row.comment ??
              row.feedback ??
              row.content ??
              JSON.stringify(row),
            author: row.author,
            createdAt: new Date().toISOString(),
            metadata: row,
          })
        );

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
      .map((review) =>
        review
          .replace(/\r/g, "")
          .replace(/\u0000/g, "")
          .replace(/[ \t]+/g, " ")
          .trim()
      )
      .filter(Boolean)
      .map(
        (review): SourceItem => ({
          id: crypto.randomUUID(),
          source: "manual",
          title: "",
          content: review,
          createdAt: new Date().toISOString(),
          metadata: {},
        })
      );

    setPreview(imported);
    setDuplicateCount(estimateDuplicates(imported));
    setLanguage(detectLanguage(imported));
    setPendingFiles(1);
    toast.success(
      `${imported.length} review${imported.length === 1 ? "" : "s"} ready`
    );
  }

  return (
    <div className="space-y-10" data-testid="sources-page">
      <PageHeader
        title="Universal Intake"
        description="Import customer feedback from CSV, Excel, JSON, TXT, or DOCX files."
      />

      {/* Progress indicator - show next step */}
      {hasReviews && !hasAnalysis && (
        <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <CheckCircle2 size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Reviews Imported Successfully</h3>
              <p className="text-sm text-muted-foreground">
                {items.length} reviews ready for AI analysis
              </p>
            </div>
          </div>
          <Link
            to="/analysis"
            data-testid="next-step-analysis-btn"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            <BrainCircuit size={18} />
            Run Analysis
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {hasAnalysis && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Analysis Complete</h3>
              <p className="text-sm text-muted-foreground">
                View your dashboard or import more reviews
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg"
          >
            View Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <ImportStats reviews={items.length} files={importedFiles} />

      {/* File Upload */}
      <FileDropzone onFiles={importFiles} disabled={loading} />

      {/* Paste Reviews */}
      <PasteReviews onImport={importPasted} disabled={loading} />

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border bg-card p-6" data-testid="import-loading">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className="font-medium">Processing files...</span>
            </div>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-2xl border bg-card p-6" data-testid="import-preview">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Import Preview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the data before adding to your workspace
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Ready to Import
            </span>
          </div>

          {/* Preview Stats */}
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Reviews Found</div>
              <div className="mt-1 text-2xl font-bold">{previewCount}</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Will Import</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                {estimatedImport}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Duplicates</div>
              <div className="mt-1 text-2xl font-bold text-amber-600">
                {duplicateCount}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Source</div>
              <div className="mt-1 text-lg font-bold capitalize">
                {detectedSource}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Language</div>
              <div className="mt-1 text-lg font-bold">{language}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={confirmImport}
              data-testid="confirm-import-btn"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              <Upload size={18} />
              Import {estimatedImport} Reviews
            </button>
            <button
              onClick={cancelImport}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium transition-colors hover:bg-accent"
            >
              <X size={18} />
              Cancel
            </button>
          </div>

          {/* Review List */}
          <div className="mt-6 max-h-80 space-y-2 overflow-y-auto rounded-xl border bg-background p-4">
            {preview.slice(0, 50).map((review, idx) => (
              <div
                key={review.id}
                className="flex items-start gap-3 rounded-lg border p-3 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
                  {idx + 1}
                </span>
                <p className="line-clamp-2 flex-1">{review.content}</p>
                {(review.rating ?? 0) > 0 && (
                  <span className="shrink-0 text-amber-500">
                    ★ {review.rating}
                  </span>
                )}
              </div>
            ))}
            {preview.length > 50 && (
              <div className="py-3 text-center text-sm text-muted-foreground">
                Showing 50 of {preview.length} reviews
              </div>
            )}
          </div>
        </div>
      )}

      {/* Imported Reviews */}
      {items.length > 0 && (
        <div className="rounded-2xl border bg-card p-6" data-testid="imported-reviews">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Imported Reviews</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {items.length} reviews in workspace
              </p>
            </div>
            <button
              onClick={() => {
                clear();
                toast.success("All reviews cleared");
              }}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          <div className="mt-6 max-h-96 space-y-2 overflow-y-auto">
            {items.slice(0, 20).map((review, idx) => (
              <div
                key={review.id}
                className="flex items-start gap-3 rounded-xl border p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {review.title && (
                    <h4 className="font-medium">{review.title}</h4>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {review.content}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {(review.rating ?? 0) > 0 && (
                    <span className="text-amber-500">★ {review.rating}</span>
                  )}
                  <span className="rounded-lg bg-muted px-2 py-1 text-xs capitalize">
                    {review.source}
                  </span>
                </div>
              </div>
            ))}
            {items.length > 20 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Showing 20 of {items.length} reviews
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && preview.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed p-12 text-center" data-testid="sources-empty">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileText size={32} className="text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">No reviews yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag & drop files above, or paste reviews directly
          </p>
        </div>
      )}
    </div>
  );
}

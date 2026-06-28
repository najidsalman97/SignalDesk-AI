/**
 * Column Mapping Modal - Preview data and map columns to fields
 */

import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Sparkles,
  Table,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { SourceItem, SourceType } from "@/shared/types/source";
import { GlowButton, GradientBadge } from "@/shared/components/premium";

interface ColumnMapping {
  content: string;
  title: string;
  author: string;
  rating: string;
}

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawData: Record<string, unknown>[];
  columns: string[];
  fileName: string;
  sourceType: SourceType;
  onConfirm: (items: SourceItem[]) => void;
}

// Auto-detect best column for a field
function autoDetectColumn(columns: string[], candidates: string[]): string {
  const normalizedCandidates = candidates.map(c => c.toLowerCase().replace(/[\s_-]/g, ""));
  
  for (const col of columns) {
    const normalized = col.toLowerCase().replace(/[\s_-]/g, "");
    if (normalizedCandidates.includes(normalized)) {
      return col;
    }
  }
  
  // Partial match
  for (const col of columns) {
    const normalized = col.toLowerCase().replace(/[\s_-]/g, "");
    for (const candidate of normalizedCandidates) {
      if (normalized.includes(candidate) || candidate.includes(normalized)) {
        return col;
      }
    }
  }
  
  return "";
}

export function ColumnMappingModal({
  isOpen,
  onClose,
  rawData,
  columns,
  fileName,
  sourceType,
  onConfirm,
}: ColumnMappingModalProps) {
  // Auto-detect initial mappings
  const initialMapping = useMemo(() => ({
    content: autoDetectColumn(columns, ["review", "content", "comment", "feedback", "message", "body", "text", "description", "issue", "summary", "note"]),
    title: autoDetectColumn(columns, ["title", "subject", "headline"]),
    author: autoDetectColumn(columns, ["author", "user", "username", "customer", "name", "email", "creator"]),
    rating: autoDetectColumn(columns, ["rating", "stars", "score", "rank"]),
  }), [columns]);

  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  // Re-sync mapping when columns change (fix for modal being permanently mounted)
  useEffect(() => {
    if (columns.length > 0) {
      setMapping(initialMapping);
    }
  }, [columns.join("|"), initialMapping.content, initialMapping.title, initialMapping.author, initialMapping.rating]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Preview first 5 rows
  const previewRows = rawData.slice(0, 5);
  
  // Count how many rows have valid content
  const validRowCount = useMemo(() => {
    if (!mapping.content) return 0;
    return rawData.filter(row => {
      const content = row[mapping.content];
      return content && String(content).trim().length > 0;
    }).length;
  }, [rawData, mapping.content]);

  function handleMappingChange(field: keyof ColumnMapping, value: string) {
    setMapping(prev => ({ ...prev, [field]: value }));
  }

  function handleConfirm() {
    if (!mapping.content) {
      toast.error("Please select a column for review content");
      return;
    }

    setIsProcessing(true);

    try {
      const items: SourceItem[] = [];
      const seen = new Set<string>();

      for (const row of rawData) {
        const content = mapping.content ? String(row[mapping.content] ?? "").trim() : "";
        
        if (!content) continue;
        
        // Dedupe
        const fingerprint = content.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(fingerprint)) continue;
        seen.add(fingerprint);

        const title = mapping.title ? String(row[mapping.title] ?? "").trim() : undefined;
        const author = mapping.author ? String(row[mapping.author] ?? "").trim() : undefined;
        const ratingValue = mapping.rating ? row[mapping.rating] : undefined;
        const rating = ratingValue !== undefined && ratingValue !== null 
          ? Number(ratingValue) 
          : undefined;

        items.push({
          id: crypto.randomUUID(),
          source: sourceType,
          title: title || undefined,
          content,
          author: author || undefined,
          rating: Number.isFinite(rating) ? rating : undefined,
          createdAt: new Date().toISOString(),
          metadata: row as Record<string, unknown>,
        });
      }

      onConfirm(items);
      toast.success(`${items.length} reviews imported successfully`);
      onClose();
    } catch (error) {
      toast.error("Failed to process data");
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div data-testid="column-mapping-modal" className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1424] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Table size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Map Your Columns</h2>
              <p className="text-xs text-slate-500">{fileName} • {rawData.length} rows detected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="column-mapping-close-btn"
            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Column Mapping Section */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-sm font-medium text-white">Column Mapping</span>
              <GradientBadge variant="info" size="sm">Auto-detected</GradientBadge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Content Field - Required */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="text-red-400">*</span>
                  Review Content
                </label>
                <ColumnSelect
                  columns={columns}
                  value={mapping.content}
                  onChange={(v) => handleMappingChange("content", v)}
                  placeholder="Select content column"
                  required
                />
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Title (optional)</label>
                <ColumnSelect
                  columns={columns}
                  value={mapping.title}
                  onChange={(v) => handleMappingChange("title", v)}
                  placeholder="Select title column"
                />
              </div>

              {/* Author Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Author (optional)</label>
                <ColumnSelect
                  columns={columns}
                  value={mapping.author}
                  onChange={(v) => handleMappingChange("author", v)}
                  placeholder="Select author column"
                />
              </div>

              {/* Rating Field */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Rating (optional)</label>
                <ColumnSelect
                  columns={columns}
                  value={mapping.rating}
                  onChange={(v) => handleMappingChange("rating", v)}
                  placeholder="Select rating column"
                />
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-cyan-400" />
                <span className="text-sm font-medium text-white">Data Preview</span>
              </div>
              <span className="text-xs text-slate-500">
                Showing first {previewRows.length} of {rawData.length} rows
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              {!mapping.content ? (
                <div className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                    <Table size={24} className="text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Select a content column to preview your data
                  </p>
                </div>
              ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">#</th>
                    {mapping.content && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-blue-400">
                        Content
                      </th>
                    )}
                    {mapping.title && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                        Title
                      </th>
                    )}
                    {mapping.author && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                        Author
                      </th>
                    )}
                    {mapping.rating && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                        Rating
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {previewRows.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      {mapping.content && (
                        <td className="px-4 py-3 text-white max-w-xs">
                          <p className="line-clamp-2 text-xs">
                            {String(row[mapping.content] || "—")}
                          </p>
                        </td>
                      )}
                      {mapping.title && (
                        <td className="px-4 py-3 text-slate-300 max-w-[150px]">
                          <p className="truncate text-xs">
                            {String(row[mapping.title] || "—")}
                          </p>
                        </td>
                      )}
                      {mapping.author && (
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {String(row[mapping.author] || "—")}
                        </td>
                      )}
                      {mapping.rating && (
                        <td className="px-4 py-3 text-amber-400 text-xs">
                          {row[mapping.rating] !== undefined ? `${row[mapping.rating]}★` : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>

            {!mapping.content && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-300">
                  Please select a column for review content to continue.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="text-sm text-slate-400">
            {mapping.content ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                {validRowCount} valid reviews will be imported
              </span>
            ) : (
              "Select content column to preview"
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              data-testid="column-mapping-cancel-btn"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <GlowButton
              variant="primary"
              onClick={handleConfirm}
              disabled={!mapping.content || isProcessing}
              icon={isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              data-testid="column-mapping-import-btn"
            >
              {isProcessing ? "Processing..." : "Import Reviews"}
            </GlowButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Column Select Dropdown
function ColumnSelect({
  columns,
  value,
  onChange,
  placeholder,
  required,
}: {
  columns: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all",
          value
            ? "bg-white/[0.04] border-white/[0.1] text-white"
            : required
            ? "bg-red-500/5 border-red-500/20 text-slate-500"
            : "bg-white/[0.02] border-white/[0.06] text-slate-500",
          "hover:border-white/[0.15]"
        )}
      >
        <span className={value ? "text-white" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0d1424] shadow-xl max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-white/[0.04] transition-colors"
            >
              — None —
            </button>
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => {
                  onChange(col);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  col === value
                    ? "bg-blue-500/10 text-blue-300"
                    : "text-slate-300 hover:bg-white/[0.04]"
                )}
              >
                {col}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Utility to extract raw data from file for column mapping
export async function extractRawData(file: File): Promise<{
  data: Record<string, unknown>[];
  columns: string[];
}> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  
  if (ext === "csv" || ext === "txt") {
    const Papa = (await import("papaparse")).default;
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (results) => {
          const columns = results.meta.fields || [];
          resolve({ data: results.data as Record<string, unknown>[], columns });
        },
        error: reject,
      });
    });
  }
  
  if (ext === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const data = Array.isArray(parsed) ? parsed : [parsed];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    return { data, columns };
  }
  
  if (ext === "xlsx" || ext === "xls") {
    const XLSX = (await import("xlsx")).default;
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet) as Record<string, unknown>[];
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    return { data, columns };
  }
  
  throw new Error("Unsupported file format for column mapping");
}

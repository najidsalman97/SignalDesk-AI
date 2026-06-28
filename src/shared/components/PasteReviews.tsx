import { useState } from "react";
import { ClipboardPaste, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Props {
  onImport(text: string): void;
  disabled?: boolean;
}

export default function PasteReviews({ onImport, disabled }: Props) {
  const [value, setValue] = useState("");

  const isEmpty = value.trim().length === 0;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
          <ClipboardPaste size={20} className="text-violet-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Paste Reviews</h2>
          <p className="text-sm text-slate-500">JSON, CSV, or plain text (one per line or separated by blank lines)</p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="Paste your reviews here...

Example formats:
- Plain text (one review per line)
- JSON array of objects
- CSV with headers"
        className="mt-5 h-48 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 transition-all"
        data-testid="paste-textarea"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {value.length > 0
            ? `${value.split(/\n/).filter(Boolean).length} lines`
            : "Paste or type reviews"}
        </span>
        <button
          disabled={isEmpty || disabled}
          data-testid="paste-import-btn"
          className={clsx(
            "flex items-center gap-2 rounded-xl px-5 py-2.5 font-medium transition-all",
            isEmpty || disabled
              ? "bg-white/[0.04] text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl"
          )}
          onClick={() => {
            onImport(value);
            setValue("");
          }}
        >
          <Sparkles size={18} />
          Process Reviews
        </button>
      </div>
    </div>
  );
}

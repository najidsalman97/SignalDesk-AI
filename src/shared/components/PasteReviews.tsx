import { useState } from "react";
import { ClipboardPaste, Sparkles } from "lucide-react";

interface Props {
  onImport(text: string): void;
  disabled?: boolean;
}

export default function PasteReviews({ onImport, disabled }: Props) {
  const [value, setValue] = useState("");

  const isEmpty = value.trim().length === 0;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2.5">
          <ClipboardPaste size={20} className="text-violet-500" />
        </div>
        <div>
          <h2 className="font-semibold">Paste Reviews</h2>
          <p className="text-sm text-muted-foreground">
            JSON, CSV, or plain text (one per line or separated by blank lines)
          </p>
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
        className="mt-5 h-48 w-full resize-none rounded-xl border bg-background p-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        data-testid="paste-textarea"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {value.length > 0
            ? `${value.split(/\n/).filter(Boolean).length} lines`
            : "Paste or type reviews"}
        </span>
        <button
          disabled={isEmpty || disabled}
          data-testid="paste-import-btn"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
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

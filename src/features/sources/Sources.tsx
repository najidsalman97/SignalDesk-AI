import { useMemo, useState } from "react";
import { toast } from "sonner";

import FileDropzone from "@/shared/components/FileDropzone";
import PasteReviews from "@/shared/components/PasteReviews";
import ImportStats from "@/shared/components/ImportStats";

import type { SourceItem } from "@/shared/types/source";

import { parseFile } from "@/services/parsers";
import Papa from "papaparse";
import { useReviewStore } from "@/store/review.store";

export default function Sources() {
  const {
    items,
    importedFiles,
    addItems,
    addFile,
    clear,
  } = useReviewStore();

  const [loading, setLoading] =
    useState(false);

  const [preview, setPreview] =
    useState<SourceItem[]>([]);

  const [pendingFiles, setPendingFiles] =
    useState(0);

  const [duplicateCount, setDuplicateCount] =
    useState(0);

  const [language, setLanguage] =
    useState("Unknown");

  const [progress, setProgress] =
    useState(0);

  const [url, setUrl] = useState("");

  const previewCount = preview.length;

  const estimatedImport =
    previewCount - duplicateCount;

  const detectedSource = useMemo(() => {
    if (preview.length === 0) return "-";

    return preview[0].source;
  }, [preview]);

  function normalize(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function detectLanguage(
    reviews: SourceItem[]
  ) {
    const sample = reviews
      .slice(0, 20)
      .map((r) => r.content)
      .join(" ");

    const english =
      sample.match(/[A-Za-z]/g)?.length ?? 0;

    if (
      sample.length > 0 &&
      english / sample.length > 0.5
    ) {
      return "English";
    }

    return "Unknown";
  }

  function estimateDuplicates(
    reviews: SourceItem[]
  ) {
    const seen = new Set<string>();

    let duplicates = 0;

    for (const review of reviews) {
      const key = normalize(
        review.content
      );

      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }
    }

    return duplicates;
  }

  async function importFiles(
    files: File[]
  ) {
    try {
      setLoading(true);

      setProgress(0);

      setPendingFiles(files.length);

      const parsed: SourceItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const imported =
          await parseFile(files[i]);

        parsed.push(...imported);

        setProgress(
          Math.round(
            ((i + 1) /
              files.length) *
              100
          )
        );
      }

      setPreview(parsed);

      setDuplicateCount(
        estimateDuplicates(parsed)
      );

      setLanguage(
        detectLanguage(parsed)
      );

      toast.success(
        `${parsed.length} reviews ready to import`
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Import failed"
      );
    } finally {
      setLoading(false);
    }
  }

  function confirmImport() {
    addItems(preview);

    for (
      let i = 0;
      i < pendingFiles;
      i++
    ) {
      addFile();
    }

    toast.success(
      `${preview.length} reviews imported`
    );

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

function importPasted(
  text: string
) {
  const trimmed = text.trim();

  try {
    if (
      trimmed.startsWith("{") ||
      trimmed.startsWith("[")
    ) {
      const parsed = JSON.parse(trimmed);

      const rows = Array.isArray(parsed)
        ? parsed
        : [parsed];

      const imported: SourceItem[] = rows.map(
        (row): SourceItem => ({
          id: crypto.randomUUID(),

          source: "json",

          title:
            typeof row.title === "string"
              ? row.title
              : "",

          content:
            typeof row.review === "string"
              ? row.review
              : typeof row.content === "string"
              ? row.content
              : JSON.stringify(row),

          author:
            typeof row.author === "string"
              ? row.author
              : undefined,

          rating:
            typeof row.rating === "number"
              ? row.rating
              : undefined,

          createdAt:
            new Date().toISOString(),

          metadata: row,
        })
      );

      setPreview(imported);

      setDuplicateCount(
        estimateDuplicates(imported)
      );

      setLanguage(
        detectLanguage(imported)
      );

      setPendingFiles(1);

      toast.success(
        `Detected JSON (${imported.length} records)`
      );

      return;
    }
  } catch {}

  if (
    trimmed.includes(",") &&
    trimmed.includes("\n")
  ) {
    const result = Papa.parse<
      Record<string, string>
    >(trimmed, {
      header: true,

      skipEmptyLines: true,
    });

    if (
      result.data.length > 0
    ) {
      const imported =
        result.data.map(
          (
            row
          ): SourceItem => ({
            id: crypto.randomUUID(),

            source: "csv",

            title: "",

            content:
              row.review ??
              row.comment ??
              row.feedback ??
              row.content ??
              JSON.stringify(row),

            author:
              row.author,

            createdAt:
              new Date().toISOString(),

            metadata: row,
          })
        );

      setPreview(imported);

      setDuplicateCount(
        estimateDuplicates(imported)
      );

      setLanguage(
        detectLanguage(imported)
      );

      setPendingFiles(1);

      toast.success(
        `Detected CSV (${imported.length} rows)`
      );

      return;
    }
  }

  const separators = [
    /\n\s*\n/g,
    /\n-{3,}\n/g,
    /\n={3,}\n/g,
    /\n\*{3,}\n/g,
  ];

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

        createdAt:
          new Date().toISOString(),

        metadata: {},
      })
    );

  setPreview(imported);

  setDuplicateCount(
    estimateDuplicates(imported)
  );

  setLanguage(
    detectLanguage(imported)
  );

  setPendingFiles(1);

  toast.success(
    `${imported.length} review${
      imported.length === 1
        ? ""
        : "s"
    } ready`
  );
}

function detectImportSource(
  value: string
): string | null {
  const url = value.toLowerCase();

  if (
    url.includes("play.google.com")
  ) {
    return "Google Play";
  }

  if (
    url.includes("apps.apple.com")
  ) {
    return "Apple App Store";
  }

  if (
    url.includes("reddit.com")
  ) {
    return "Reddit";
  }

  if (
    url.includes("github.com")
  ) {
    return "GitHub";
  }

  if (
    url.includes("trustpilot.com")
  ) {
    return "Trustpilot";
  }

  if (
    url.includes("g2.com")
  ) {
    return "G2";
  }

  if (
    url.includes(
      "docs.google.com/spreadsheets"
    )
  ) {
    return "Google Sheets";
  }

  try {
    new URL(value);

    return "Website";
  } catch {
    return null;
  }
}

  return (    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">
          Universal Intake
        </h1>

        <p className="mt-2 text-muted-foreground">
          Import customer feedback from almost anywhere.
        </p>
      </div>

      <ImportStats
        reviews={items.length}
        files={importedFiles}
      />

      <FileDropzone
        onFiles={importFiles}
      />

      <PasteReviews
        onImport={importPasted}
      />

      <div className="rounded-3xl border p-6">
  <h2 className="text-xl font-bold">
    Import from URL
  </h2>

  <p className="mt-2 text-muted-foreground">
    Paste a Google Play, App Store, Reddit,
    GitHub, Trustpilot, G2, Google Sheets or
    website URL.
  </p>

  <div className="mt-5 flex gap-3">
    <input
      value={url}
      onChange={(e) =>
        setUrl(e.target.value)
      }
      placeholder="https://..."
      className="flex-1 rounded-xl border px-4 py-3"
    />

    <button
      onClick={() => {
        const source =
          detectImportSource(url);

        if (!source) {
          toast.error(
            "Unsupported URL"
          );
          return;
        }

        toast.success(
          `${source} detected`
        );
      }}
      className="rounded-xl bg-primary px-6 py-3 text-primary-foreground"
    >
      Detect
    </button>
  </div>
</div>

      {loading && (
        <div className="rounded-2xl border bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              Importing...
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="rounded-3xl border bg-primary/5 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Import Preview
              </h2>

              <p className="mt-1 text-muted-foreground">
                Review the imported data before adding it to your
                workspace.
              </p>
            </div>

            <span className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
              Ready
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-xl border bg-background p-5">
              <div className="text-sm text-muted-foreground">
                Reviews Found
              </div>

              <div className="mt-2 text-3xl font-bold">
                {previewCount}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <div className="text-sm text-muted-foreground">
                Estimated Import
              </div>

              <div className="mt-2 text-3xl font-bold">
                {estimatedImport}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <div className="text-sm text-muted-foreground">
                Estimated Duplicates
              </div>

              <div className="mt-2 text-3xl font-bold">
                {duplicateCount}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <div className="text-sm text-muted-foreground">
                Source
              </div>

              <div className="mt-2 text-2xl font-bold capitalize">
                {detectedSource}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-5">
              <div className="text-sm text-muted-foreground">
                Language
              </div>

              <div className="mt-2 text-2xl font-bold">
                {language}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={confirmImport}
              className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Import Reviews
            </button>

            <button
              onClick={cancelImport}
              className="rounded-xl border px-6 py-3 font-medium"
            >
              Cancel
            </button>
          </div>

          <div className="mt-8 max-h-96 space-y-3 overflow-y-auto rounded-2xl border bg-background p-5">
            {preview.slice(0, 100).map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium uppercase">
                    {review.source}
                  </span>

                  {(review.rating ?? 0) > 0 && (
                    <span>
                      ⭐ {review.rating}
                    </span>
                  )}
                </div>

                {review.title && (
                  <h3 className="mt-3 font-semibold">
                    {review.title}
                  </h3>
                )}

                <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                  {review.content}
                </p>

                {review.author && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {review.author}
                  </p>
                )}
              </div>
            ))}

            {preview.length > 100 && (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Showing first 100 reviews of {preview.length}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Imported Reviews
          </h2>

          <button
            onClick={clear}
            className="rounded-xl border px-4 py-2"
          >
            Clear
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No reviews imported.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium uppercase">
                    {review.source}
                  </span>

                  {(review.rating ?? 0) > 0 && (
                    <span>
                      ⭐ {review.rating}
                    </span>
                  )}
                </div>

                {review.title && (
                  <h3 className="mt-3 font-semibold">
                    {review.title}
                  </h3>
                )}

                <p className="mt-3 whitespace-pre-wrap break-words">
                  {review.content}
                </p>

                {review.author && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {review.author}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
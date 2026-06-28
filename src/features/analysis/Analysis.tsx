import { analyzeReviews } from "@/services/ai/providerFactory";
import { chunkReviews } from "@/services/ai/reviewChunker";
import { getActiveProvider } from "@/services/ai/provider";

import { useReviewStore } from "@/store/review.store";
import { useAnalysisStore } from "@/store/analysis.store";

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

      const chunks =
       chunkReviews(items);

      if (chunks.length > 1) {
       console.log(
          `Created ${chunks.length} analysis chunks`
       );
      }

const response =
  await analyzeReviews(
    chunks[0].reviews
  );

      setResult(response);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unknown error"
      );
    }
  }

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">
          AI Analysis
        </h1>

        <p className="text-muted-foreground">
          Generate executive crisis reports.
        </p>

      </div>

      <div className="rounded-2xl border p-6">

        <div className="flex justify-between">

          <div>

            <p className="text-sm text-muted-foreground">
              Reviews Imported
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {items.length}
            </h2>

          </div>

          <div>

            <p className="text-sm text-muted-foreground">
              AI Provider
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {provider?.provider ?? "None"}
            </h2>

          </div>

        </div>

      </div>

      <button
        disabled={
          loading ||
          !provider ||
          items.length === 0
        }
        onClick={handleAnalyze}
        className="rounded-xl bg-primary px-8 py-4 text-lg text-primary-foreground disabled:opacity-50"
      >
        {loading
          ? "Analyzing..."
          : "Analyze Reviews"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-500 bg-red-50 p-5 text-red-600 dark:bg-red-950">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8">

          <div className="rounded-2xl border p-8">

            <h2 className="text-3xl font-bold">
              Executive Summary
            </h2>

            <p className="mt-5 leading-8">
              {result.executiveSummary}
            </p>

          </div>

          <div className="rounded-2xl border p-8">

            <h2 className="text-3xl font-bold">
              Severity
            </h2>

            <div className="mt-4 flex items-center gap-4">

              <div className="rounded-xl bg-red-600 px-5 py-2 text-white">
                {result.severity}
              </div>

              <span className="text-2xl font-bold">
                {result.severityScore}/100
              </span>

            </div>

          </div>

          <div className="space-y-6">

            {result.topIssues.map((issue, index) => (

              <div
                key={index}
                className="rounded-2xl border p-8"
              >

                <h3 className="text-2xl font-bold">
                  {issue.title}
                </h3>

                <p className="mt-4">
                  {issue.description}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <div>

                    <p className="font-semibold">
                      Severity
                    </p>

                    <p>
                      {issue.severity}
                    </p>

                  </div>

                  <div>

                    <p className="font-semibold">
                      Root Cause
                    </p>

                    <p>
                      {issue.rootCause}
                    </p>

                  </div>

                  <div>

                    <p className="font-semibold">
                      Recommended Fix
                    </p>

                    <p>
                      {issue.recommendedFix}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}
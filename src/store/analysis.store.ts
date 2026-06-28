import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResult } from "@/shared/types/analysis";
import type { AnalysisProgress, AnalysisMode } from "@/services/ai/engine";

interface AnalysisStats {
  totalReviews: number;
  processedReviews: number;
  totalChunks: number;
  providersUsed: string[];
  elapsedMs: number;
  mode: AnalysisMode;
}

interface AnalysisStore {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  progress: AnalysisProgress | null;
  stats: AnalysisStats | null;
  abortController: AbortController | null;

  setLoading: (loading: boolean) => void;
  setResult: (result: AnalysisResult | null, stats?: AnalysisStats) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: AnalysisProgress | null) => void;
  setAbortController: (controller: AbortController | null) => void;
  cancelAnalysis: () => void;
  clear: () => void;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      loading: false,
      result: null,
      error: null,
      progress: null,
      stats: null,
      abortController: null,

      setLoading: (loading) => set({ loading, error: loading ? null : get().error }),

      setResult: (result, stats) =>
        set({
          result,
          loading: false,
          error: null,
          progress: null,
          stats: stats || null,
          abortController: null,
        }),

      setError: (error) =>
        set({
          error,
          loading: false,
          progress: null,
          abortController: null,
        }),

      setProgress: (progress) => set({ progress }),

      setAbortController: (abortController) => set({ abortController }),

      cancelAnalysis: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
        }
        set({
          loading: false,
          progress: null,
          abortController: null,
          error: "Analysis cancelled",
        });
      },

      clear: () =>
        set({
          result: null,
          error: null,
          loading: false,
          progress: null,
          stats: null,
          abortController: null,
        }),
    }),
    {
      name: "signaldesk-analysis",
      partialize: (state) => ({
        result: state.result,
        stats: state.stats,
      }),
    }
  )
);

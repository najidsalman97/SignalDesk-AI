import { create } from "zustand";
import type { AnalysisResult } from "@/shared/types/analysis";

interface AnalysisStore {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;

  setLoading: (loading: boolean) => void;
  setResult: (result: AnalysisResult | null) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  loading: false,
  result: null,
  error: null,

  setLoading: (loading) => set({ loading }),

  setResult: (result) =>
    set({
      result,
      loading: false,
      error: null,
    }),

  setError: (error) =>
    set({
      error,
      loading: false,
    }),

  clear: () =>
    set({
      result: null,
      error: null,
      loading: false,
    }),
}));
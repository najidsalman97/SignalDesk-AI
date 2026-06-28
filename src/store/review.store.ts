import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SourceItem } from "@/shared/types/source";

interface ReviewStore {
  items: SourceItem[];

  importedFiles: number;

  addItems: (items: SourceItem[]) => void;

  addFile: () => void;

  removeItem: (id: string) => void;

  clear: () => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set) => ({
      items: [],

      importedFiles: 0,

      addItems: (items) =>
        set((state) => ({
          items: [...state.items, ...items],
        })),

      addFile: () =>
        set((state) => ({
          importedFiles: state.importedFiles + 1,
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== id
          ),
        })),

      clear: () =>
        set({
          items: [],
          importedFiles: 0,
        }),
    }),
    {
      name: "signaldesk-reviews",
    }
  )
);
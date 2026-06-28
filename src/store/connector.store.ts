import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Connector, ConnectorType, ConnectorStatus } from "@/shared/types/connector";

interface ConnectorState {
  connectors: Connector[];
  
  addConnector: (connector: Omit<Connector, "id" | "status">) => void;
  removeConnector: (id: string) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  setConnectorStatus: (id: string, status: ConnectorStatus, errorMessage?: string) => void;
  updateSyncInfo: (id: string, reviewCount: number) => void;
}

export const useConnectorStore = create<ConnectorState>()(
  persist(
    (set) => ({
      connectors: [],

      addConnector: (connector) =>
        set((state) => ({
          connectors: [
            ...state.connectors,
            {
              ...connector,
              id: crypto.randomUUID(),
              status: "idle",
            },
          ],
        })),

      removeConnector: (id) =>
        set((state) => ({
          connectors: state.connectors.filter((c) => c.id !== id),
        })),

      updateConnector: (id, updates) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setConnectorStatus: (id, status, errorMessage) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id ? { ...c, status, errorMessage } : c
          ),
        })),

      updateSyncInfo: (id, reviewCount) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === id
              ? { ...c, reviewCount, lastSync: new Date().toISOString(), status: "connected" }
              : c
          ),
        })),
    }),
    {
      name: "signaldesk-connectors",
    }
  )
);

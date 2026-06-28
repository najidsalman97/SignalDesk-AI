 import { create } from "zustand"
import type { ConnectorConfig } from "@/shared/types/connector"

interface ConnectorState {
  connectors: ConnectorConfig[]
  activeConnector: ConnectorConfig | null
  setConnectors: (connectors: ConnectorConfig[]) => void
  setActiveConnector: (connector: ConnectorConfig | null) => void
  addConnector: (connector: ConnectorConfig) => void
  removeConnector: (id: string) => void
  updateConnector: (id: string, config: Partial<ConnectorConfig>) => void
}

export const useConnectorStore = create<ConnectorState>((set) => ({
  connectors: [],
  activeConnector: null,
  setConnectors: (connectors) => set({ connectors }),
  setActiveConnector: (connector) => set({ activeConnector: connector }),
  addConnector: (connector) =>
    set((state) => ({ connectors: [...state.connectors, connector] })),
  removeConnector: (id) =>
    set((state) => ({
      connectors: state.connectors.filter((c) => c.id !== id),
    })),
  updateConnector: (id, config) =>
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id ? { ...c, ...config } : c,
      ),
    })),
}))
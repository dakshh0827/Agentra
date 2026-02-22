import { create } from 'zustand'

export const useInteractionStore = create((set, get) => ({
  logs: [],
  activeCall: null,
  isExecuting: false,
  executionResult: null,

  addLog: (log) => set((state) => ({
    logs: [{ ...log, id: Date.now(), timestamp: new Date().toISOString() }, ...state.logs].slice(0, 100)
  })),

  setActiveCall: (call) => set({ activeCall: call }),
  setExecuting: (v) => set({ isExecuting: v }),
  setResult: (result) => set({ executionResult: result }),
  clearLogs: () => set({ logs: [] }),
  clearResult: () => set({ executionResult: null }),
}))
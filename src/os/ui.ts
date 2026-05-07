import { create } from "zustand";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
};

type UIStore = {
  spotlightOpen: boolean;
  appSwitcherOpen: boolean;
  appSwitcherIdx: number;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;

  toggleSpotlight: () => void;
  setSpotlight: (open: boolean) => void;
  openAppSwitcher: () => void;
  cycleAppSwitcher: (delta: number) => void;
  commitAppSwitcher: () => void; // closes; consumer reads idx + windows snapshot to focus
  cancelAppSwitcher: () => void;
  openContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
  closeAll: () => void;
};

export const useUI = create<UIStore>((set) => ({
  spotlightOpen: false,
  appSwitcherOpen: false,
  appSwitcherIdx: 0,
  contextMenu: null,

  toggleSpotlight: () =>
    set((s) => ({
      spotlightOpen: !s.spotlightOpen,
      contextMenu: null,
    })),
  setSpotlight: (open) => set({ spotlightOpen: open }),
  openAppSwitcher: () =>
    set({ appSwitcherOpen: true, appSwitcherIdx: 1 }),
  cycleAppSwitcher: (delta) =>
    set((s) => ({ appSwitcherIdx: s.appSwitcherIdx + delta })),
  commitAppSwitcher: () =>
    set({ appSwitcherOpen: false, appSwitcherIdx: 0 }),
  cancelAppSwitcher: () =>
    set({ appSwitcherOpen: false, appSwitcherIdx: 0 }),
  openContextMenu: (x, y, items) =>
    set({ contextMenu: { x, y, items }, spotlightOpen: false }),
  closeContextMenu: () => set({ contextMenu: null }),
  closeAll: () =>
    set({
      spotlightOpen: false,
      contextMenu: null,
      appSwitcherOpen: false,
    }),
}));

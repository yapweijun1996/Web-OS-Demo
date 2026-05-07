import { create } from "zustand";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
};

type UIStore = {
  spotlightOpen: boolean;
  appSwitcherOpen: boolean;
  appSwitcherIdx: number;
  missionControlOpen: boolean;
  notifCenterOpen: boolean;
  clipboardOpen: boolean;
  quickLookFileId: string | null;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;

  toggleSpotlight: () => void;
  setSpotlight: (open: boolean) => void;
  openAppSwitcher: () => void;
  cycleAppSwitcher: (delta: number) => void;
  commitAppSwitcher: () => void;
  cancelAppSwitcher: () => void;
  toggleMissionControl: () => void;
  setMissionControl: (open: boolean) => void;
  toggleNotifCenter: () => void;
  toggleClipboard: () => void;
  openQuickLook: (fileId: string) => void;
  closeQuickLook: () => void;
  openContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
  closeAll: () => void;
};

export const useUI = create<UIStore>((set) => ({
  spotlightOpen: false,
  appSwitcherOpen: false,
  appSwitcherIdx: 0,
  missionControlOpen: false,
  notifCenterOpen: false,
  clipboardOpen: false,
  quickLookFileId: null,
  contextMenu: null,

  toggleSpotlight: () =>
    set((s) => ({
      spotlightOpen: !s.spotlightOpen,
      contextMenu: null,
      missionControlOpen: false,
      clipboardOpen: false,
      quickLookFileId: null,
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
  toggleMissionControl: () =>
    set((s) => ({
      missionControlOpen: !s.missionControlOpen,
      contextMenu: null,
      spotlightOpen: false,
      clipboardOpen: false,
    })),
  setMissionControl: (open) => set({ missionControlOpen: open }),
  toggleNotifCenter: () =>
    set((s) => ({ notifCenterOpen: !s.notifCenterOpen })),
  toggleClipboard: () =>
    set((s) => ({
      clipboardOpen: !s.clipboardOpen,
      spotlightOpen: false,
      contextMenu: null,
    })),
  openQuickLook: (fileId) => set({ quickLookFileId: fileId }),
  closeQuickLook: () => set({ quickLookFileId: null }),
  openContextMenu: (x, y, items) =>
    set({ contextMenu: { x, y, items }, spotlightOpen: false }),
  closeContextMenu: () => set({ contextMenu: null }),
  closeAll: () =>
    set({
      spotlightOpen: false,
      contextMenu: null,
      appSwitcherOpen: false,
      missionControlOpen: false,
      notifCenterOpen: false,
      clipboardOpen: false,
      quickLookFileId: null,
    }),
}));

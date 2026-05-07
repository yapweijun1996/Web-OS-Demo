import { create } from "zustand";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
};

type UIStore = {
  startMenuOpen: boolean;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;

  toggleStartMenu: () => void;
  setStartMenu: (open: boolean) => void;
  openContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
  closeAll: () => void;
};

export const useUI = create<UIStore>((set) => ({
  startMenuOpen: false,
  contextMenu: null,

  toggleStartMenu: () =>
    set((s) => ({ startMenuOpen: !s.startMenuOpen, contextMenu: null })),
  setStartMenu: (open) => set({ startMenuOpen: open }),
  openContextMenu: (x, y, items) =>
    set({ contextMenu: { x, y, items }, startMenuOpen: false }),
  closeContextMenu: () => set({ contextMenu: null }),
  closeAll: () => set({ startMenuOpen: false, contextMenu: null }),
}));

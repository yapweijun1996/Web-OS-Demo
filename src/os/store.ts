import { create } from "zustand";
import type {
  WindowState,
  WindowId,
  SnapSide,
  Space,
  SpaceId,
} from "./types";

// Mac-style layout: thin top menu bar + floating bottom dock.
export const MENU_BAR_H = 28;
export const DOCK_H = 64;
export const DOCK_MARGIN = 12;
export const TOP_INSET = MENU_BAR_H;
export const BOTTOM_INSET = DOCK_H + DOCK_MARGIN * 2;

const Z_NORMALIZE_THRESHOLD = 100_000;

export const DEFAULT_SPACE_ID = "default";

export const workspaceWidth = () =>
  typeof window === "undefined" ? 1280 : window.innerWidth;
export const workspaceHeight = () =>
  typeof window === "undefined"
    ? 720 - TOP_INSET - BOTTOM_INSET
    : window.innerHeight - TOP_INSET - BOTTOM_INSET;

let counter = 0;
const newId = () =>
  `w${Date.now().toString(36)}-${(++counter).toString(36)}`;

type NewWindow = Omit<WindowState, "id" | "z" | "spaceId"> & {
  spaceId?: SpaceId;
};

type WindowStore = {
  windows: WindowState[];
  nextZ: number;
  spaces: Space[];
  activeSpaceId: SpaceId;

  open: (w: NewWindow) => WindowId;
  close: (id: WindowId) => void;
  focus: (id: WindowId) => void;
  move: (id: WindowId, x: number, y: number) => void;
  resize: (
    id: WindowId,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  minimize: (id: WindowId) => void;
  toggleMinimize: (id: WindowId) => void;
  toggleMaximize: (id: WindowId) => void;
  snapTo: (id: WindowId, side: SnapSide) => void;
  setTitle: (id: WindowId, title: string) => void;

  addSpace: () => SpaceId;
  removeSpace: (id: SpaceId) => void;
  switchSpace: (id: SpaceId) => void;
  cycleSpace: (delta: number) => void;
  moveWindowToSpace: (windowId: WindowId, spaceId: SpaceId) => void;
  renameSpace: (id: SpaceId, name: string) => void;
};

export const useWindows = create<WindowStore>((set, get) => ({
  windows: [],
  nextZ: 1,
  spaces: [{ id: DEFAULT_SPACE_ID, name: "Desktop 1" }],
  activeSpaceId: DEFAULT_SPACE_ID,

  open: (w) => {
    const id = newId();
    const z = get().nextZ + 1;
    const spaceId = w.spaceId ?? get().activeSpaceId;
    set({
      windows: [...get().windows, { ...w, id, z, spaceId }],
      nextZ: z,
    });
    return id;
  },

  close: (id) =>
    set({ windows: get().windows.filter((w) => w.id !== id) }),

  focus: (id) => {
    const z = get().nextZ + 1;
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, z } : w)),
      nextZ: z,
    });
    if (z > Z_NORMALIZE_THRESHOLD) {
      const sorted = [...get().windows].sort((a, b) => a.z - b.z);
      const map = new Map(sorted.map((w, i) => [w.id, i + 1]));
      set({
        windows: get().windows.map((w) => ({ ...w, z: map.get(w.id)! })),
        nextZ: sorted.length + 1,
      });
    }
  },

  move: (id, x, y) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x, y } : w,
      ),
    }),

  resize: (id, x, y, width, height) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x, y, width, height } : w,
      ),
    }),

  minimize: (id) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w,
      ),
    }),

  toggleMinimize: (id) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, minimized: !w.minimized } : w,
      ),
    }),

  toggleMaximize: (id) => {
    const w = get().windows.find((ww) => ww.id === id);
    if (!w) return;
    if ((w.maximized || w.snap) && w.prev) {
      const prev = w.prev;
      set({
        windows: get().windows.map((ww) =>
          ww.id === id
            ? {
                ...ww,
                x: prev.x,
                y: prev.y,
                width: prev.width,
                height: prev.height,
                maximized: false,
                snap: undefined,
                prev: undefined,
              }
            : ww,
        ),
      });
    } else {
      set({
        windows: get().windows.map((ww) =>
          ww.id === id
            ? {
                ...ww,
                prev: {
                  x: ww.x,
                  y: ww.y,
                  width: ww.width,
                  height: ww.height,
                },
                x: 0,
                y: 0,
                width: workspaceWidth(),
                height: workspaceHeight(),
                maximized: true,
                snap: undefined,
              }
            : ww,
        ),
      });
    }
  },

  snapTo: (id, side) => {
    const w = get().windows.find((ww) => ww.id === id);
    if (!w) return;
    // If already snapped to the same side → restore.
    if (w.snap === side && w.prev) {
      get().toggleMaximize(id); // reuses restore-from-prev path
      return;
    }
    const W = workspaceWidth();
    const H = workspaceHeight();
    const halfW = Math.floor(W / 2);
    const targetX = side === "left" ? 0 : halfW;
    set({
      windows: get().windows.map((ww) =>
        ww.id === id
          ? {
              ...ww,
              prev:
                ww.snap || ww.maximized
                  ? ww.prev
                  : {
                      x: ww.x,
                      y: ww.y,
                      width: ww.width,
                      height: ww.height,
                    },
              x: targetX,
              y: 0,
              width: halfW,
              height: H,
              maximized: false,
              snap: side,
            }
          : ww,
      ),
    });
  },

  setTitle: (id, title) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, title } : w,
      ),
    }),

  addSpace: () => {
    const idx = get().spaces.length + 1;
    const id = `space-${Date.now().toString(36)}`;
    const space: Space = { id, name: `Desktop ${idx}` };
    set({ spaces: [...get().spaces, space], activeSpaceId: id });
    return id;
  },

  removeSpace: (id) => {
    const spaces = get().spaces;
    if (spaces.length <= 1) return; // never remove the last space
    const remaining = spaces.filter((s) => s.id !== id);
    const fallback = remaining[0].id;
    set({
      spaces: remaining,
      // reassign windows from removed space → fallback (don't lose them)
      windows: get().windows.map((w) =>
        w.spaceId === id ? { ...w, spaceId: fallback } : w,
      ),
      activeSpaceId:
        get().activeSpaceId === id ? fallback : get().activeSpaceId,
    });
  },

  switchSpace: (id) => {
    if (!get().spaces.some((s) => s.id === id)) return;
    set({ activeSpaceId: id });
  },

  cycleSpace: (delta) => {
    const spaces = get().spaces;
    const idx = spaces.findIndex((s) => s.id === get().activeSpaceId);
    if (idx === -1) return;
    const next =
      ((idx + delta) % spaces.length + spaces.length) % spaces.length;
    set({ activeSpaceId: spaces[next].id });
  },

  moveWindowToSpace: (windowId, spaceId) => {
    if (!get().spaces.some((s) => s.id === spaceId)) return;
    set({
      windows: get().windows.map((w) =>
        w.id === windowId ? { ...w, spaceId } : w,
      ),
    });
  },

  renameSpace: (id, name) => {
    set({
      spaces: get().spaces.map((s) => (s.id === id ? { ...s, name } : s)),
    });
  },
}));

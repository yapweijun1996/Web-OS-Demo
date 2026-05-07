import { create } from "zustand";
import type { WindowState, WindowId } from "./types";

export const TASKBAR_H = 48;
const Z_NORMALIZE_THRESHOLD = 100_000;

let counter = 0;
const newId = () =>
  `w${Date.now().toString(36)}-${(++counter).toString(36)}`;

type NewWindow = Omit<WindowState, "id" | "z">;

type WindowStore = {
  windows: WindowState[];
  nextZ: number;

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
  setTitle: (id: WindowId, title: string) => void;
};

export const useWindows = create<WindowStore>((set, get) => ({
  windows: [],
  nextZ: 1,

  open: (w) => {
    const id = newId();
    const z = get().nextZ + 1;
    set({
      windows: [...get().windows, { ...w, id, z }],
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
    if (w.maximized && w.prev) {
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
                width: window.innerWidth,
                height: window.innerHeight - TASKBAR_H,
                maximized: true,
              }
            : ww,
        ),
      });
    }
  },

  setTitle: (id, title) =>
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, title } : w,
      ),
    }),
}));

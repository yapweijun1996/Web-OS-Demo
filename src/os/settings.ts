import { create } from "zustand";

export const WALLPAPERS = [
  {
    id: "ocean",
    name: "Ocean",
    classes: "from-sky-700 via-indigo-800 to-indigo-900",
  },
  {
    id: "sunset",
    name: "Sunset",
    classes: "from-orange-500 via-red-600 to-pink-700",
  },
  {
    id: "forest",
    name: "Forest",
    classes: "from-emerald-700 via-teal-800 to-emerald-900",
  },
  {
    id: "mono",
    name: "Mono",
    classes: "from-zinc-700 via-zinc-800 to-zinc-900",
  },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

type SettingsStore = {
  wallpaper: WallpaperId;
  setWallpaper: (id: WallpaperId) => void;
};

export const useSettings = create<SettingsStore>((set) => ({
  wallpaper: "ocean",
  setWallpaper: (id) => set({ wallpaper: id }),
}));

export const wallpaperClasses = (id: WallpaperId): string =>
  WALLPAPERS.find((w) => w.id === id)?.classes ?? WALLPAPERS[0].classes;

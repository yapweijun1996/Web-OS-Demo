import type { AppDef } from "./types";
import {
  StickyNote,
  Calculator as CalcIcon,
  Info,
  Settings as SettingsIcon,
} from "lucide-react";
import { Notes } from "../apps/notes/Notes";
import { Calc } from "../apps/calc/Calc";
import { About } from "../apps/about/About";
import { Settings } from "../apps/settings/Settings";

export const APPS: Record<string, AppDef> = {
  notes: {
    id: "notes",
    name: "Notes",
    icon: StickyNote,
    defaultSize: { width: 480, height: 360 },
    Component: Notes,
    singleton: true,
  },
  calc: {
    id: "calc",
    name: "Calculator",
    icon: CalcIcon,
    defaultSize: { width: 280, height: 400 },
    Component: Calc,
  },
  about: {
    id: "about",
    name: "About",
    icon: Info,
    defaultSize: { width: 400, height: 280 },
    Component: About,
    singleton: true,
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: SettingsIcon,
    defaultSize: { width: 420, height: 280 },
    Component: Settings,
    singleton: true,
  },
};

export const APP_LIST: AppDef[] = Object.values(APPS);

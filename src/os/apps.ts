import type { AppDef } from "./types";
import { Hand } from "lucide-react";
import { Hello } from "../apps/hello/Hello";

export const APPS: Record<string, AppDef> = {
  hello: {
    id: "hello",
    name: "Hello",
    icon: Hand,
    defaultSize: { width: 360, height: 220 },
    Component: Hello,
  },
};

export const APP_LIST: AppDef[] = Object.values(APPS);

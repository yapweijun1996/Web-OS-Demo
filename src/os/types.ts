import type { ComponentType, CSSProperties } from "react";

export type WindowId = string;

export type SnapSide = "left" | "right";

export type WindowState = {
  id: WindowId;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  snap?: SnapSide;
  prev?: { x: number; y: number; width: number; height: number };
  /**
   * App-specific JSON-serializable data passed at launch and persisted with
   * the window. Used e.g. by Notes to remember which file is open.
   */
  appData?: Record<string, unknown>;
};

export type AppIconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export type AppDef = {
  id: string;
  name: string;
  icon: ComponentType<AppIconProps>;
  defaultSize: { width: number; height: number };
  Component: ComponentType<{ windowId: WindowId }>;
  singleton?: boolean;
};

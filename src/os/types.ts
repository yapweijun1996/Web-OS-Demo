import type { ComponentType } from "react";

export type WindowId = string;

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
  prev?: { x: number; y: number; width: number; height: number };
};

export type AppIconProps = { size?: number; className?: string };

export type AppDef = {
  id: string;
  name: string;
  icon: ComponentType<AppIconProps>;
  defaultSize: { width: number; height: number };
  Component: ComponentType<{ windowId: WindowId }>;
  singleton?: boolean;
};

# Web OS Demo

A browser-based Mac OS-style desktop environment. Windows, dock, Spotlight,
Mission Control, virtual desktops, files, themes — installable as a PWA.

[![Deploy to GitHub Pages](https://github.com/yapweijun1996/Web-OS-Demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/yapweijun1996/Web-OS-Demo/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](https://yapweijun1996.github.io/Web-OS-Demo/)

### 👉 [**Try it live**](https://yapweijun1996.github.io/Web-OS-Demo/)

Open in Chrome / Edge / Safari — works offline, installs to your home screen
or dock as a real-feeling desktop app.

---

## What's inside

A complete Mac OS-style shell built from scratch:

- **Top menu bar** — Apple icon, focused app name, active space, clock that opens Notification Center
- **Floating dock** — magnified hover (Apple's exact `cubic-bezier(.32,.72,0,1)`), per-app running indicators
- **Windows** — traffic-light controls on the left, frosted-glass vibrancy, drag/resize, double-click titlebar to maximize
- **Spotlight** (`⌘K` / `⌘Space`) — search apps + files + safe arithmetic (`17*42 → 714, Enter to copy`)
- **App Switcher** (`⌘Tab`) — horizontal switcher with thumbnails, hold ⌘ to cycle, release to commit
- **Mission Control** (`F3` / `⌃↑`) — bird's-eye grid of all windows + space thumbnails + add/remove spaces
- **Spaces** (`⌃1..9`, `⌃←/→`) — multiple virtual desktops, each with isolated window state
- **Tiling** (`⌃⌘ ←/→/↑`) — snap to half-screen / maximize, like macOS Sequoia
- **Quick Look** (Space on a selected file) — preview file content without opening it
- **Notification Center** — right-side slide panel with date widget, spaces overview, recent notifications
- **Clipboard history** (`⌘⇧V`) — last 12 copied strings, click to re-copy
- **Drag & drop between apps** — Files → Notes inserts content; text → Files creates a new file
- **Virtual file system** — IndexedDB-backed, multi-file Notes, File Explorer with breadcrumbs
- **Themes** — dark / light glass + 4 wallpapers (Ocean / Sunset / Forest / Mono)
- **Persistence** — schema-versioned localStorage for window layout + wallpaper + theme + spaces
- **PWA** — installable, offline-capable, auto-updates

## Tech stack

- **React 19** + **Vite 8** + **TypeScript** (strict + `verbatimModuleSyntax`)
- **Tailwind CSS v4** for styling — dynamic gradients via literal class strings
- **Zustand** stores: 5 separate concerns (windows, ui, settings, vfs, notifications)
- **react-rnd** for drag/resize
- **idb** for IndexedDB
- **vite-plugin-pwa** + Workbox for service worker / manifest
- **lucide-react** for icons
- ~3000 LOC, 91 KB gzipped

Zero backend. Pure SPA — installable, offline, all state local.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `⌘K` or `⌘Space` | Spotlight |
| `⌘Tab` (hold ⌘) | App Switcher (`⇧⌘Tab` reverse) |
| `⌘W` | Close focused window |
| `⌃⌘ ←/→` | Snap window to left/right half |
| `⌃⌘ ↑/↓` | Maximize / restore |
| `F3` or `⌃↑` | Mission Control |
| `⌃1..9` | Jump to Space N |
| `⌃ ←/→` | Cycle Spaces |
| `⌘⇧V` | Clipboard history |
| `Space` | Quick Look (in Files Explorer) |
| `Esc` | Dismiss any overlay |

Click the menu-bar clock to open Notification Center. Right-click the desktop
for a context menu. Double-click a titlebar to toggle maximize.

## Run locally

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # production bundle in dist/
npm run preview  # serve dist/ locally
```

## Deploy

GitHub Pages CI is wired in `.github/workflows/deploy.yml`. Any push to
`main` builds with `BASE_PATH=/Web-OS-Demo/` and publishes via the official
`actions/deploy-pages@v4` flow. To deploy elsewhere (Cloudflare Pages,
Netlify, custom domain), unset `BASE_PATH` and the build defaults to `/`.

## Architecture

```
src/
├── App.tsx                      # composes shell + global keymap
├── main.tsx                     # hydrate stores, mount React
├── os/                          # state + logic
│   ├── store.ts                 # windows[], spaces[], z-index, snap/tile
│   ├── ui.ts                    # transient overlays (spotlight, switcher, …)
│   ├── settings.ts              # theme + wallpaper
│   ├── notifications.ts         # notifications + clipboard history
│   ├── persistence.ts           # localStorage schema v2 + migration
│   ├── apps.ts                  # APP registry
│   ├── launcher.ts              # launchApp(appId, opts)
│   ├── pwa.ts                   # beforeinstallprompt capture
│   └── vfs/                     # IndexedDB virtual file system
├── shell/                       # OS chrome
│   ├── MenuBar.tsx
│   ├── Dock.tsx                 # magnification effect
│   ├── Window.tsx               # traffic lights, drag/resize
│   ├── WindowHost.tsx           # space-filtered renderer
│   ├── Spotlight.tsx
│   ├── AppSwitcher.tsx
│   ├── MissionControl.tsx
│   ├── NotificationCenter.tsx
│   ├── ClipboardHistory.tsx
│   ├── QuickLook.tsx
│   ├── ContextMenu.tsx
│   └── Clock.tsx
└── apps/                        # built-in apps
    ├── files/Files.tsx          # File Explorer with drag/drop + Quick Look
    ├── notes/Notes.tsx          # multi-file text editor
    ├── calc/Calc.tsx            # 4-function calculator
    ├── about/About.tsx
    └── settings/Settings.tsx
```

Each Zustand store owns one slice — no cross-store dependencies in the data
layer. Keyboard shortcuts live in a single keymap in `App.tsx` so binding
collisions are immediately visible.

## Roadmap ideas

- AI-powered Spotlight (chat with files)
- Real multi-user collaboration (CRDT)
- More apps (browser/iframe, todo, terminal)
- Window snap-to-edge during drag
- Mobile / touch UX

## License

[MIT](LICENSE) — free to use, modify, distribute (including commercial).

If you build something cool with this, [drop a ⭐](https://github.com/yapweijun1996/Web-OS-Demo)
or open an issue.

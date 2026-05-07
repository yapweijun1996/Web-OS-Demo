import { create } from "zustand";

/**
 * Captures the browser's beforeinstallprompt event so an in-app "Install"
 * button can trigger the native add-to-home-screen flow on demand instead of
 * relying on the browser's own (often hidden) install affordance.
 *
 * Browser behavior: the event fires once per page load when the PWA install
 * criteria are met (manifest present, served over HTTPS or localhost, SW
 * registered). After prompt() is called the event becomes single-use.
 */

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PWAStore = {
  installPrompt: DeferredPrompt | null;
  installed: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

export const usePWA = create<PWAStore>((set, get) => ({
  installPrompt: null,
  installed:
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches,

  promptInstall: async () => {
    const p = get().installPrompt;
    if (!p) return "unavailable";
    await p.prompt();
    const choice = await p.userChoice;
    set({ installPrompt: null });
    if (choice.outcome === "accepted") set({ installed: true });
    return choice.outcome;
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    usePWA.setState({ installPrompt: e as DeferredPrompt });
  });
  window.addEventListener("appinstalled", () => {
    usePWA.setState({ installed: true, installPrompt: null });
  });
}

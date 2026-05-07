export function About() {
  return (
    <div className="p-6 space-y-3 text-sm">
      <h2 className="text-xl font-semibold">Web OS Demo</h2>
      <p className="opacity-80">
        A browser-based desktop environment built with React 19, Vite,
        Tailwind v4, Zustand, and react-rnd.
      </p>
      <ul className="opacity-70 list-disc pl-5 space-y-1 text-xs">
        <li>Window manager: Zustand store, monotonic z-index, react-rnd</li>
        <li>Apps: Notes, Calculator, Settings, About</li>
        <li>Persistence: window layout via localStorage</li>
        <li>Right-click desktop, double-click icon, ESC dismisses menus</li>
      </ul>
      <div className="pt-3 border-t border-[var(--os-border)] text-xs opacity-50">
        v0.1 · github.com/yapweijun1996/Web-OS-Demo
      </div>
    </div>
  );
}

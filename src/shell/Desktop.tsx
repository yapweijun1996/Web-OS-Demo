import { launchApp } from "../os/launcher";
import { useUI } from "../os/ui";

export function Desktop() {
  const openContextMenu = useUI((s) => s.openContextMenu);
  const toggleSpotlight = useUI((s) => s.toggleSpotlight);

  return (
    <div
      className="absolute inset-0"
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, [
          {
            label: "Open Spotlight (⌘K)",
            onClick: () => toggleSpotlight(),
          },
          {
            label: "About Web OS",
            onClick: () => launchApp("about"),
          },
          {
            label: "Refresh desktop",
            onClick: () => window.location.reload(),
          },
        ]);
      }}
    />
  );
}

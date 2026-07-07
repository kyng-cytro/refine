# @refine/desktop

Cross-platform Electron desktop app for Refine (Windows, macOS, Linux).

## Development

```bash
bun run desktop:dev      # from repo root
```

The main process owns all API calls (via `@refine/sdk`), the session token
(encrypted with Electron `safeStorage`), and settings (persisted to
`settings.json` in the app's userData dir). The renderer is a React + Tailwind
SPA that mirrors the main-process state over IPC.

## Global shortcut flow

Select text anywhere, press the shortcut (default `Ctrl/⌘+Shift+R`). The app
reads the selection, refines it via the API, and puts the result on the
clipboard. With **Auto-apply** enabled it also pastes the result back.

Copy/paste simulation support by platform:

- **Windows** — PowerShell `SendKeys`.
- **macOS** — `osascript`. Requires granting Accessibility permission on first
  use (System Settings → Privacy & Security → Accessibility).
- **Linux (X11)** — requires `xdotool` (`sudo apt install xdotool`).
- **Linux (Wayland)** — keystroke simulation is not permitted. The app falls
  back to **manual mode**: copy the text yourself, press the shortcut to refine
  the clipboard, then paste the result. Auto-apply is disabled in this mode.
  Note that the global shortcut itself may not register under some Wayland
  compositors (e.g. GNOME); Settings shows a warning when registration fails.

## Packaging

```bash
bun run desktop:dist            # current platform
cd apps/desktop && bun run dist:linux   # AppImage + deb
```

The `refine://` protocol is registered for deep-link pairing.

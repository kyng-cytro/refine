---
"@refine/desktop": minor
---

Support launch at login on Linux via an XDG autostart entry (`~/.config/autostart/refine.desktop`), since Electron's login-item API is macOS/Windows only. The "Launch at login" toggle now shows on Linux, and the entry's exec path is refreshed on startup so it survives AppImage moves and updates.

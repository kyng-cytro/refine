---
"@refine/desktop": patch
---

Fix the desktop release build: pin Electron to an exact version (electron-builder can't resolve a range) and stop electron-builder's implicit CI publish.

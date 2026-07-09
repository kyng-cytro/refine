# @refine/desktop

## 0.2.1

### Patch Changes

- bdd6432: Change the default shortcuts from Ctrl/⌘+Shift+R and Ctrl/⌘+Shift+T to Ctrl/⌘+Alt+R and Ctrl/⌘+Alt+T to avoid clashing with common browser shortcuts (hard reload, reopen closed tab). Existing installs keep their saved shortcuts; only fresh installs get the new defaults.

## 0.2.0

### Minor Changes

- c1e394e: Add History privacy controls in settings: "Save history" toggles server persistence off entirely, and "Private" keeps saved refinements out of the admin dashboard. Both desktop and mobile send the corresponding flags on every refine and skip the local Recents entry when saving is off.
- 115de6c: Add a manual refresh that reloads configs (models, tones) and history. Desktop gets a refresh button in the History header; mobile gets a header refresh button and its pull-to-refresh now reloads configs too (works even when the history list is empty). Mobile's fetch logic is consolidated into a single reusable `refreshAll`.
- 9c576b1: Add a global shortcut to cycle through tones (default Ctrl/⌘+Shift+T), showing the newly selected tone in the overlay. The shortcut layer now supports multiple named shortcuts, and settings groups them under a dedicated "Shortcuts" section (Refine selection, Cycle tone) separate from "Behavior".
- d4d129c: Support launch at login on Linux via an XDG autostart entry (`~/.config/autostart/refine.desktop`), since Electron's login-item API is macOS/Windows only. The "Launch at login" toggle now shows on Linux, and the entry's exec path is refreshed on startup so it survives AppImage moves and updates.

### Patch Changes

- 975c9c7: Retry the shortcut copy so text is still captured when the trigger keys are held, and skip re-refining an unchanged selection (reuses the cached result instead of duplicating the API call and history entry).

## 0.1.0

### Minor Changes

- [#6](https://github.com/kyng-cytro/refine/pull/6) [`704aa74`](https://github.com/kyng-cytro/refine/commit/704aa744910d0697103622af91a54cc700a84ee2) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Initial 0.1.0 release: self-hostable API + admin (Docker image on GHCR), the Electron desktop app (Windows/macOS/Linux installers), and the mobile app (EAS Android build). Includes device types (mobile/desktop/browser) across pairing.

## 0.1.1

### Patch Changes

- [#4](https://github.com/kyng-cytro/refine/pull/4) [`4959c0b`](https://github.com/kyng-cytro/refine/commit/4959c0b24c0ab25691c2d9b828f306493379d042) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Fix the desktop release build: pin Electron to an exact version (electron-builder can't resolve a range) and stop electron-builder's implicit CI publish.

## 0.1.0

### Minor Changes

- [#2](https://github.com/kyng-cytro/refine/pull/2) [`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Add the Electron desktop app (Material 3 UI, global-shortcut refine flow, system tray, overlay indicator, `refine://` deep-link pairing) and first-class device types (`mobile` | `desktop` | `browser`) threaded through pairing tokens, sessions, the deep link, and the admin UI.

### Patch Changes

- Updated dependencies [[`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb)]:
  - @refine/schemas@0.1.0
  - @refine/sdk@0.0.1

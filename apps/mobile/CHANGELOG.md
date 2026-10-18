# @refine/mobile

## 0.3.0

### Minor Changes

- 6124562: Apps and the server now report their versions to each other. When either side is out of date the app prompts to update, and when it's below the minimum supported version it blocks with an option to update or disconnect. The desktop app updates itself on Windows and Linux AppImage, the mobile app receives over-the-air updates, Settings shows the app and server versions, and the admin Devices tab shows each device's app version.

### Patch Changes

- 6124562: Reject duplicate global tone slugs, renaming any existing duplicates during migration, and return a 409 instead of a 500 when a tone slug is taken. Undo deletes in the UI when the request fails, show errors when saving a tone fails on mobile, and fix pairing links whose device name contains a `%`.

## 0.2.0

### Minor Changes

- c1e394e: Add History privacy controls in settings: "Save history" toggles server persistence off entirely, and "Private" keeps saved refinements out of the admin dashboard. Both desktop and mobile send the corresponding flags on every refine and skip the local Recents entry when saving is off.
- 115de6c: Add a manual refresh that reloads configs (models, tones) and history. Desktop gets a refresh button in the History header; mobile gets a header refresh button and its pull-to-refresh now reloads configs too (works even when the history list is empty). Mobile's fetch logic is consolidated into a single reusable `refreshAll`.

## 0.1.0

### Minor Changes

- [#6](https://github.com/kyng-cytro/refine/pull/6) [`704aa74`](https://github.com/kyng-cytro/refine/commit/704aa744910d0697103622af91a54cc700a84ee2) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Initial 0.1.0 release: self-hostable API + admin (Docker image on GHCR), the Electron desktop app (Windows/macOS/Linux installers), and the mobile app (EAS Android build). Includes device types (mobile/desktop/browser) across pairing.

## 1.0.2

### Patch Changes

- [#4](https://github.com/kyng-cytro/refine/pull/4) [`3fd828d`](https://github.com/kyng-cytro/refine/commit/3fd828d8ce00d53b30390be5d22c3d28a3b243e7) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Cut a mobile release through the CI pipeline (EAS-managed versionCode via remote autoIncrement).

## 1.0.1

### Patch Changes

- Updated dependencies [[`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb)]:
  - @refine/schemas@0.1.0
  - @refine/sdk@0.0.1

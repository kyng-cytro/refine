# @refine/admin

## 0.4.0

### Minor Changes

- 6124562: Apps and the server now report their versions to each other. When either side is out of date the app prompts to update, and when it's below the minimum supported version it blocks with an option to update or disconnect. The desktop app updates itself on Windows and Linux AppImage, the mobile app receives over-the-air updates, Settings shows the app and server versions, and the admin Devices tab shows each device's app version.

### Patch Changes

- 6124562: Reject duplicate global tone slugs, renaming any existing duplicates during migration, and return a 409 instead of a 500 when a tone slug is taken. Undo deletes in the UI when the request fails, show errors when saving a tone fails on mobile, and fix pairing links whose device name contains a `%`.

## 0.3.1

## 0.3.0

### Minor Changes

- 6be04b6: Show each model's list price (USD per 1M tokens) next to it in the provider cards, alongside the existing Free badge for free models.

## 0.2.0

### Minor Changes

- 69347d2: Add a usage overview to the admin dashboard: total refines and tokens, refines-per-day, and breakdowns by model, tone, and device over a selectable time range. Backed by a new `GET /admin/usage` endpoint that aggregates history (excluding private entries). Cost estimates are shown when an operator-provided per-model price map is configured.

## 0.1.0

## 0.1.0

### Minor Changes

- [#2](https://github.com/kyng-cytro/refine/pull/2) [`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Add the Electron desktop app (Material 3 UI, global-shortcut refine flow, system tray, overlay indicator, `refine://` deep-link pairing) and first-class device types (`mobile` | `desktop` | `browser`) threaded through pairing tokens, sessions, the deep link, and the admin UI.

### Patch Changes

- Updated dependencies [[`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb)]:
  - @refine/schemas@0.1.0

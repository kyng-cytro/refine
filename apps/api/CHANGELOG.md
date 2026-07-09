# @refine/api

## 0.2.0

### Minor Changes

- 69347d2: Add a usage overview to the admin dashboard: total refines and tokens, refines-per-day, and breakdowns by model, tone, and device over a selectable time range. Backed by a new `GET /admin/usage` endpoint that aggregates history (excluding private entries). Cost estimates are shown when an operator-provided per-model price map is configured.
- 897739c: Record token usage on each refine and honor per-request `save`/`private` flags: `save: false` skips history persistence entirely, and `private: true` stores the entry but hides it from the admin history view. Adds `is_private` and token columns to the history table.
- cb9754b: Add `POST /admin/history/prune` so retention can be driven by an external scheduler (e.g. cron-job.org) instead of only the built-in interval. Uses `HISTORY_RETENTION_DAYS` by default, or an optional `?days=N` override, and returns the number of rows deleted.
- 4e41f50: Add an optional history retention policy. Set `HISTORY_RETENTION_DAYS` to auto-delete history older than N days; a cleanup job runs at startup and every 12 hours. Unset or `0` keeps history forever.

## 0.1.0

### Minor Changes

- [#6](https://github.com/kyng-cytro/refine/pull/6) [`704aa74`](https://github.com/kyng-cytro/refine/commit/704aa744910d0697103622af91a54cc700a84ee2) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Initial 0.1.0 release: self-hostable API + admin (Docker image on GHCR), the Electron desktop app (Windows/macOS/Linux installers), and the mobile app (EAS Android build). Includes device types (mobile/desktop/browser) across pairing.

## 0.1.0

### Minor Changes

- [#2](https://github.com/kyng-cytro/refine/pull/2) [`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb) Thanks [@kyng-cytro](https://github.com/kyng-cytro)! - Add the Electron desktop app (Material 3 UI, global-shortcut refine flow, system tray, overlay indicator, `refine://` deep-link pairing) and first-class device types (`mobile` | `desktop` | `browser`) threaded through pairing tokens, sessions, the deep link, and the admin UI.

### Patch Changes

- Updated dependencies [[`2705d25`](https://github.com/kyng-cytro/refine/commit/2705d25a0bcdc7166bed5bd71363e14f8bc836eb)]:
  - @refine/schemas@0.1.0
  - @refine/db@0.1.0

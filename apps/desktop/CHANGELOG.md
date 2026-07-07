# @refine/desktop

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

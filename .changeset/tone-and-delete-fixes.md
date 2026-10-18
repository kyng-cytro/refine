---
"@refine/api": patch
"@refine/admin": patch
"@refine/desktop": patch
"@refine/mobile": patch
---

Reject duplicate global tone slugs, renaming any existing duplicates during migration, and return a 409 instead of a 500 when a tone slug is taken. Undo deletes in the UI when the request fails, show errors when saving a tone fails on mobile, and fix pairing links whose device name contains a `%`.

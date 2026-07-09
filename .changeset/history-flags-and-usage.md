---
"@refine/api": minor
---

Record token usage on each refine and honor per-request `save`/`private` flags: `save: false` skips history persistence entirely, and `private: true` stores the entry but hides it from the admin history view. Adds `is_private` and token columns to the history table.

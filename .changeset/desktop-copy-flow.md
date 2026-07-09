---
"@refine/desktop": patch
---

Retry the shortcut copy so text is still captured when the trigger keys are held, and skip re-refining an unchanged selection (reuses the cached result instead of duplicating the API call and history entry).

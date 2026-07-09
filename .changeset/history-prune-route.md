---
"@refine/api": minor
---

Add `POST /admin/history/prune` so retention can be driven by an external scheduler (e.g. cron-job.org) instead of only the built-in interval. Uses `HISTORY_RETENTION_DAYS` by default, or an optional `?days=N` override, and returns the number of rows deleted.

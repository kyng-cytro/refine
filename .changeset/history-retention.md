---
"@refine/api": minor
---

Add an optional history retention policy. Set `HISTORY_RETENTION_DAYS` to auto-delete history older than N days; a cleanup job runs at startup and every 12 hours. Unset or `0` keeps history forever.

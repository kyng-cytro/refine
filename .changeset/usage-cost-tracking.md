---
"@refine/api": minor
---

Record every refine in a dedicated `usage` table with token counts and a cost snapshot computed from the model's list price at request time. Usage rows survive history pruning and privacy settings via optional links to history and session, and the admin usage endpoint now reads stored costs instead of a hardcoded price map. Existing history token data is backfilled into the new table.

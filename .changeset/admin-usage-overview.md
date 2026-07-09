---
"@refine/api": minor
"@refine/admin": minor
---

Add a usage overview to the admin dashboard: total refines and tokens, refines-per-day, and breakdowns by model, tone, and device over a selectable time range. Backed by a new `GET /admin/usage` endpoint that aggregates history (excluding private entries). Cost estimates are shown when an operator-provided per-model price map is configured.

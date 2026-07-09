---
"@refine/desktop": minor
"@refine/mobile": minor
---

Add a manual refresh that reloads configs (models, tones) and history. Desktop gets a refresh button in the History header; mobile gets a header refresh button and its pull-to-refresh now reloads configs too (works even when the history list is empty). Mobile's fetch logic is consolidated into a single reusable `refreshAll`.

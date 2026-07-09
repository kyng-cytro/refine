---
"@refine/desktop": minor
"@refine/mobile": minor
---

Add History privacy controls in settings: "Save history" toggles server persistence off entirely, and "Private" keeps saved refinements out of the admin dashboard. Both desktop and mobile send the corresponding flags on every refine and skip the local Recents entry when saving is off.

---
"@refine/desktop": patch
---

Fix the refine overlay failing to appear after the machine resumes from sleep or hibernation. The overlay window is now built on demand and torn down once idle or on a power event, rather than created at startup and reused for the lifetime of the app — a long-lived transparent window can come back from suspend without a working surface and never paint again. It is also rebuilt if its renderer crashes, and its initial state is seeded into the window URL so the first painted frame is correct.

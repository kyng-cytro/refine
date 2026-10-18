---
"@refine/api": minor
"@refine/admin": minor
"@refine/desktop": minor
"@refine/mobile": minor
---

Apps and the server now report their versions to each other. When either side is out of date the app prompts to update, and when it's below the minimum supported version it blocks with an option to update or disconnect. The desktop app updates itself on Windows and Linux AppImage, the mobile app receives over-the-air updates, Settings shows the app and server versions, and the admin Devices tab shows each device's app version.

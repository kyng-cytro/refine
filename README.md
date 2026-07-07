# Refine

An unintrusive, self-hosted text refinement tool. Select text anywhere on Android, tap **Refine** — your text is rewritten by an LLM of your choice, in a tone of your choice, using your own API keys on your own server.

No subscriptions. No shared infrastructure. You control the models, the tones, and the keys.

**Three pieces:**
- **API** — Hono server (Bun) that holds your provider credentials and handles refinements
- **Admin panel** — React SPA for managing providers, devices, and pairing tokens
- **Mobile app** — dedicated input surface plus system context menu action for refining selected text in-place

**[→ Self-Hosting Guide](GUIDE.md)**

---

## Monorepo

```
refine/
├── apps/
│   ├── api/        Hono HTTP API (Bun runtime)
│   ├── admin/      React SPA — provider & device management
│   ├── desktop/    Electron desktop app (Windows/macOS/Linux)
│   └── mobile/     Expo React Native app (Android only)
├── packages/
│   ├── db/         Drizzle ORM schema, migrations, seed
│   ├── models/     Provider/model catalog + icons
│   ├── schemas/    Zod types shared across API, admin, SDK, apps
│   └── sdk/        Typed API client used by mobile and desktop
```

**Tooling:** Bun, Turbo, TypeScript.

---

## Local development

```bash
bun install
bun run db:migrate && bun run db:seed
bun run dev
```

Copy `apps/api/.env.example` to `apps/api/.env` before running.

| Command | What it does |
|---|---|
| `bun run dev` | API + admin dev servers |
| `bun run api:dev` | API only |
| `bun run admin:dev` | Admin only |
| `bun run admin:build` | Production build (outputs to `apps/api/public/admin/`) |
| `bun run type-check` | TypeScript across all packages |
| `bun run db:generate` | Generate migration SQL from schema changes |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:seed` | Seed default data |
| `bun run desktop:dev` | Electron desktop app in dev |
| `bun run desktop:dist` | Build desktop installers for the current OS |
| `bun run mobile:android` | Build and run Android app |
| `bun run mobile:prebuild` | Expo prebuild (generates native `android/`) |
| `bun changeset` | Add a changeset (run in every PR that changes a package) |

---

## Adding a provider

All provider definitions live in `packages/models/src/`. Admin and mobile consume them directly — three files to touch.

### 1. Type — `packages/models/src/types.ts`

```ts
export type ModelProvider = "openrouter" | "openai" | "anthropic" | "google" | "yourprovider"
```

### 2. Icon — `packages/models/src/icons/index.ts`

Icons come from `simple-icons`. Add the import and export it:

```ts
import { siYourprovider } from "simple-icons"

export const icons = {
  yourprovider: fromSi(siYourprovider),
}
```

If the provider isn't in `simple-icons`, inline the SVG as a string with `fill="currentColor"`.

### 3. Provider entry — `packages/models/src/index.ts`

```bash
bun add @ai-sdk/yourprovider --cwd packages/models
```

```ts
import { createYourProvider } from "@ai-sdk/yourprovider"

{
  id: "yourprovider",
  label: "Your Provider",
  description: "Short description shown in the admin panel",
  placeholder: "key-prefix…",
  docs: "https://yourprovider.com/api-keys",
  icon: icons.yourprovider,
  create: (apiKey) => createYourProvider({ apiKey }),
  models: [
    { id: "yourmodel-v1", label: "Your Model v1", icon: icons.yourprovider },
  ],
},
```

---

## Releases

Versioning and releases run on [Changesets](https://github.com/changesets/changesets). All packages are private — nothing publishes to npm; Changesets drives version bumps, changelogs, git tags, and GitHub releases, which in turn build the deployable artifacts.

### Flow

1. **In your PR**, add a changeset describing what changed:
   ```bash
   bun changeset
   ```
   Pick the affected packages and bump level, then commit the generated file. CI fails a PR that changes a package without one.
2. **Merging to `main`** runs the release workflow, which opens (or updates) a **"Version Packages"** PR that applies the bumps and changelogs.
3. **Merging the Version PR** tags the bumped packages, creates a GitHub release per package, and runs only the build jobs for packages that changed:
   - **api/admin** → Docker image pushed to `ghcr.io/kyng-cytro/refine` (`:<version>` + `:latest`).
   - **desktop** → installers (AppImage/deb, dmg/zip, nsis) built on a win/mac/linux matrix and attached to the `@refine/desktop@<version>` release.
   - **mobile** → an EAS `production-apk` build is triggered (not awaited); the release notes link to the APK on Expo. `versionCode` is auto-incremented by EAS.

Version numbers live in each package's `package.json` and are the single source of truth: electron-builder and the Docker tag read it directly, and `apps/mobile/app.config.ts` reads it for the app version.

### One-time setup

Repository secrets required by the workflows:

| Secret | Used by | How to get it |
|---|---|---|
| `RELEASE_TOKEN` | `release.yml` (changesets) | Fine-grained PAT with **Contents: R/W** and **Pull requests: R/W** on this repo. Needed so the Version PR runs CI and its merge cascades into the release builds (the default `GITHUB_TOKEN` can't). |
| `EXPO_TOKEN` | mobile job | Expo access token from expo.dev → account settings. |

GHCR uses the built-in `GITHUB_TOKEN` (no secret needed); ensure Actions has package write permission.

Enable branch protection on `main` after the first merge (needs admin):

```bash
gh api -X PUT repos/kyng-cytro/refine/branches/main/protection \
  -F 'required_status_checks[strict]=true' \
  -F 'required_status_checks[contexts][]=ci' \
  -F 'required_pull_request_reviews[required_approving_review_count]=0' \
  -F 'enforce_admins=false' -F 'restrictions='
```

### Code signing (not yet configured)

Desktop builds ship **unsigned**: Linux is unaffected; macOS shows a Gatekeeper "unidentified developer" prompt and Windows shows a SmartScreen warning. Adding signing later is additive (cert secrets + electron-builder env vars, no workflow changes) — macOS needs a Developer ID cert + notarization creds, Windows a code-signing cert (Azure Trusted Signing is the CI-friendly option).


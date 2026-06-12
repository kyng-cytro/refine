# Refine

A self-hostable text refinement tool. Write text anywhere on Android, share it to Refine, and get it rewritten by an LLM using your own API keys.

The system is three pieces: a **Hono API** that holds provider credentials and processes refinements, a **React admin panel** for managing providers/devices/tokens, and an **Android app** that integrates with the system share sheet.

---

## Monorepo structure

```
refine/
├── apps/
│   ├── api/        Hono HTTP API (Bun runtime)
│   ├── admin/      React SPA — provider & device management
│   └── mobile/     Expo React Native app (Android only)
├── packages/
│   ├── db/         Drizzle ORM schema, migrations, seed
│   ├── schemas/    Zod types shared between API and admin
│   └── sdk/        Typed API client used by mobile
```

**Tooling:** Bun, Turbo, TypeScript across all packages.

---

## Getting started

### Prerequisites

- Bun ≥ 1.2
- Android SDK / emulator (for mobile)

### Install

```bash
bun install
```

### Database

```bash
bun run db:migrate   # creates refine.db and runs all migrations
bun run db:seed      # adds the default global "Refined" tone
```

### API

Copy `apps/api/.env.example` to `apps/api/.env`:

```env
ADMIN_TOKEN="your-secret-admin-token"
HOST="http://192.168.1.x:3000"       # must be reachable from the mobile device
DATABASE_URL="../../refine.db"
ENCRYPTION_KEY="32-char-random-string"
```

`HOST` must be the address the phone can reach — use your LAN IP or public hostname, not `localhost`.

```bash
bun run api:dev
```

### Admin panel

```bash
bun run admin:dev
```

Open `http://localhost:5173/admin/`. Authenticate with your `ADMIN_TOKEN`.

### Mobile

```bash
bun run mobile:prebuild    # generates android/ — run once, and re-run after app.json changes
bun run mobile:android     # builds and launches on emulator/device
```

### API + admin together

```bash
bun run dev
```

---

## Scripts reference

| Command                   | What it does                                           |
| ------------------------- | ------------------------------------------------------ |
| `bun run dev`             | API + admin dev servers                                |
| `bun run api:dev`         | API only                                               |
| `bun run admin:dev`       | Admin only                                             |
| `bun run admin:build`     | Production build (outputs to `apps/api/public/admin/`) |
| `bun run type-check`      | TypeScript check across all packages                   |
| `bun run db:generate`     | Generate migration SQL from schema changes             |
| `bun run db:migrate`      | Run pending migrations                                 |
| `bun run db:seed`         | Seed default data                                      |
| `bun run mobile:android`  | Build and run Android app                              |
| `bun run mobile:prebuild` | Expo prebuild (generates native `android/`)            |

---

## Architecture

### API server

`createApp()` mounts the Hono router at `/v1` with OpenAPI docs at `/v1/docs`.

`createRoot(app)` wraps it at the root level:

- `GET /favicon.png` — serves the favicon
- `GET /pair?token=X&name=Y` — redirects to the `refine://pair?...` deep link (HTTPS links auto-linkify in messaging apps; raw `refine://` scheme links do not)
- `/admin/*` — serves the built SPA
- `GET /admin` → redirects to `/admin/`

**Routes under `/v1`:**

| Prefix                | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `/v1/auth`            | Device pairing + session auth                   |
| `/v1/refine`          | Text refinement (proxies to LLM)                |
| `/v1/tones`           | Per-device tone CRUD                            |
| `/v1/history`         | Refinement history                              |
| `/v1/providers`       | Device-visible provider/model list              |
| `/v1/admin/providers` | Admin: manage provider API keys + model toggles |
| `/v1/admin/sessions`  | Admin: manage sessions/devices                  |
| `/v1/admin/tokens`    | Admin: generate pairing tokens                  |
| `/v1/admin/setup`     | Admin: check if server is configured            |

### Database

SQLite via Drizzle ORM + Bun SQLite. Tables: `pairing_tokens`, `sessions`, `history`, `tones`, `providers`, `userModelPrefs`.

Provider API keys are encrypted with AES-256-GCM before storage (`ENCRYPTION_KEY` env var on the server, Android Keystore on the mobile side).

### Mobile

**ProcessTextActivity** — a pure Kotlin Android activity (no React Native runtime) registered as an `ACTION_PROCESS_TEXT` handler. It reads the active config blob from `EncryptedSharedPreferences` and makes raw HTTP calls to the API. This is the entry that appears in Android's "Share" and "Process text" menus.

**SharedPreferences bridge** — `src/services/shared-prefs-bridge.ts` wraps a local Expo module (`modules/refine-shared-prefs/`) exposing plain and encrypted shared prefs. Called whenever settings change so the Kotlin activity always has current data.

**Deep links** — `refine://pair?token=X&url=Y&name=Z` opens the pair confirmation dialog. The server's `/pair` endpoint generates these redirects from the HTTPS pairing links shown in the admin panel.

---

## Adding a new provider

Adding a provider touches six files. Walk through them in order.

### 1. Register the models — `apps/mobile/src/constants/models.ts`

Add entries to the `MODELS` array:

```ts
{
  id: "your-model-id",
  label: "Display Name",
  provider: "yourprovider",   // slug used everywhere
  apiUrl: "https://api.yourprovider.com/v1/...",
},
```

The `provider` slug is the linking key — it must match what you use in every other step.

### 2. Wire the AI SDK — `apps/api/src/routes/refine/refine.dal.ts`

Install the Vercel AI SDK package for your provider:

```bash
bun add @ai-sdk/yourprovider --cwd apps/api
```

Then add a case in the provider factory inside the DAL:

```ts
import { createYourProvider } from "@ai-sdk/yourprovider"

case "yourprovider": {
  const provider = createYourProvider({ apiKey })
  return provider(modelId)
}
```

### 3. Database — no changes needed

The `providers` table stores slugs as plain strings. Inserting via `PUT /admin/providers/yourprovider` in the admin panel is sufficient.

### 4. Shared schemas — `packages/schemas/src/index.ts`

If `ModelProviderSchema` is a Zod enum, add `"yourprovider"` to it:

```ts
export const ModelProviderSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "yourprovider",
])
```

### 5. SVG icon — `apps/mobile/src/components/ProviderIcon.tsx`

Add an icon component and a case in the switch:

```tsx
function YourProviderIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="YOUR_SVG_PATH_DATA" fill={color} />
    </Svg>
  )
}

// in the switch:
case "yourprovider":
  return <YourProviderIcon size={size} color={color} />
```

Use the official brand SVG path data. The icon is tinted with the theme's `primary` color via `fill={color}` — don't hardcode a brand color.

### 6. Display label — `apps/mobile/src/components/settings/ProvidersSection.tsx`

```ts
const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  anthropic: "Anthropic",
  openai: "OpenAI",
  yourprovider: "Your Provider", // add this
}
```

Once these changes are in place, go to the admin panel, enter an API key under the new provider slug, and it will appear in the mobile app.

---

## Database migrations

```bash
# 1. Edit packages/db/src/schema/*.ts
# 2. Generate the SQL
bun run db:generate
# 3. Review the new file in packages/db/drizzle/
# 4. Apply
bun run db:migrate
```

Migration files are committed to the repo. Never edit them after they have been applied.

---

## Expo config plugin

`plugins/withProcessTextActivity.ts` handles the Kotlin share-sheet activity:

- Injects the `<activity>` manifest entry with the `ACTION_PROCESS_TEXT` intent filter
- Copies `modules/ProcessTextActivity.kt` into the generated `android/` directory

Run `bun run mobile:prebuild` after changing `app.json`, `plugins/`, or `modules/`.

---

## Type checking

```bash
bun run type-check   # all packages
```

Each package has its own `tsconfig.json`. The Turbo root task runs them in dependency order.

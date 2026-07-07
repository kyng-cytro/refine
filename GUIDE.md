# Self-Hosting Guide

---

## Prerequisites

- Docker
- A domain or stable IP reachable from your devices
- An API key from at least one provider (OpenAI, Anthropic, Google AI)

---

## Deploy

The server is published as a prebuilt image at `ghcr.io/kyng-cytro/refine` — no need to clone or build. Run it with a persistent volume for the SQLite database:

```bash
docker run -d --name refine \
  -p 3000:3000 \
  -v refine-data:/data \
  -e HOST="https://refine.yourdomain.com" \
  -e ADMIN_TOKEN="a-strong-random-secret" \
  -e ENCRYPTION_KEY="$(openssl rand -hex 16)" \
  --restart unless-stopped \
  ghcr.io/kyng-cytro/refine:latest
```

Pin to a specific version (e.g. `ghcr.io/kyng-cytro/refine:0.1.0`) instead of `:latest` if you want reproducible deploys.

`HOST` is the address your devices will reach — use a LAN IP for local-only (`http://192.168.1.x:3000`) or a domain for external access. Migrations run automatically on startup.

The admin panel is at `http://your-host:3000/admin/`.

---

## Initial setup

1. Open `https://refine.yourdomain.com/admin/` and enter your `ADMIN_TOKEN`.
2. Go to **Providers** and add an API key for at least one provider.
3. Go to **Devices**, click **New Pairing Token**, and pick the device type:
   - **Mobile** — scan the QR code in the Refine Android app.
   - **Desktop** — click **Open in Refine** (or copy the link) on the machine running the desktop app; it opens the app via the `refine://` handler. Manual server-URL + token entry also works.
   - **Browser** — copy the server URL and token for manual entry.

### Getting the apps

- **Desktop** — download the installer for your OS (Windows `.exe`, macOS `.dmg`, Linux `.AppImage`/`.deb`) from the [latest release](https://github.com/kyng-cytro/refine/releases). Builds are unsigned for now, so expect a one-time "unidentified developer"/SmartScreen prompt on macOS/Windows.
- **Mobile** — grab the Android APK linked from the [latest release](https://github.com/kyng-cytro/refine/releases).

---

## Device management

Under **Devices** in the admin panel:

- View connected devices with their type (mobile/desktop/browser) and pairing label
- Set session expiry or revoke a session
- Override model availability per device

---

## Updating

```bash
docker pull ghcr.io/kyng-cytro/refine:latest
docker rm -f refine
# re-run the same `docker run …` command from Deploy
```

Your data is preserved in the `refine-data` volume; migrations run automatically on startup.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `HOST` | No | `http://localhost:3000` | Public URL — used in pairing links |
| `PORT` | No | `3000` | Port the server listens on |
| `APP_ENV` | No | `production` | `development` / `production` / `test` |
| `LOG_LEVEL` | No | `info` | `trace` / `debug` / `info` / `warn` / `error` / `fatal` |
| `DATABASE_URL` | No | `file:/data/refine.db` | Local file path or remote libsql URL |
| `TURSO_AUTH_TOKEN` | No | — | Auth token for remote libsql / Turso |
| `ADMIN_TOKEN` | Yes | — | Bearer token for all admin endpoints |
| `ENCRYPTION_KEY` | Yes | — | Key for encrypting provider API keys at rest |

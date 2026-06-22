# Self-Hosting Guide

---

## Prerequisites

- Docker and Docker Compose
- A domain or stable IP reachable from your phone
- An API key from at least one provider (OpenAI, Anthropic, Google AI)

---

## Deploy

```bash
git clone https://github.com/kyng-cytro/refine.git
cd refine
cp .env.example .env
docker compose up -d
```

`.env`:

```env
HOST="https://refine.yourdomain.com"
ADMIN_TOKEN="a-strong-random-secret"
ENCRYPTION_KEY="$(openssl rand -hex 16)"
```

`HOST` is the address your phone will reach — use a LAN IP for local-only (`http://192.168.1.x:3000`) or a domain for external access.

The admin panel is at `http://your-host:3000/admin/`.

---

## Initial setup

1. Open `https://refine.yourdomain.com/admin/` and enter your `ADMIN_TOKEN`.
2. Go to **Providers** and add an API key for at least one provider.
3. Go to **Devices**, click **New Pairing Token**, and scan the QR in the Refine app.

---

## Device management

Under **Devices** in the admin panel:

- View active sessions and last-used timestamps
- Set session expiry or revoke a session
- Override model availability per device

---

## Updating

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on startup.

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

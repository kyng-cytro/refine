# Self-Hosting Guide

This guide covers deploying Refine on your own server and connecting the Android app to it.

---

## What you're deploying

- **API server** — a Bun/Hono process that stores your LLM provider credentials (encrypted) and handles text refinement requests from the mobile app
- **Admin panel** — a web UI served by the API at `/admin/`, used for initial setup and device management
- **Mobile app** — sideloaded or built from source; connects to your server

The Docker image builds the admin panel and bundles it with the API in a single container. The database is persisted in a named volume.

---

## Prerequisites

- Docker and Docker Compose on your server
- A domain name or stable IP/hostname reachable from your phone
- An API key from at least one LLM provider (OpenAI, Anthropic, or Google AI)

---

## Deployment

### 1. Clone the repo

```bash
git clone https://github.com/your-org/refine.git
cd refine
```

### 2. Create a `.env` file

```bash
cp .env.example .env   # or create it manually
```

`.env`:

```env
HOST="https://refine.yourdomain.com"
ADMIN_TOKEN="a-strong-random-secret"
ENCRYPTION_KEY="a-32-character-random-string-here"
```

**`HOST`** must be the address your phone can reach. On a local network a LAN IP works (`http://192.168.1.x:3000`); for external access use a domain with HTTPS.

**`ADMIN_TOKEN`** is the password for the admin panel — use a strong, unique value.

**`ENCRYPTION_KEY`** encrypts provider API keys at rest. Generate one with:

```bash
openssl rand -hex 16
```

### 3. Start

```bash
docker compose up -d
```

The first run builds the image (compiles the admin SPA, installs production deps), runs database migrations, seeds default data, and starts the server.

The admin panel is at `http://your-host:3000/admin/`.

---

## Reverse proxy (HTTPS)

For any deployment reachable outside your home network, put a TLS-terminating reverse proxy in front. Example with nginx:

```nginx
server {
    listen 443 ssl;
    server_name refine.yourdomain.com;

    # SSL — use certbot or your preferred method
    ssl_certificate     /etc/letsencrypt/live/refine.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/refine.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Initial setup

### 1. Open the admin panel

Go to `https://refine.yourdomain.com/admin/`. Enter your `ADMIN_TOKEN` when prompted.

### 2. Add a provider

Go to **Providers** and enter an API key for at least one provider (OpenAI, Anthropic, or Google AI). Keys are encrypted before being stored.

Models are enabled by default. You can disable individual models per-device later.

### 3. Pair your phone

Go to **Devices** and click **New Pairing Token**. A QR code and a shareable link will appear — both are valid for 30 minutes.

**To pair:**
- Open the Refine app on your phone
- Tap **Scan QR Code** and point at the QR, or tap the link in a messaging app

The app connects, downloads your tones and model list, and is ready to use.

---

## Using Refine

Once paired, select any text on Android, tap **Share**, and choose **Refine**. The text is processed by the selected model and tone, and the result is placed in your clipboard.

You can also open the app directly to refine text manually or browse history.

---

## Device management

In the admin panel under **Devices** you can:

- **View active sessions** — see which devices are connected and when they last used the app
- **Set session expiry** — limit how long a session stays valid
- **Revoke a session** — disconnects the device immediately
- **Override models per device** — disable specific models for a particular device

---

## Updating

```bash
docker compose pull   # if using a registry image
# or, if building from source:
git pull
docker compose up -d --build
```

Migrations run automatically on startup — the container always applies any pending migrations before starting the server.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `HOST` | No | `http://localhost:3000` | Public URL — used in pairing links |
| `PORT` | No | `3000` | Port the server listens on |
| `APP_ENV` | No | `production` (in image) | `development` / `production` / `test` |
| `LOG_LEVEL` | No | `info` | `trace` / `debug` / `info` / `warn` / `error` / `fatal` |
| `DATABASE_URL` | No | `file:/data/refine.db` (in image) | Path to the SQLite database file |
| `ADMIN_TOKEN` | Yes | — | Bearer token for all admin endpoints |
| `ENCRYPTION_KEY` | Yes | — | Key for encrypting provider API keys at rest |

---

## Security notes

- **`ADMIN_TOKEN`** protects all `/v1/admin/*` endpoints. There is no rate limiting — use a strong value and consider restricting access to the admin panel at the network level (firewall, VPN, or IP allowlist in your reverse proxy).
- Provider API keys are stored encrypted using AES-256-GCM. If `ENCRYPTION_KEY` is lost, stored credentials cannot be recovered.
- Pairing tokens expire after 30 minutes and are single-use.
- HTTPS is strongly recommended for any deployment reachable outside your local network.

---

## Troubleshooting

**App shows "Connection failed" when pairing**
- Verify `HOST` in `.env` matches the URL you're connecting from
- Test reachability: `curl http://your-host:3000/v1/admin/setup`
- Check that port 3000 (or your configured port) is open in your firewall

**"No models available" in the app**
- At least one provider must have a valid API key in the admin panel
- Check the API docs at `/v1/docs` to verify the provider endpoint returns models

**Admin panel shows blank after update**
- The admin SPA is baked into the image at build time — rebuild: `docker compose up -d --build`

**Database errors on startup**
- Check that the `/data` volume is writable
- View logs: `docker compose logs refine`

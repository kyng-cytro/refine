# ---- Stage 1: Build admin UI ----
FROM oven/bun:1.2 AS admin-builder

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/schemas/package.json ./packages/schemas/

RUN bun install --frozen-lockfile

COPY apps/admin ./apps/admin
COPY packages/schemas/src ./packages/schemas/src

WORKDIR /app/apps/admin
RUN bun run build


# ---- Stage 2: Runtime ----
FROM oven/bun:1.2-slim AS runtime

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/schemas/package.json ./packages/schemas/

RUN bun install --frozen-lockfile --production

COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/db/src ./packages/db/src
COPY packages/db/drizzle ./packages/db/drizzle
COPY packages/db/migrate.ts ./packages/db/
COPY packages/db/seed.ts ./packages/db/
COPY packages/schemas/src ./packages/schemas/src

COPY --from=admin-builder /app/apps/api/public/admin ./apps/api/public/admin

VOLUME /data
ENV DATABASE_URL=file:/data/refine.db
ENV PORT=3000
ENV APP_ENV=production

EXPOSE 3000

WORKDIR /app/apps/api

CMD bun run ../../packages/db/migrate.ts && bun run ../../packages/db/seed.ts && bun run src/index.ts

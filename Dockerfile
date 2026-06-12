# ---- Stage 1: Prune workspace ----
FROM oven/bun:1.2-alpine AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune @refine/api @refine/admin --docker


# ---- Stage 2: Build admin UI ----
FROM oven/bun:1.2-alpine AS admin-builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
WORKDIR /app/apps/admin
RUN bun run build


# ---- Stage 3: Runtime ----
FROM oven/bun:1.2-alpine AS runtime
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile --production
COPY --from=pruner /app/out/full/ .
COPY --from=admin-builder /app/apps/api/public/admin ./apps/api/public/admin

VOLUME /data
ENV DATABASE_URL=file:/data/refine.db
ENV PORT=3000
ENV APP_ENV=production

EXPOSE 3000

WORKDIR /app/apps/api
CMD bun run ../../packages/db/migrate.ts && bun run ../../packages/db/seed.ts && bun run src/index.ts

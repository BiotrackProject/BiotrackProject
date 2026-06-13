# Build context: monorepo root (BiotrackProject/)
# docker build -f apps/api/Dockerfile .

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# Monorepo root files needed by pnpm to resolve the workspace lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# App manifest (pnpm needs it to resolve the workspace filter)
COPY apps/api/package.json ./apps/api/package.json

# Install only the api workspace
# --ignore-scripts blocks malicious pre/postinstall from transitive deps
RUN pnpm install --frozen-lockfile --ignore-scripts --filter api

COPY apps/api/tsconfig.json apps/api/prisma.config.ts ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src

WORKDIR /app/apps/api

# Generate Prisma client (--ignore-scripts skipped the postinstall)
# Then compile TypeScript → dist/
RUN pnpm exec prisma generate && pnpm run build

# ─── Stage 2: runner — production image ───────────────────────────────────────
# NOTE: pnpm stores real packages in /app/node_modules/.pnpm/ and creates
# symlinks in apps/api/node_modules/ pointing to ../../node_modules/.pnpm/.
# Both halves must be copied at the same relative paths or Node can't resolve
# the symlinks (which was causing "Cannot find module prisma/build/index.js").
FROM node:24-alpine AS runner
LABEL org.opencontainers.image.title="BIOTRACK API"
LABEL org.opencontainers.image.description="API REST — Gestión de minería ilegal de arena · INTEC IDS355"
LABEL org.opencontainers.image.source="https://github.com/Albert2707/BiotrackProject"

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -g 1001 -S biotrack && adduser -u 1001 -S biotrack -G biotrack

# Root-level .pnpm store — the actual package files symlinks point into
COPY --from=builder --chown=root:root /app/node_modules ./node_modules
# App-level node_modules — mostly symlinks into the .pnpm store above
COPY --from=builder --chown=root:root /app/apps/api/node_modules ./apps/api/node_modules
# Compiled output, schema, migrations, prisma config
COPY --from=builder --chown=root:root /app/apps/api/dist            ./apps/api/dist
COPY --from=builder --chown=root:root /app/apps/api/prisma          ./apps/api/prisma
COPY --from=builder --chown=root:root /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=builder --chown=root:root /app/apps/api/package.json    ./apps/api/package.json

RUN mkdir -p apps/api/uploads && chown biotrack:biotrack apps/api/uploads

USER biotrack

WORKDIR /app/apps/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]

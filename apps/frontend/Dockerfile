# Build context: monorepo root (BiotrackProject/)
# docker build -f apps/frontend/Dockerfile .

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# Monorepo root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# App manifest (pnpm needs it to resolve the workspace)
COPY apps/frontend/package.json ./apps/frontend/package.json

# Install only the frontend workspace
RUN pnpm install --frozen-lockfile --ignore-scripts --filter frontend

# Source files
COPY apps/frontend/tsconfig.json apps/frontend/tsconfig.node.json apps/frontend/vite.config.ts ./apps/frontend/
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/public ./apps/frontend/public 2>/dev/null || true

# API URL baked into the SPA bundle at build time.
# Override with: docker build --build-arg VITE_API_BASE_URL=https://...
ARG VITE_API_BASE_URL=https://api.biotrack.org.do
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Type-check + build
WORKDIR /app/apps/frontend
RUN pnpm run build

# ─── Stage 2: runner ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner
LABEL org.opencontainers.image.title="BIOTRACK Frontend"
LABEL org.opencontainers.image.description="SPA — Plataforma de gestión ambiental · INTEC IDS355"
LABEL org.opencontainers.image.source="https://github.com/Albert2707/BiotrackProject"

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]

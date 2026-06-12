# ─── Stage 1: builder — todas las deps (dev + prod) + compilación ────────────
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# Instalar TODAS las dependencias (dev incluidas, necesarias para tsx en dev y tsc en build)
# --ignore-scripts bloquea preinstall/postinstall de paquetes maliciosos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generar cliente Prisma (explícito porque --ignore-scripts lo saltó)
# Compilar TypeScript → dist/
RUN pnpm exec prisma generate && pnpm run build

# ─── Stage 2: pruner — elimina devDeps para la imagen de producción ───────────
# Stage separado para que "builder" siga teniendo tsx disponible (usado en dev)
FROM builder AS pruner
RUN pnpm prune --prod

# ─── Stage 3: runner — imagen mínima de producción ───────────────────────────
FROM node:24-alpine AS runner
LABEL org.opencontainers.image.title="BIOTRACK API"
LABEL org.opencontainers.image.description="API REST — Gestión de minería ilegal de arena · INTEC IDS355"
LABEL org.opencontainers.image.source="https://github.com/Albert2707/biotrack-api"

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -g 1001 -S biotrack && adduser -u 1001 -S biotrack -G biotrack

# Copiar artefactos ya podados del stage pruner
# --chown=root:root + --chmod=755 → biotrack puede leer/ejecutar pero no escribir (ASVS V14)
COPY --from=pruner --chown=root:root --chmod=755 /app/node_modules ./node_modules
COPY --from=pruner --chown=root:root --chmod=755 /app/dist        ./dist
COPY --from=pruner --chown=root:root --chmod=755 /app/prisma      ./prisma
COPY --from=pruner --chown=root:root --chmod=644 /app/package.json ./package.json

RUN mkdir -p uploads && chown biotrack:biotrack uploads

USER biotrack

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]

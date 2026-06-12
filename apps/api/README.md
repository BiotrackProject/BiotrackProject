# BIOTRACK API

API REST para el sistema de gestión de minería ilegal de extracción de arena en la República Dominicana.

**Proyecto de Grado** — Instituto Tecnológico de Santo Domingo (INTEC) · IDS355-01  
**SRS:** ISO/IEC/IEEE 29148:2018 · v3.0

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 24 + ESM |
| Lenguaje | TypeScript 5 |
| Framework | Express.js 4 |
| Base de datos | PostgreSQL 15 + Prisma 6 |
| Autenticación | Auth0 (RS256 / JWKS) |
| Validación | Zod |
| Docs API | OpenAPI 3.1 (Swagger UI) |
| Logs | Pino |
| Seguridad | OWASP ASVS Level 2 |

---

## Módulos (SRS)

| Módulo | Ruta | Estado |
|---|---|---|
| MOD-01 Autenticación | `/api/v1/auth` | ✅ Implementado |
| MOD-02 Denuncias | `/api/v1/denuncias` | 🚧 En desarrollo |
| MOD-03 Zonas / Telemetría | `/api/v1/zonas` · `/api/v1/telemetria` | 🚧 En desarrollo |
| MOD-04 Indicadores | `/api/v1/indicadores` | 🚧 En desarrollo |
| MOD-05 Acciones Correctivas | `/api/v1/acciones` | 🚧 En desarrollo |
| MOD-06 Administración | `/api/v1/admin` | 🚧 En desarrollo |

---

## Requisitos previos

- Node.js ≥ 24
- PostgreSQL 15 (o Docker)
- Tenant en [Auth0](https://auth0.com)

---

## Instalación local (sin Docker)

```bash
# 1. Clonar e instalar dependencias
git clone <repo-url>
cd biotrack-api
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Aplicar migraciones y seed
npm run db:migrate
npm run db:seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

---

## Instalación con Docker

```bash
# Copiar y editar variables de entorno
cp .env.example .env

# ── Desarrollo (hot-reload) ──────────────────────────────────────────────────
docker compose up -d

# Primera vez: migraciones y seed
docker compose run --rm --profile tools migrate
docker compose run --rm --profile tools seed

# ── Producción ───────────────────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml run --rm --profile tools migrate
docker compose -f docker-compose.prod.yml run --rm --profile tools seed
docker compose -f docker-compose.prod.yml up -d
```

---

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `AUTH0_DOMAIN` | Dominio del tenant Auth0 (sin `https://`) |
| `AUTH0_AUDIENCE` | API Identifier configurado en Auth0 |
| `AUTH0_MGMT_CLIENT_ID` | Client ID de la app Machine-to-Machine |
| `AUTH0_MGMT_CLIENT_SECRET` | Client Secret de la app M2M |
| `ENCRYPTION_KEY` | 64 caracteres hex para AES-256-GCM |
| `FRONTEND_URL` | URL del frontend (para CORS) |

Generar `ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts

```bash
npm run dev              # Desarrollo con hot-reload (tsx watch)
npm run build            # Compilar TypeScript → dist/
npm run typecheck        # Verificar tipos sin compilar
npm run db:migrate       # Crear y aplicar migraciones
npm run db:seed          # Seed inicial (roles y permisos)
npm run db:studio        # Prisma Studio (GUI de base de datos)
npm run generate:openapi # Exportar openapi.json para OWASP ZAP
```

---

## Documentación de la API

Con el servidor corriendo:

- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON** (para OWASP ZAP): `http://localhost:3000/api/docs.json`

---

## Endpoints principales

```
GET  /health                     # Health check
POST /api/v1/auth/registro       # Solicitar registro (requiere aprobación admin)
POST /api/v1/auth/logout         # Logout (invalida el token JWT)
POST /api/v1/auth/recuperacion   # Solicitar recuperación de contraseña
GET  /api/v1/auth/perfil         # Ver perfil propio
PATCH /api/v1/auth/perfil        # Actualizar perfil
```

---

## Seguridad

- **Autenticación:** Auth0 JWT Bearer (RS256) con blacklist de `jti` para logout explícito
- **RBAC:** Cada endpoint valida `módulo + acción` contra el rol del usuario
- **PII:** `contacto_denunciante` cifrado con AES-256-GCM (Ley 172-13 RD)
- **Rate limiting:** Global 100 req/min · Auth 10 req/min · Telemetría 1000 req/min
- **SCA:** GitHub Actions ejecuta `npm audit` + OWASP Dependency-Check en cada push

---

## Licencia

MIT

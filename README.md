# Visión Bolivia 2035

Landing page con encuesta multi-step para captar registros de participantes para 30 talleres de co-creación turística en 20 territorios estratégicos de Bolivia.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **DB:** PostgreSQL 17 + Prisma 6
- **Estilos:** Tailwind v4 (mobile-first)
- **Validación:** Zod 4
- **Imágenes:** `next/image` + Sharp
- **Infra:** Docker Compose (dev + prod)

## Requisitos

- **Docker** (≥ 20.10) y **Docker Compose v2** (`docker compose`, no `docker-compose`)
- **make** (opcional pero recomendado)
- **openssl** (para generar secrets — viene con Git Bash en Windows)
- En Windows: WSL2 o Git Bash. Sin make/bash, usar `scripts/setup.ps1` desde PowerShell.
- ~ 2 GB para imágenes Docker + dependencias Node.

## Quickstart

```bash
git clone https://github.com/DanielOlivera/vision2035-fork.git
cd vision2035-fork
make setup && make dev
```

App: <http://localhost:23000>

## Setup paso a paso

### 1. Variables de entorno

```bash
make setup
```

Windows sin make:

```powershell
pwsh scripts\setup.ps1
# o si no tenés pwsh:
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

Esto:

- Copia `.env.example` → `.env` (si no existe — es idempotente).
- Genera `POSTGRES_PASSWORD` y `NEXTAUTH_SECRET` (32 chars alfanuméricos, sin símbolos para evitar problemas en URLs).
- Construye `DATABASE_URL` con la password generada.

Editá `.env` después si querés cambiar puertos o `NEXT_PUBLIC_API_URL`.

### 2. Levantar el entorno

**Desarrollo** (hot-reload):

```bash
make dev
```

- Postgres expuesto en `localhost:25432`
- App en <http://localhost:23000>
- Cambios en `web/src/` se reflejan en vivo
- Migraciones + seed corren automáticamente al arrancar

**Producción** (build optimizado multi-stage):

```bash
make prod
```

- App en <http://localhost:8080> (configurable con `HOST_PORT`)
- Sin TLS — poné un reverse proxy (Caddy / Nginx / Traefik) delante

### 3. Logs

```bash
make dev-logs     # contenedor app dev
make prod-logs    # contenedor app prod
```

### 4. Resetear la DB

```bash
make reset-db
```

Borra el volumen de Postgres y vuelve a levantar (re-seed automático).

## Comandos principales

```bash
make help            # lista todos los targets disponibles
make setup           # generar .env con secrets
make dev             # levantar dev
make dev-down        # detener dev
make dev-logs        # ver logs (dev)
make dev-restart     # reiniciar dev
make prod            # levantar prod (build)
make prod-down       # detener prod
make prod-logs       # ver logs (prod)
make prod-restart    # reiniciar prod
make build           # build de la imagen prod sin levantarla
make reset-db        # borrar volumen DB + levantar de nuevo
make migrate         # prisma migrate dev en el contenedor
make seed            # re-poblar talleres
make studio          # abrir Prisma Studio
make shell           # shell dentro del contenedor app (dev)
make db-shell        # psql dentro del contenedor de Postgres (dev)
make clean           # detener TODO y borrar volúmenes (DESTRUCTIVO)
```

## Personalización

### Dominio propio + TLS

La app expone HTTP plano en el puerto del host. Para asociar tu dominio:

1. **DNS** — apuntá un A record de `tudominio.com` → IP pública del servidor.
2. **Reverse proxy** — instalá Caddy o Nginx en el host:

   **Caddy** (recomendado, TLS automático con Let's Encrypt):

   ```caddy
   tudominio.com {
       reverse_proxy localhost:8080
   }
   ```

   **Nginx** (necesita certbot aparte):

   ```nginx
   server {
       listen 443 ssl;
       server_name tudominio.com;
       ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Variable** — en `.env` poné `NEXT_PUBLIC_API_URL=https://tudominio.com` y rebuildeá:

   ```bash
   make prod-restart
   ```

### Cambiar contenido

| Quiero cambiar... | Edito... |
|-------------------|----------|
| Texto del hero y secciones | `web/src/app/page.tsx` |
| Texto del registro | `web/src/components/RegisterForm.tsx` |
| Pasos de la encuesta | `web/src/components/survey/*.tsx` |
| Imágenes de destinos | reemplazar archivos en `web/public/img/optimized/<dpto>/` |
| Lista de destinos / departamentos | `web/src/lib/destinations-data.ts` + enums en `web/prisma/schema.prisma` (requiere migration) |
| Talleres iniciales | `web/prisma/seed.ts` |
| Colores / paleta | `web/src/app/globals.css` (variables `--bolivia-*`) |
| SEO / OpenGraph / favicon | `web/src/app/layout.tsx` + `web/src/app/icon.png` |
| Validaciones de formularios | `web/src/lib/validations.ts` |

### Cambiar el modelo de datos

Editá `web/prisma/schema.prisma` y después:

```bash
make migrate
```

Esto crea una nueva migration en `web/prisma/migrations/` y la aplica. Nunca edites a mano `0_initial_baseline/migration.sql` después de levantar la DB en producción — genera drift entre schema y DB.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | Usuario Postgres |
| `POSTGRES_PASSWORD` | (generado) | Password (alfanumérico, sin símbolos) |
| `POSTGRES_DB` | `vision_bolivia_2035` | Nombre de la DB |
| `POSTGRES_PORT` | `25432` | Puerto host Postgres (dev) |
| `HOST_PORT` | `23000` (dev) / `8080` (prod) | Puerto host app |
| `DATABASE_URL` | (auto) | Connection string Prisma |
| `NODE_ENV` | `development` / `production` | Modo Next.js |
| `PORT` | `3000` (dev) / `8080` (prod) | Puerto interno contenedor |
| `NEXTAUTH_SECRET` | (generado) | Secret de sesiones |
| `NEXT_PUBLIC_API_URL` | `http://localhost:23000` | URL pública (cambiar a tu dominio en prod) |

## Despliegue

### VPS / dedicado

1. Instalá Docker + Docker Compose.
2. Cloneá el repo.
3. `make setup && make prod`.
4. Configurá DNS + reverse proxy con TLS (ver sección "Dominio propio + TLS").

### PaaS (Coolify, Dokploy)

Apuntá la plataforma a este repo y seleccioná "Docker Compose" con `docker-compose.yml`. Las PaaS gestionan TLS y dominio.

### PaaS con Postgres managed (Railway, Render, Neon)

Hay que separar la app de la DB:

1. Crear una instancia de Postgres en el proveedor → obtener `DATABASE_URL`.
2. Comentar o quitar el servicio `db` de `docker-compose.yml`.
3. Pasar `DATABASE_URL` como variable del servicio `app`.
4. Quitar `depends_on: db` del servicio `app`.

## Troubleshooting

**El contenedor no arranca / Postgres no acepta conexiones.**

```bash
make dev-down
docker volume ls | grep postgres
docker volume rm <nombre_volumen>   # CUIDADO: borra la DB
make dev
```

**`prisma migrate dev` falla con "drift detected".**

Significa que la DB tiene cambios no reflejados en migrations. En dev:

```bash
make reset-db
```

**Cambios en `.env` no se aplican.**

Compose lee `.env` solo al arrancar. Reiniciá:

```bash
make dev-restart    # o make prod-restart
```

**Puerto ya en uso.**

Cambiá `HOST_PORT` o `POSTGRES_PORT` en `.env` y reiniciá.

**Permisos de escritura en `web/node_modules` (dev en Linux).**

El bind mount puede generar conflictos. Solución:

```bash
make dev-down
sudo chown -R $USER:$USER web/node_modules
make dev
```

## Estructura del proyecto

```
.
├── docker-compose.yml          # Producción
├── docker-compose.dev.yml      # Desarrollo (hot-reload)
├── Dockerfile                  # Build multi-stage
├── Makefile                    # Atajos de tareas comunes
├── .env.example                # Plantilla de variables
├── optimize-images.mjs         # Script: sources/img → web/public/img/optimized
├── scripts/
│   ├── setup.sh                # Generar .env (bash)
│   └── setup.ps1               # Generar .env (PowerShell, Windows)
└── web/                        # App Next.js
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma       # Schema DB
    │   ├── seed.ts             # 20 talleres iniciales
    │   └── migrations/
    ├── public/img/optimized/   # Imágenes WebP por departamento
    └── src/
        ├── app/                # App Router (pages + API routes)
        ├── components/         # UI + survey wizard
        └── lib/                # db, validations, datos estáticos, utils
```

## Licencia

Sin licencia explícita — definir según corresponda al uso.

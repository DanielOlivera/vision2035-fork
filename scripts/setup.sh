#!/usr/bin/env bash
# Genera .env desde .env.example con secrets aleatorios.
# Idempotente: si .env ya existe, no hace nada.

set -euo pipefail

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

if [ -f "$ENV_FILE" ]; then
  echo "✓ .env ya existe. No lo sobrescribo."
  echo "  Si querés regenerarlo, borrá .env manualmente y volvé a correr este script."
  exit 0
fi

if [ ! -f "$EXAMPLE_FILE" ]; then
  echo "✗ Error: $EXAMPLE_FILE no encontrado." >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "✗ Error: 'openssl' no encontrado. Instalalo o usá scripts/setup.ps1 en Windows." >&2
  exit 1
fi

cp "$EXAMPLE_FILE" "$ENV_FILE"

# Genera 32 chars alfanuméricos (sin / + = para evitar problemas en URLs)
gen_secret() {
  openssl rand -base64 48 | tr -d '/+=' | head -c 32
}

POSTGRES_PASSWORD="$(gen_secret)"
NEXTAUTH_SECRET="$(gen_secret)"
DATABASE_URL_VALUE="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/vision_bolivia_2035?schema=public"

# sed -i portable (BSD/macOS vs GNU/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed_inplace() { sed -i '' "$1" "$2"; }
else
  sed_inplace() { sed -i "$1" "$2"; }
fi

# Usa | como delimitador para evitar escapar / del DATABASE_URL
sed_inplace "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" "$ENV_FILE"
sed_inplace "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${NEXTAUTH_SECRET}|" "$ENV_FILE"
sed_inplace "s|^DATABASE_URL=.*|DATABASE_URL=${DATABASE_URL_VALUE}|" "$ENV_FILE"

echo "✓ .env generado con secrets aleatorios."
echo "  Editalo si querés cambiar puertos (HOST_PORT, POSTGRES_PORT) o NEXT_PUBLIC_API_URL."
echo ""
echo "Próximo paso:  make dev"

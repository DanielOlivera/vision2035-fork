# Genera .env desde .env.example con secrets aleatorios (Windows nativo).
# Idempotente: si .env ya existe, no hace nada.
#
# Uso:
#   pwsh scripts\setup.ps1
#   # o si no tenés PowerShell 7:
#   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

$ErrorActionPreference = "Stop"

$envFile = ".env"
$exampleFile = ".env.example"

if (Test-Path $envFile) {
    Write-Host "[OK] .env ya existe. No lo sobrescribo."
    Write-Host "     Si querés regenerarlo, borrá .env manualmente y volvé a correr este script."
    exit 0
}

if (-not (Test-Path $exampleFile)) {
    Write-Host "[ERROR] $exampleFile no encontrado." -ForegroundColor Red
    exit 1
}

Copy-Item $exampleFile $envFile

# Genera 32 chars alfanuméricos (a-z, A-Z, 0-9) — equivalente a openssl rand -base64 32 | tr -d '/+='
function New-Secret {
    -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
}

$postgresPassword = New-Secret
$nextauthSecret = New-Secret
$databaseUrl = "postgresql://postgres:${postgresPassword}@db:5432/vision_bolivia_2035?schema=public"

(Get-Content $envFile) | ForEach-Object {
    $line = $_
    $line = $line -replace '^POSTGRES_PASSWORD=.*', "POSTGRES_PASSWORD=$postgresPassword"
    $line = $line -replace '^NEXTAUTH_SECRET=.*', "NEXTAUTH_SECRET=$nextauthSecret"
    $line = $line -replace '^DATABASE_URL=.*', "DATABASE_URL=$databaseUrl"
    $line
} | Set-Content $envFile -Encoding UTF8

Write-Host "[OK] .env generado con secrets aleatorios."
Write-Host "     Editalo si querés cambiar puertos (HOST_PORT, POSTGRES_PORT) o NEXT_PUBLIC_API_URL."
Write-Host ""
Write-Host "Proximo paso:  make dev   (o docker compose -f docker-compose.dev.yml up -d)"

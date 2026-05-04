.PHONY: help setup dev dev-down dev-logs dev-restart prod prod-down prod-logs prod-restart build reset-db migrate seed studio shell db-shell clean

DEV_COMPOSE := docker compose -f docker-compose.dev.yml
PROD_COMPOSE := docker compose
APP_DEV := vision-bolivia-app-dev
APP_PROD := vision-bolivia-app
DB_DEV := vision-bolivia-db-dev

help: ## Mostrar esta ayuda
	@echo "Visión Bolivia 2035 — comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Generar .env desde .env.example con secrets aleatorios
	@bash scripts/setup.sh

dev: ## Levantar entorno de desarrollo (hot-reload)
	$(DEV_COMPOSE) up -d
	@PORT=$$(grep ^HOST_PORT .env 2>/dev/null | cut -d= -f2 | head -1); \
	echo "→ App: http://localhost:$${PORT:-23000}"

dev-down: ## Detener desarrollo
	$(DEV_COMPOSE) down

dev-logs: ## Ver logs del contenedor app (dev)
	docker logs -f $(APP_DEV)

dev-restart: dev-down dev ## Reiniciar desarrollo

prod: ## Levantar producción (build multi-stage)
	$(PROD_COMPOSE) up -d --build
	@PORT=$$(grep ^HOST_PORT .env 2>/dev/null | cut -d= -f2 | head -1); \
	echo "→ App: http://localhost:$${PORT:-8080}"

prod-down: ## Detener producción
	$(PROD_COMPOSE) down

prod-logs: ## Ver logs del contenedor app (prod)
	docker logs -f $(APP_PROD)

prod-restart: prod-down prod ## Reiniciar producción

build: ## Build de la imagen de producción sin levantarla
	$(PROD_COMPOSE) build

reset-db: ## Borrar volumen DB y levantar de nuevo (DB desde cero, re-seed)
	$(DEV_COMPOSE) down -v
	$(DEV_COMPOSE) up -d

migrate: ## Crear y aplicar nueva migration (usa el schema actual)
	docker exec -it $(APP_DEV) npx prisma migrate dev

seed: ## Re-poblar la DB con los 20 talleres
	docker exec $(APP_DEV) npx prisma db seed

studio: ## Abrir Prisma Studio (http://localhost:5555)
	docker exec -it $(APP_DEV) npx prisma studio

shell: ## Abrir shell dentro del contenedor app (dev)
	docker exec -it $(APP_DEV) sh

db-shell: ## Abrir psql dentro del contenedor de Postgres (dev)
	@USER=$$(grep ^POSTGRES_USER .env | cut -d= -f2); \
	DB=$$(grep ^POSTGRES_DB .env | cut -d= -f2); \
	docker exec -it $(DB_DEV) psql -U $$USER -d $$DB

clean: ## Detener TODO y borrar volúmenes (DESTRUCTIVO: borra la DB)
	$(DEV_COMPOSE) down -v
	$(PROD_COMPOSE) down -v

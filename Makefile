.PHONY: help install dev dev-deps docker-local docker-prod docker-down backend frontend test clean

help:
	@echo "Generative UI Studio - Developer Commands"
	@echo "=========================================="
	@echo "  make install       - Install backend (uv) and frontend (npm) dependencies"
	@echo "  make dev-deps      - Start backing services (Postgres, Redis, Silo MinIO) in Docker"
	@echo "  make backend       - Run FastAPI backend with live reload (uvicorn on port 8000)"
	@echo "  make frontend      - Run Next.js 16 frontend with Turbopack (port 3000)"
	@echo "  make docker-local  - Run entire monorepo in Docker with local Nginx proxy (port 80)"
	@echo "  make docker-prod   - Run production multi-stage build stack (port 80)"
	@echo "  make docker-down   - Stop and tear down all active Docker containers"
	@echo "  make test          - Run frontend TypeScript typecheck and backend health check"

install:
	@echo "==> Installing backend dependencies with UV..."
	cd backend && uv sync
	@echo "==> Installing frontend dependencies with npm..."
	cd frontend && npm install

dev-deps:
	@echo "==> Starting backing services (Postgres, Redis, Silo MinIO)..."
	docker compose -f docker-compose.deps.yml up -d

docker-local:
	@echo "==> Starting full monorepo in Docker with local Nginx proxy..."
	docker compose -f docker-compose.local.yml up --build

docker-prod:
	@echo "==> Starting production multi-stage containers..."
	docker compose -f docker-compose.prod.yml up -d --build

docker-down:
	@echo "==> Stopping all Docker containers..."
	docker compose -f docker-compose.local.yml down -v --remove-orphans || true
	docker compose -f docker-compose.prod.yml down -v --remove-orphans || true
	docker compose -f docker-compose.deps.yml down -v --remove-orphans || true

backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	@echo "==> Checking Frontend TypeScript..."
	cd frontend && npx tsc --noEmit
	@echo "==> Checking Backend imports..."
	cd backend && uv run python -c "import app.main; print('Backend loaded successfully!')"

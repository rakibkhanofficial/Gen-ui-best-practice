.PHONY: help dev backend frontend docker-up docker-down install

help:
	@echo "Available commands:"
	@echo "  make dev         - Start Docker services, backend, and frontend instructions"
	@echo "  make docker-up   - Start PostgreSQL and Redis Docker containers"
	@echo "  make docker-down - Stop Docker containers"
	@echo "  make backend     - Run Python agent backend with UV (port 8000)"
	@echo "  make frontend    - Run Next.js 16 frontend (port 3000)"
	@echo "  make install     - Install all backend (uv) and frontend (npm) dependencies"

install:
	@echo "Installing backend dependencies with UV..."
	cd backend && uv sync
	@echo "Installing frontend dependencies with npm..."
	cd frontend && npm install --legacy-peer-deps

docker-up:
	docker compose up -d

docker-down:
	docker compose down

backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev


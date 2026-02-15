
.PHONY: install run-docker run-backend run-frontend lint format test clean help dev-db stop-db seed dev-fresh

# Default target
help:
	@echo "PaperPulse Makefile"
	@echo "-------------------"
	@echo "make install      - Install all dependencies (Backend + Frontend)"
	@echo "make dev-fresh    - Fresh dev setup: Start DB + Seed + Run Backend & Frontend"
	@echo "make dev-db       - Start only the Database (Docker) in background"
	@echo "make run-backend  - Run Backend locally (Flask) with Hot Reload"
	@echo "make run-frontend - Run Frontend locally (Next.js) with Hot Reload"
	@echo "make seed         - Seed the database with random data (Needs DB running)"
	@echo "make run-docker   - Run the full stack using Docker (Production Build)"
	@echo "make stop         - Stop all Docker containers"
	@echo "make lint         - Check code quality (Ruff + ESLint)"
	@echo "make format       - Auto-format code (Ruff + Prettier)"
	@echo "make test         - Run Backend tests (Pytest)"
	@echo "make clean        - Remove temporary files and caches"

# --- Installation ---
install: install-backend install-frontend

install-backend:
	cd backend && uv sync

install-frontend:
	cd frontend && npm install

# --- Development Execution ---
dev-db:
	docker compose up -d db

run-backend:
	cd backend && uv run python run.py

run-frontend:
	cd frontend && npm run dev

seed:
	cd backend && uv run python seed.py

dev-fresh:
	@echo "🚀 Starting fresh development environment..."
	@echo "📦 Starting database..."
	@docker compose up -d db
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "🌱 Seeding database..."
	@cd backend && uv run python seed.py
	@echo "✅ Database ready and seeded!"
	@echo "🔥 Starting backend and frontend in parallel..."
	@echo "Press Ctrl+C to stop all services"
	@trap 'docker compose down; exit' INT; \
	cd backend && uv run python run.py & \
	cd frontend && npm run dev & \
	wait

stop:
	docker compose down

# --- Full Stack Execution (Docker) ---
run-docker:
	docker compose up --build

# --- Quality Control ---
lint: lint-backend lint-frontend

lint-backend:
	cd backend && uv run ruff check .

lint-frontend:
	cd frontend && npm run lint

# --- Formatting ---
format: format-backend format-frontend

format-backend:
	cd backend && uv run ruff format .

format-frontend:
	cd frontend && npx prettier --write .

# --- Testing ---
test: test-backend test-frontend

test-backend:
	cd backend && uv run pytest

test-frontend:
	cd frontend && npm run test

# --- Cleaning ---
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf backend/.venv

# ---- Generating -----

gen-types:
	cd backend && uv run python scripts/dump_schemas.py
	cd frontend && node scripts/gen_zod.js

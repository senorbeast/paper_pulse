
.PHONY: install run-docker run-backend run-frontend lint format test clean help

# Default target
help:
	@echo "PaperPulse Makefile"
	@echo "-------------------"
	@echo "make install      - Install all dependencies (Backend + Frontend)"
	@echo "make run-docker   - Run the full stack using Docker Compose"
	@echo "make run-backend  - Run Backend locally (Flask)"
	@echo "make run-frontend - Run Frontend locally (Next.js)"
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

# --- Running ---
run-docker:
	docker-compose up --build

run-backend:
	cd backend && uv run python run.py

run-frontend:
	cd frontend && npm run dev

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
test:
	cd backend && uv run pytest

# --- Cleaning ---
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf backend/.venv

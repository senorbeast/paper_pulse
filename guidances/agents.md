
# 🏗️ PaperPulse Engineering Handbook

## 1. Monorepo Structure & Tooling
PaperPulse is a high-integrity research repository using strict type safety and modern tooling.

### 🐍 Backend (Flask + Python)
- **Dependency Management**: `uv` (Replaces poetry/pip/venv)
  - Install dependencies: `uv sync`
  - Add dependency: `uv add <package>`
  - Run scripts: `uv run python run.py`
- **Linting & Formatting**: `ruff` (Replaces black/flake8/isort)
  - Lint: `uv run ruff check .`
  - Format: `uv run ruff format .`
- **Testing**: `pytest`
  - Run all tests: `uv run pytest`

### ⚛️ Frontend (Next.js + TypeScript)
- **Dependency Management**: `npm`
  - Install: `npm install`
- **Formatting**: `prettier`
  - Format all: `npx prettier --write .`
- **Linting**: `eslint`
  - Lint: `npm run lint`

---

## 2. Directory Structure (Domain Silos)
Organize code by domain, not type. Every domain (papers, authors, search) must have:
- `routes.py`: HTTP entry point.
- `service.py`: Business logic and cross-domain coordination (EXPOSED).
- `repository.py`: Persistence logic inheriting from `BaseRepository` (INTERNAL).
- `models.py`: SQLAlchemy models (INTERNAL).
- `schemas.py`: Pydantic DTOs (EXPOSED).

## 3. Boundary Enforcement Rules
- **Import Rule:** `domain_A` may only import from `domain_B.service` or `domain_B.schemas`. 
- **NO DIRECT MODEL IMPORTS:** Importing a Model from another domain folder is a strict failure.
- **No Leaks:** Services must return DTOs, never ORM Model objects.

## 4. Implementation Standards
- **Validation:** Use Pydantic V2 for all data validation.
- **Type Hinting:** Required for all function signatures.
- **Error Handling:** Use custom exceptions that the global Flask handler can convert to JSON.
- **Simplicity:** Favor readable `for` loops and explicit mapping over complex list comprehensions or metaprogramming.

## 5. Development Workflow
To start the full stack environment:

```bash
docker-compose up --build
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
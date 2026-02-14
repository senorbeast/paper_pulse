
# PaperPulse: High-Integrity Research Repository

PaperPulse is a modular research management system built with Flask, Next.js, and PostgreSQL. It demonstrates a "Security-by-Design" approach to software architecture, where strict domain boundaries and type-safety allow the system to evolve from a metadata repository to an AI-driven search engine.

## 🏗️ Architectural Core Principles

| Criterion | Technical Implementation |
| :--- | :--- |
| **Structure** | **Domain-Driven Isolation:** Each feature (Papers, Authors, Analytics) is a self-contained internal package. |
| **Simplicity** | **Explicit Mapping:** We use DTOs and a Service layer to avoid "Magic" ORM behaviors and keep logic predictable. |
| **Correctness** | **State Guards:** Relational constraints (Unique DOIs) and Pydantic validation prevent invalid data states. |
| **Interface Safety** | **Contract-First:** Every API request/response is governed by a Pydantic DTO (Backend) and Zod Schema (Frontend). |
| **Change Resilience** | **Repository Pattern:** Logic is decoupled from the ORM. Moving from Postgres to a Vector DB only impacts the Repository. |
| **Observability** | **Traceability:** Failures are caught by a global error handler and returned as structured JSON with event codes. |

## 🛠️ Tech Stack & Tooling

- **Backend**: Flask + Python 3.12+
  - **Manager**: `uv` (Fast Python package installer and resolver)
  - **Linter/Formatter**: `ruff` (High-performance Python linter)
  - **DB**: PostgreSQL + `pgvector`
- **Frontend**: Next.js (App Router) + TypeScript
  - **Styling**: Tailwind CSS
  - **Formatter**: Prettier
  - **Linter**: ESLint

## 🚀 Quick Start

Usually, you can just run the following command to start the entire application:

```bash
make run-docker
```
- **Backend API**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`

### 🔧 Development Commands

We provide a `Makefile` to simplify common tasks.

| Intent | Command | Description |
| :--- | :--- | :--- |
| **Install** | `make install` | Install dependencies for both Backend (uv) and Frontend (npm). |
| **Run (Docker)** | `make run-docker` | Start the full stack (DB, Backend, Frontend) in Docker. |
| **Format** | `make format` | Auto-format Python (Ruff) and TypeScript (Prettier) files. |
| **Lint** | `make lint` | Run static analysis to catch bugs. |
| **Test** | `make test` | Run the backend test suite (Pytest). |
| **Clean** | `make clean` | Remove artifacts and caches. |

### 📂 Directory Structure

```bash
paper_pulse/
├── backend/                # Flask Application
│   ├── app/
│   │   ├── common/         # Shared utilities (BaseRepository, Error Handlers)
│   │   ├── modules/        # Domain Modules (Authors, Papers)
│   ├── tests/              # Pytest suite
│   ├── pyproject.toml      # Config for uv, ruff, pytest
│   └── uv.lock             # Python lockfile
├── frontend/               # Next.js Application
│   ├── src/                # Source code
│   └── package.json        # Frontend dependencies
├── guidances/              # Engineering Handbooks & Specs
└── Makefile                # Command shortcuts
```
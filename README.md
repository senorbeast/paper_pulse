
# PaperPulse: High-Integrity Research Repository

**Paper Pulse** is a comprehensive research management system designed to help researchers, institutions, and organizations manage their academic papers, authors, and research outputs efficiently. Built with modern technologies and architectural best practices, Paper Pulse provides robust paper cataloging, author management, and will soon support AI-powered semantic search capabilities to help discover relevant research across your repository.


## 🏗️ Architecture Principles

Paper Pulse follows clean architecture patterns:

- **Modular Design with Boundaries**: Self-contained domain modules (Authors, Papers) with clear boundaries
- **Type Safety**: End-to-end type synchronization from Python (Pydantic) to TypeScript (Zod)
- **Repository Pattern**: Database logic isolated for easy migration (PostgreSQL → Vector DB)
- **Contract-First APIs**: All endpoints governed by validated DTOs/schemas
- **Centralized Error Handling**: Structured JSON responses with event codes
- **Automated Testing**: Comprehensive test coverage for backend (pytest) and frontend (Vitest)

## 📚 Documentation

Comprehensive guides to help you understand and work with Paper Pulse:

- **[API Type Synchronization](docs/API_TYPE_SYNC.md)** - How backend Pydantic models automatically sync to frontend Zod schemas
- **[Authors Data Flow](docs/authors-data-flow.md)** - Complete data flow from frontend to backend for the authors feature
- **[Backend Testing Guide](backend/docs/TESTING_GUIDE.md)** - Pytest setup, fixtures, and testing patterns
- **[Frontend Testing Guide](frontend/test/README.md)** - Vitest and Testing Library for React components
- **[Project Specifications](docs/specifications.md)** - Project requirements and specifications

## �🛠️ Tech Stack & Tooling

- **Backend**: Flask + Python 3.12+
  - **Manager**: `uv` (Fast Python package installer and resolver)
  - **Linter/Formatter**: `ruff` (High-performance Python linter)
  - **DB**: PostgreSQL
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
| **Test** | `make test` | Run the full test suite (Backend + Frontend). |
| **Test Backend** | `make test-backend` | Run only backend tests (Pytest). |
| **Test Frontend** | `make test-frontend` | Run only frontend tests (Vitest). |
| **Gen Types** | `make gen-types` | Sync backend Pydantic models to frontend Zod schemas. [Read More](docs/API_GENERATION.md) |
| **Clean** | `make clean` | Remove artifacts and caches. |

## ✅ Completed Features

Paper Pulse has successfully implemented the following core features:

### 🏛️ **Architecture & Infrastructure**
- **Domain-Driven Design**: Modular architecture with self-contained feature packages
- **Repository Pattern**: Database abstraction layer for flexible data storage
- **Type-Safe Contracts**: Pydantic DTOs (backend) + Zod schemas (frontend) for end-to-end type safety
- **API Type Generation**: Automated sync between backend and frontend types
- **Error Handling**: Global error handler with structured JSON responses
- **Logging Middleware**: Central logging module for observability

### 🧪 **Testing Infrastructure**
- **Backend Testing**: Comprehensive pytest setup with fixtures, integration tests, and unit tests
- **Frontend Testing**: Vitest + Testing Library for component and integration testing
- **Test Utilities**: Reusable abstractions (e.g., FormTester for consistent form testing)
- **CI/CD Ready**: Automated test suites for both frontend and backend

### 👥 **Authors Module**
- Create, read, and list authors
- Author validation (name, email, bio)
- CRUD operations with full test coverage
- RESTful API endpoints

### 📄 **Papers Module**
- Paper management with DOI validation
- Author-paper relationships
- Title, abstract, and publication year tracking
- Integration with authors module

## 🚀 Roadmap & Planned Features

The following features are planned for future releases:

### 🤖 **AI & Semantic Search** (Priority: High)
- **Semantic Search**: AI-powered search to discover relevant papers based on meaning, not just keywords
- **Vector Embeddings**: Integration with vector databases for similarity search
- **Research Recommendations**: AI-driven paper recommendations based on user interests
- **Abstract Summarization**: Automated paper summaries using LLMs

### 📊 **Advanced Analytics**
- Citation network visualization
- Research impact metrics
- Author collaboration graphs
- Trending research topics

### 🔍 **Enhanced Discovery**
- Advanced filtering and faceted search
- Tag-based organization
- Full-text search capabilities
- Export functionality (BibTeX, CSV, JSON)

### 👥 **Collaboration Features**
- User authentication and authorization
- Research collections and folders
- Sharing and collaboration tools
- Reading lists and annotations

### 📈 **Data Integration**
- Import from external databases (arXiv, PubMed, etc.)
- DOI-based auto-fill of paper metadata
- Bulk import/export capabilities
- Integration with reference managers (Zotero, Mendeley)

## 📂 Directory Structure

```bash
paper_pulse/
├── backend/                    # Flask REST API
│   ├── app/
│   │   ├── common/             # Shared utilities
│   │   │   ├── base_repository.py
│   │   │   ├── error_handler.py
│   │   │   └── logger.py
│   │   ├── modules/            # Feature modules
│   │   │   ├── authors/        # Authors CRUD
│   │   │   └── papers/         # Papers CRUD
│   │   └── main.py             # App factory
│   ├── tests/                  # Pytest test suite
│   │   ├── integration/        # API integration tests
│   │   └── unit/               # Service unit tests
│   ├── scripts/                # Utility scripts
│   │   └── dump_schemas.py     # Generate OpenAPI specs
│   └── pyproject.toml          # Python dependencies (uv)
├── frontend/                   # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/                # Pages and routes
│   │   ├── components/         # React components
│   │   ├── hooks/              # TanStack Query hooks
│   │   └── lib/                # Utilities + API client
│   ├── test/                   # Vitest test suite
│   ├── specs/                  # Generated OpenAPI specs
│   └── scripts/                # Code generation scripts
│       └── gen_zod.js          # Generate Zod schemas
├── docs/                       # Project documentation
└── Makefile                    # Development commands
```
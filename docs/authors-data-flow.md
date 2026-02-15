# Authors Feature: Data Flow Documentation

This document describes the complete data flow from Frontend (FE) to Backend (BE) for the Authors feature in the Paper Pulse application.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Request Flow: Create Author](#request-flow-create-author)
- [Request Flow: Get All Authors](#request-flow-get-all-authors)
- [Request Flow: Get Single Author](#request-flow-get-single-author)
- [Layer Descriptions](#layer-descriptions)
- [Type Safety & Validation](#type-safety--validation)

---

## Architecture Overview

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│  UI Layer         → authors/page.tsx                        │
│  Hook Layer       → useAuthors.ts                           │
│  API Client       → client.ts (fetchTyped, postTyped)       │
│  Schema Layer     → schemas.ts (Zod validation)             │
│  Code Gen         → gen_zod.js (OpenAPI → Zod)              │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP
                    (JSON over REST API)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│  Route Layer      → routes.py (Flask Blueprint)             │
│  Service Layer    → service.py (Business Logic)             │
│  Repository Layer → repository.py (Data Access)             │
│  Model Layer      → models.py (SQLAlchemy ORM)              │
│  Schema Layer     → schemas.py (Pydantic DTOs)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │   PostgreSQL  │
                    │   Database    │
                    └───────────────┘
```

---

## Request Flow: Create Author

### Step-by-Step Flow

#### 1. **UI Layer** (`frontend/src/app/authors/page.tsx`)
```typescript
Location: Lines 32-36
```

**What happens:**
- User fills out the form with name, email, and bio
- Form submission triggers `onSubmit` handler
- Data is validated against `AuthorCreateSchema` via `react-hook-form` + `zodResolver`
- If validation passes, calls `createMutation.mutate(data)`

**Data:** `{ name: string, email: string, bio: string | null }`

---

#### 2. **Hook Layer** (`frontend/src/hooks/useAuthors.ts`)
```typescript
Location: Lines 37-47
Function: useCreateAuthor()
```

**What happens:**
- TanStack Query's `useMutation` hook handles the API call
- Calls `postTyped("/authors/", newAuthor, AuthorResponseSchema)`
- On success, invalidates the `authorKeys.all` query to refetch the list

**Input:** `AuthorCreate`  
**Output:** `AuthorResponse`

---

#### 3. **API Client Layer** (`frontend/src/lib/api/client.ts`)
```typescript
Location: Lines 31-47
Function: postTyped()
```

**What happens:**
- Sends POST request to `http://localhost:5000/api/authors/`
- Includes `Content-Type: application/json` header
- Receives response and validates it against `AuthorResponseSchema` (Zod)
- If validation fails, throws error
- If validation passes, returns typed data

**HTTP:**
```
POST /api/authors/
Content-Type: application/json

{
  "name": "Dr. Jane Doe",
  "email": "jane@university.edu",
  "bio": "Research interests..."
}
```

---

#### 4. **Route Layer** (`backend/app/modules/authors/routes.py`)
```python
Endpoint: POST /authors/
```

**What happens:**
- Flask route receives the JSON request
- Extracts JSON data via `request.get_json()`
- Creates `AuthorCreateDTO` instance from raw data (Pydantic validation)
- If validation fails, returns 400 error with Pydantic error details
- Calls `service.create_author(dto)`
- Returns serialized response with 201 status code

**Validation:** Pydantic validates:
- `name`: trimmed string, 1-100 chars
- `email`: valid email format, max 120 chars
- `bio`: optional trimmed string

---

#### 5. **Service Layer** (`backend/app/modules/authors/service.py`)
```python
Function: create_author()
```

**What happens:**
- Business logic layer handles the create operation
- Checks if author with email already exists via `repository.get_by_email()`
- If exists, raises `AppError` with 409 Conflict status
- If not, calls `repository.create()` with DTO data
- Validates the created model against `AuthorResponseDTO`
- Returns validated response

**Business Rules:**
- Email must be unique

---

#### 6. **Repository Layer** (`backend/app/modules/authors/repository.py`)
```python
Extends: BaseRepository[Author]
```

**What happens:**
- Inherits from `BaseRepository` which provides CRUD operations
- `create(**kwargs)` method (from base):
  - Creates new `Author` model instance
  - Adds to database session
  - Commits transaction
  - Refreshes instance to get DB-generated fields (like `id`)
  - Returns the model instance

**Custom Method:**
- `get_by_email(email)`: Queries author by email for uniqueness check

---

#### 7. **Model Layer** (`backend/app/modules/authors/models.py`)
```python
Class: Author (SQLAlchemy Model)
```

**What happens:**
- SQLAlchemy ORM model defines database schema
- Maps Python class to `authors` table
- Defines columns: `id`, `name`, `bio`, `email`
- `email` has unique constraint at DB level
- Relationship to `Paper` model (one-to-many)

**Database Schema:**
```sql
CREATE TABLE authors (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    bio TEXT NULL
);
```

---

#### 8. **Response Flow (Upward)**

The created `Author` model instance flows back up through the layers:

```
Repository → Service → Routes
```

Each layer transforms the data:

- **Repository:** Returns SQLAlchemy `Author` instance
- **Service:** Validates and returns `AuthorResponseDTO` Pydantic model
- **Routes:** Serializes DTO to JSON via `.model_dump()`

**Response to Frontend:**
```json
HTTP 201 Created

{
  "id": 42,
  "name": "Dr. Jane Doe",
  "email": "jane@university.edu",
  "bio": "Research interests..."
}
```

---

## Request Flow: Get All Authors

### Frontend → Backend

#### 1. **UI Layer** (`frontend/src/app/authors/page.tsx`)
```typescript
```
- Component renders, `useAuthors()` hook executes
- TanStack Query automatically fetches data on mount

---

#### 2. **Hook Layer** (`frontend/src/hooks/useAuthors.ts`)
```typescript
xFunction: useAuthors()
```
- Calls `fetchTyped("/authors/", AuthorListSchema)`
- `AuthorListSchema` is `z.array(AuthorResponseSchema)`

---

#### 3. **API Client**
```
GET /api/authors/
```
- Fetches array of authors
- Validates each item against `AuthorResponseSchema`

---

#### 4. **Backend Route** (`backend/app/modules/authors/routes.py`)
```python
Endpoint: GET /authors/
```
- Calls `service.get_all_authors()`
- Serializes list of DTOs to JSON

---

#### 5. **Backend Service** (`backend/app/modules/authors/service.py`)
```python
Function: get_all_authors()
```
- Calls `repository.get_all()`
- Validates each author against `AuthorResponseDTO`
- **Important:** Skips invalid authors and logs warnings (defensive programming)
- Returns list of valid DTOs

---

#### 6. **Backend Repository**
- Queries all authors from database (with optional limit/offset)
- Returns list of `Author` models

---

## Request Flow: Get Single Author

### Frontend → Backend

#### 1. **Hook Layer** (`frontend/src/hooks/useAuthors.ts`)
```typescript
Function: useAuthor(id)
```
- Fetches single author by ID
- Only enabled if `id` is truthy

---

#### 2. **API Client**
```
GET /api/authors/{id}
```

---

#### 3. **Backend Route** (`backend/app/modules/authors/routes.py`)
```python
Endpoint: GET /authors/<int:id>
```
- Receives `id` from URL path parameter
- Calls `service.get_author(id)`

---

#### 4. **Backend Service** (`backend/app/modules/authors/service.py`)
```python
Function: get_author(author_id)
```
- Calls `repository.get_by_id(author_id)`
- If not found, raises `AppError` with 404 status
- Validates and returns `AuthorResponseDTO`

---

#### 5. **Backend Repository**
- Uses `session.get(Author, id)` to fetch by primary key
- Returns `Author` instance or `None`

---

## Layer Descriptions

### Frontend Layers

#### **1. UI Layer** (`page.tsx`)
**Responsibility:** User interface and user interaction
- Renders forms, displays data
- Handles user input
- Uses React Hook Form for form management
- Displays validation errors to user

**Technologies:**
- React (Next.js)
- React Hook Form
- shadcn/ui components

---

#### **2. Hook Layer** (`useAuthors.ts`)
**Responsibility:** Data fetching and state management
- Abstracts API calls from UI components
- Manages loading, error, and success states
- Provides cache invalidation
- Defines query keys for cache management

**Technologies:**
- TanStack Query (React Query)
- Custom hooks pattern

---

#### **3. API Client Layer** (`client.ts`)
**Responsibility:** HTTP communication with backend
- Centralized axios instance with base URL
- Type-safe API calls with runtime validation
- Error handling
- Request/response transformation

**Technologies:**
- Axios
- Zod (runtime validation)

---

#### **4. Schema Layer** (`schemas.ts`)
**Responsibility:** Type definitions and runtime validation
- **Generated automatically** from backend OpenAPI spec
- Provides TypeScript types
- Provides Zod schemas for runtime validation
- Ensures frontend-backend contract alignment

**Technologies:**
- Zod
- TypeScript

---

#### **5. Code Generation** (`gen_zod.js`)
**Responsibility:** Automate schema synchronization
- Reads OpenAPI spec from backend
- Converts Pydantic models → Zod schemas
- Adds `.trim()` to all string validations
- Strips "DTO" suffix for cleaner naming

**Technologies:**
- Node.js
- json-schema-to-zod library

**Input:** `/frontend/specs/openapi.json`  
**Output:** `/frontend/src/lib/api/schemas.ts`

---

### Backend Layers

#### **1. Route Layer** (`routes.py`)
**Responsibility:** HTTP request/response handling
- Defines API endpoints (Flask Blueprints)
- Parses request data
- Validates input via Pydantic
- Calls service layer
- Serializes responses to JSON
- Handles HTTP status codes

**Technologies:**
- Flask
- Pydantic (for DTO validation)

---

#### **2. Service Layer** (`service.py`)
**Responsibility:** Business logic
- Orchestrates operations between layers
- Enforces business rules (e.g., unique email)
- Cross-module coordination (e.g., Papers referencing Authors)
- Error handling and domain exceptions
- Validation of entities

**Technologies:**
- Python
- Pydantic (for response validation)

---

#### **3. Repository Layer** (`repository.py`)
**Responsibility:** Data access abstraction
- CRUD operations
- Database queries
- Encapsulates SQLAlchemy session management
- Custom query methods (e.g., `get_by_email`)

**Technologies:**
- SQLAlchemy (ORM)
- Generic base repository pattern

---

#### **4. Model Layer** (`models.py`)
**Responsibility:** Database schema definition
- Defines database tables via SQLAlchemy ORM
- Defines relationships between entities
- Database constraints (unique, nullable, etc.)
- No business logic (anemic models)

**Technologies:**
- SQLAlchemy ORM
- PostgreSQL (via SQLAlchemy)

---

#### **5. Schema Layer** (`schemas.py`)
**Responsibility:** Data Transfer Objects (DTOs)
- Input validation via Pydantic
- Output serialization
- Type safety
- Data transformation (e.g., trimming whitespace)
- Separation from database models

**Technologies:**
- Pydantic
- Python type hints

**DTOs:**
- `AuthorBaseDTO`: Shared fields (name, email, bio)
- `AuthorCreateDTO`: Input for creating authors
- `AuthorResponseDTO`: Output with `id` field

---

## Type Safety & Validation

### Frontend Validation Flow

```
User Input
    ↓
React Hook Form (validates on submit)
    ↓
Zod Schema (AuthorCreateSchema)
    ↓ (client-side validation)
[Validation errors shown in UI]
    ↓ (if valid)
API Client (fetchTyped/postTyped)
    ↓ (sends request)
Backend Response
    ↓
Zod Schema (AuthorResponseSchema)
    ↓ (runtime validation)
[Throws error if shape mismatches]
    ↓ (if valid)
Typed Data returned to UI
```

**Key Points:**
- All strings are trimmed via `.trim()` on Zod schemas
- Generated schemas mirror backend Pydantic models
- Runtime validation catches backend-frontend contract violations

---

### Backend Validation Flow

```
HTTP Request (JSON)
    ↓
Flask Route (routes.py)
    ↓
Pydantic DTO (AuthorCreateDTO)
    ↓ (validation via BeforeValidator)
[400 error if validation fails]
    ↓ (if valid)
Service Layer (business logic validation)
    ↓ (e.g., unique email check)
[409 error if business rule violated]
    ↓ (if valid)
Repository (creates model)
    ↓
SQLAlchemy Model (database constraints)
    ↓ (DB-level unique constraint)
[500 error if DB constraint violated]
    ↓ (if valid)
Committed to Database
    ↓
Pydantic DTO (AuthorResponseDTO)
    ↓ (validates response)
JSON Response
```

**Key Points:**
- All strings are trimmed via `STRIP_WS` BeforeValidator
- Multiple validation layers: Pydantic → Business Logic → Database
- Email uniqueness enforced at both application and database levels

---

## Schema Synchronization

### The Contract: OpenAPI Spec → Frontend Types

```
Backend Pydantic Models (schemas.py)
    ↓
Backend generates OpenAPI spec
(via FastAPI or manual export)
    ↓
Saved to: frontend/specs/openapi.json
    ↓
Code Gen Script (gen_zod.js)
    ↓
- Strips "DTO" suffix
- Converts JSON Schema → Zod
- Adds .trim() to strings
    ↓
Generated File: frontend/src/lib/api/schemas.ts
    ↓
TypeScript types + Zod schemas
    ↓
Used by hooks and components
```

**Workflow:**
1. Backend developer updates Pydantic schemas
2. Backend generates new OpenAPI spec
3. Frontend runs `npm run gen:schemas` (or similar)
4. Zod schemas and TypeScript types auto-update
5. TypeScript compiler catches any breaking changes

---

## Error Handling

### Frontend Error Flow

```typescript
// Example: Create author fails
createMutation.mutate(data)
    ↓
API Client catches error
    ↓
TanStack Query mutation.isError = true
    ↓
UI displays error message:
{createMutation.isError && (
  <p className="text-red-500">
    {getApiErrorMessage(createMutation.error)}
  </p>
)}
```

### Backend Error Flow

```python
# Example: Email already exists
service.create_author(dto)
    ↓
repository.get_by_email(dto.email) returns existing author
    ↓
raise AppError("Author with this email already exists", 409)
    ↓
Error handler middleware catches AppError
    ↓
Returns JSON response:
{
  "error": "Author with this email already exists",
  "status": 409
}
```

---

## Dependencies Between Modules

### Authors → Papers Relationship

The `PaperService` depends on `AuthorService`:

```python
# backend/app/modules/papers/service.py
class PaperService:
    def __init__(self, repository=None, author_service=None):
        self.author_service = author_service or AuthorService()

    def create_paper(self, data: PaperCreateDTO):
        # Validate author exists
        self.author_service.get_author(data.author_id)
        # ... create paper
```

**Flow when creating a paper:**
1. User submits paper with `author_id`
2. `PaperService.create_paper()` calls `AuthorService.get_author()`
3. If author not found, raises 404 error
4. If author exists, proceeds to create paper

This demonstrates **inter-module communication** at the service layer.

---

## Summary

### Key Architectural Patterns

1. **Layered Architecture**: Clear separation between UI, business logic, and data access
2. **Repository Pattern**: Abstracts database operations
3. **DTO Pattern**: Separates API contracts from database models
4. **Type Safety**: End-to-end typing from backend (Pydantic) to frontend (TypeScript + Zod)
5. **Validation at Multiple Levels**: Client-side (Zod), Server-side (Pydantic), Database (constraints)
6. **Code Generation**: Automated schema synchronization prevents drift

### Data Flow Summary

**Create Author:**
```
UI Form → React Hook Form → Zod Validation → TanStack Query → 
Axios → Flask Route → Pydantic DTO → Service → Repository → 
SQLAlchemy → PostgreSQL → Response (reverse path)
```

**Get Authors:**
```
UI Component Mount → TanStack Query → Axios → Flask Route → 
Service → Repository → SQLAlchemy → PostgreSQL → 
Response (validated via Pydantic) → Zod Validation → UI
```

---

## File Reference

### Frontend Files
- **UI:** `frontend/src/app/authors/page.tsx`
- **Hooks:** `frontend/src/hooks/useAuthors.ts`
- **API Client:** `frontend/src/lib/api/client.ts`
- **Schemas:** `frontend/src/lib/api/schemas.ts` (generated)
- **Code Gen:** `frontend/scripts/gen_zod.js`

### Backend Files
- **Routes:** `backend/app/modules/authors/routes.py`
- **Service:** `backend/app/modules/authors/service.py`
- **Repository:** `backend/app/modules/authors/repository.py`
- **Models:** `backend/app/modules/authors/models.py`
- **Schemas:** `backend/app/modules/authors/schemas.py`
- **Base Repository:** `backend/app/common/base_repository.py`

---

*Last Updated: 2026-02-15*

# API Schema & Type Generation Pipeline

This document outlines the automated pipeline for synchronizing backend data models (Python/Pydantic) with frontend types and validation schemas (TypeScript/Zod).

## Overview

We use a "Code-First" approach where the Python backend models serve as the source of truth. The pipeline automatically generates the corresponding frontend assets to ensure type safety and consistency across the stack.

**Flow:** `Python (Pydantic)` -> `OpenAPI 3.0 (JSON)` -> `TypeScript (Zod + Types)`

---

## 1. Backend: Defining Data Models

The backend uses **Pydantic** to define Data Transfer Objects (DTOs).

-   **Location**: `backend/app/modules/*/schemas.py`
-   **Convention**: ALL schema classes must end with the suffix `DTO` (e.g., `PaperCreateDTO`, `AuthorResponseDTO`) to be automatically discovered.

### Example (`backend/app/modules/papers/schemas.py`)
```python
from pydantic import BaseModel

class PaperCreateDTO(BaseModel):
    title: str
    doi: str
```

## 2. Step 1: Exporting to OpenAPI

We use a custom script to dynamically discover all DTOs and export them as an OpenAPI 3.0 compatible JSON specification.

-   **Script**: `backend/scripts/dump_schemas.py`
-   **Output**: `frontend/specs/openapi.json`

**How it works:**
1.  The script scans all submodules in `backend/app/modules`.
2.  It looks for a `schemas.py` file in each module.
3.  It finds all Pydantic models ending in `DTO`.
4.  It aggregates them into a single OpenAPI `components.schemas` block and saves it to a JSON file.

## 3. Step 2: Generating Frontend Assets

The frontend consumes the OpenAPI JSON to generate Zod schemas and TypeScript type definitions.

-   **Script**: `frontend/scripts/gen_zod.js`
-   **Input**: `frontend/specs/openapi.json`
-   **Output**: `frontend/src/lib/api/schemas.ts`

**How it works:**
1.  Reads the `openapi.json` file.
2.  Iterates through the schemas defined in `components.schemas`.
3.  Converts each JSON Schema definition into a **Zod** schema string using `json-schema-to-zod`.
4.  Standardizes naming (strips the `DTO` suffix, e.g., `PaperCreateDTO` -> `PaperCreate`).
5.  Writes both the Zod schema (`export const PaperCreateSchema = ...`) and the TypeScript type (`export type PaperCreate = ...`) to the output file.

### Example Output (`frontend/src/lib/api/schemas.ts`)
```typescript
import { z } from 'zod';

export const PaperCreateSchema = z.object({
  title: z.string(),
  doi: z.string(),
});
export type PaperCreate = z.infer<typeof PaperCreateSchema>;
```

---

## Usage

You can run the entire pipeline with a single Make command:

```bash
make gen-types
```

### Manual Execution

If you need to run steps individually:

1.  **Generate OpenAPI Spec:**
    ```bash
    cd backend && uv run python scripts/dump_schemas.py
    ```

2.  **Generate Zod/TS:**
    ```bash
    cd frontend && node scripts/gen_zod.js
    ```

## Extending the API

To add a new data model:
1.  Create a standard Pydantic model in the appropriate `schemas.py` file in the backend.
2.  Ensure the class name ends with `DTO`.
3.  Run `make gen-types`.
4.  The new type and validator will be immediately available in the frontend for use.

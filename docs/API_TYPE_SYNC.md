# API Type Synchronization & Generation

This document outlines how Paper Pulse maintains **end-to-end type safety** by automatically synchronizing backend data models (Python/Pydantic) with frontend types and validation schemas (TypeScript/Zod).

## Overview

We use a **Code-First** approach where Python backend DTOs serve as the **Source of Truth**. The automated pipeline ensures compile-time type safety and runtime validation across the entire stack.

**Pipeline Flow:** `Python (Pydantic)` → `OpenAPI 3.0 (JSON)` → `TypeScript (Zod + Types)`

---

## The Workflow

### 1. Define Backend DTOs

All data models are defined using **Pydantic** in the backend.

- **Location**: `backend/app/modules/*/schemas.py`
- **Convention**: ALL schema classes must end with `DTO` suffix (e.g., `PaperCreateDTO`, `AuthorResponseDTO`)

**Example** (`backend/app/modules/papers/schemas.py`):
```python
from pydantic import BaseModel

class PaperCreateDTO(BaseModel):
    title: str
    doi: str
    author_id: int
```

### 2. Generate Types

Run the sync command to generate frontend types:

```bash
make gen-types
```

This executes two steps:

#### Step 1: Export to OpenAPI
- **Script**: `backend/scripts/dump_schemas.py`
- **Output**: `frontend/specs/openapi.json`
- Scans all modules for `schemas.py` files
- Finds all Pydantic models ending in `DTO`
- Exports to OpenAPI 3.0 compatible JSON

#### Step 2: Generate Zod Schemas & TypeScript Types
- **Script**: `frontend/scripts/gen_zod.js`
- **Input**: `frontend/specs/openapi.json`
- **Output**: `frontend/src/lib/api/schemas.ts`
- Converts JSON Schema to Zod schemas
- Strips `DTO` suffix (e.g., `PaperCreateDTO` → `PaperCreate`)
- Generates TypeScript types from Zod schemas

**Generated Output** (`frontend/src/lib/api/schemas.ts`):
```typescript
import { z } from 'zod';

export const PaperCreateSchema = z.object({
  title: z.string(),
  doi: z.string(),
  author_id: z.number(),
});
export type PaperCreate = z.infer<typeof PaperCreateSchema>;
```

### 3. Verify Generated Files

**⚠️ IMPORTANT**: After running `make gen-types`, always review the generated files to ensure correctness:

1. **Check `frontend/specs/openapi.json`** - Verify all DTOs were exported correctly
2. **Check `frontend/src/lib/api/schemas.ts`** - Ensure Zod schemas match your backend models
3. **Look for generation errors** - Review terminal output for any warnings or failed conversions
4. **Test in IDE** - Verify TypeScript autocomplete works as expected

This verification step catches edge cases, type mismatches, or generation bugs before they reach production.

### 4. Use in Frontend with Type Safety

We use a `fetchTyped` utility that validates API responses at runtime:

```typescript
// src/hooks/usePapers.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTyped } from "@/lib/api/client";
import { PaperResponseSchema } from "@/lib/api/schemas";
import { z } from "zod";

const PaperListSchema = z.array(PaperResponseSchema);

export const usePapers = () => {
  return useQuery({
    queryKey: ["papers"],
    queryFn: () => fetchTyped("/papers/", PaperListSchema),
  });
};
```

---

## Why This Approach?

### Compile-Time Safety
TypeScript knows exactly what `data` contains (`data.title`, `data.doi`), providing autocomplete and catching errors before runtime.

### Runtime Protection
If the backend API changes (e.g., removes `doi`) but the frontend wasn't updated, `fetchTyped` throws a clear validation error instead of passing `undefined` silently to the UI.

### Single Source of Truth
Backend DTOs are the only place you define schema. No manual duplication or drift between backend and frontend.

### Developer Experience
- Immediate IDE autocomplete
- Type errors caught during development
- Clear validation errors in development console

---

## Adding New Data Models

1. Create a Pydantic model in the appropriate `schemas.py` file
2. Ensure the class name ends with `DTO`
3. Run `make gen-types`
4. **Verify the generated output** in `frontend/src/lib/api/schemas.ts`
5. The new type and validator are now ready to use in the frontend

**Example:**
```python
# backend/app/modules/authors/schemas.py
class AuthorCreateDTO(BaseModel):
    name: str
    email: str
    bio: str | None = None
```

After running `make gen-types`, you can use it:
```typescript
// frontend/src/hooks/useCreateAuthor.ts
import { AuthorCreateSchema, AuthorResponseSchema } from "@/lib/api/schemas";
```

---

## Manual Execution (Optional)

If you need to run steps individually:

```bash
# Step 1: Generate OpenAPI spec
cd backend && uv run python scripts/dump_schemas.py

# Step 2: Generate Zod/TypeScript
cd frontend && node scripts/gen_zod.js
```

---

## Best Practices

1. **Always run `make gen-types` after DTO changes** - Keep frontend in sync
2. **Validate all API responses** - Use `fetchTyped` or manually validate with Zod
3. **Use the DTO suffix** - Only classes ending in `DTO` are exported
4. **Commit generated files** - Include `schemas.ts` and `openapi.json` in version control
5. **Review generated types** - Verify the output matches your expectations

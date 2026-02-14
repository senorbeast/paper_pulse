
# 🏗️ Standard: API Type Synchronization

To ensure **Correctness** and **Interface Safety**, we strictly synchronize Backend DTOs with Frontend TypeScript types using Zod.

## 1. The Git-Based Truth Source
The Backend Pydantic DTOs (`schemas.py`) are the **Source of Truth**.

## 2. The Workflow
1.  **Define DTO**: Create/Edit `class MyDTO(BaseModel)` in Python.
2.  **Generate Specs**: Run the sync command.
    ```bash
    make gen-types
    ```
    This does two things:
    -   Exports JSON Schemas from Python to `frontend/specs/`.
    -   Compiles those JSON Schemas into Zod Schemas + TS Interfaces in `src/lib/api/schemas.ts`.

## 3. Frontend Usage (TanStack Query)
We use a `fetchTyped` utility that strictly validates API responses against the generated Zod schema at runtime.

### Example: Consuming Authors

```typescript
// src/hooks/useAuthors.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTyped } from "@/lib/api/client";
import { AuthorResponseSchema } from "@/lib/api/schemas";
import { z } from "zod";

const AuthorListSchema = z.array(AuthorResponseSchema);

export const useAuthors = () => {
  return useQuery({
    queryKey: ["authors"],
    queryFn: () => fetchTyped("/authors/", AuthorListSchema),
  });
};
```

### Why this creates correctness?
-   **Compile Time**: TypeScript knows exactly what `data` contains (`data.email`, `data.bio`).
-   **Runtime Protection**: If the Backend API changes (e.g., removes `email`) but Frontend wasn't updated, `fetchTyped` will throw a clear validation error instead of passing `undefined` silently to the UI.

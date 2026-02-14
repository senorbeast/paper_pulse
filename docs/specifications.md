# Product Specification: PaperPulse

## Overview
A high-integrity repository for academic research papers, focusing on metadata reliability and semantic search.

## Functional Scope
### Part 1: Metadata Ingestion (The Foundation)
- **DOI Ingestion:** Unique identification of papers via Digital Object Identifiers.
- **Author Mapping:** Relational link between papers and their researchers.
- **Dashboard:** A Next.js SSR interface showing the library of ingested research.

### Part 2: AI Semantic Search (The Evolution)
- **Vector Integration:** Use `pgvector` to store 384-dimension embeddings of paper abstracts.
- **Semantic Retrieval:** Natural language search using Cosine Similarity (`<=>`).
- **Synthesis:** An AI-driven "Abstract Summary" feature for research overviews.

## Data Schema (Part 1)
- **Author:** `id, name, bio, email (unique)`
- **Paper:** `id, title, abstract (Text), doi (unique), author_id (FK)`

## System Guardrails
- **Idempotency:** Re-submitting the same DOI must return the existing record (200 OK) rather than creating a duplicate.
- **Type Safety:** The backend must reject any input that does not strictly match the `PaperCreateDTO`.
# TANSY Production Indexing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Safely build, verify, publish, recover, and roll back approved knowledge snapshots on the agreed single-VPS deployment.

**Architecture:** Immutable Chroma collections are staged before a transactional catalog pointer makes them visible. A callable Python service and thin CLI share explicit configuration, document validation, model profiles, process locking, and audit records. The chat reader pins the published revision/profile per lookup.

**Tech Stack:** Python 3.11+, unittest, SQLite, filelock, Chroma 1.5.9, Ollama HTTP embeddings, pypdf.

**Spec:** `docs/superpowers/specs/2026-10-16-tansy-production-indexing-design.md`.

## Global Constraints

- Current target: one persistent Linux VPS; remote Chroma and Ollama endpoints are configurable.
- Preserve approved knowledge; no Board/Skilling additions or retrieval-quality redesign.
- Manifest limits: 100 sources, 10 MiB/source, 100 MiB/build, 200 PDF pages, 1,000,000 extracted characters/source, 20,000 chunks/build, 60-second extraction and 30-minute build deadlines.
- Chunk target 1,000 characters, overlap 150; batches 16, one embedding request at a time, three attempts total.
- Production uses explicit server-backed Chroma; local embedded mode is development/test only.
- Use TDD at public service/CLI/reader boundaries, real temporary storage, deterministic HTTP fixtures, and separate real-server integration.
- Never test against or migrate the live store automatically. Ship tests and operational documentation.

## Review Focus

- Missing or changed approved source bytes must preserve published answers: Task 2/4 tests.
- A completed write followed by a dropped response must not duplicate vectors: Task 3/4 tests.
- Process death and publication retries must produce an old-or-new complete snapshot: Task 4 tests.
- Source removal and stale builds must not silently discard approved knowledge: Task 4 tests.
- Legacy model provenance and restored catalog paths must not be fabricated: Task 6 tests.

### Task 1: Explicit settings and durable catalog

**Files:** `backend/indexing/{__init__,errors,settings,catalog}.py`, `backend/config.py`, `backend/tests/test_settings_catalog.py`.
**Interfaces:** `Settings.from_env(env=None)`, `Catalog(settings)`, `Catalog.active(kb)`, `Catalog.activate(kb, revision, expected_generation, operation_id, actor, reason, action)`.
- [ ] RED: configuration is independent of launch directory; invalid production storage/client settings fail; repeated activation IDs are safe and stale generations fail.
- [ ] Run `python -m unittest discover -s backend/tests -p test_settings_catalog.py -v`; inspect expected failures before implementation.
- [ ] Implement anchored configuration, typed errors, SQLite FULL/WAL schema, durable jobs/revisions, transactionally audited activation.
- [ ] Run the focused suite green and commit this behavior.

### Task 2: Approved immutable sources and deterministic chunks

**Files:** `backend/indexing/documents.py`, `backend/tests/test_documents.py`.
**Interfaces:** `load_manifest(path, settings) -> dict`, `prepare_sources(manifest, settings) -> list[dict]`, `chunks_for_sources(sources, settings) -> list[dict]`.
- [ ] RED: hash/approval/format/size checks; copied source bytes; Unicode/section/page coverage; empty/encrypted/scanned PDFs; extraction deadline.
- [ ] Implement strict admission and atomic artifacts, isolated PDF extraction, bounded deterministic section-aware chunks.
- [ ] Run focused tests green and commit.

### Task 3: Bounded embeddings and vector store

**Files:** `backend/indexing/{embedding,store}.py`, `backend/tests/test_embedding_store.py`.
**Interfaces:** `OllamaEmbeddings(settings).profile()`, `.embed(texts, profile, query=False, deadline=None)`, `VectorStore(settings)` with create/get/write/read/verify operations.
- [ ] RED: batch/document/query policies, malformed and nonfinite vectors, changed digest, disabled truncation, transient-only retry, write retry idempotence.
- [ ] Implement explicit embeddings and digest checks, bounded HTTP retries, real Chroma adapters without implicit model downloads.
- [ ] Run focused tests green against real temporary Chroma and local HTTP fixtures; commit.

### Task 4: Build, verify, publish, recovery and reader

**Files:** `backend/indexing/service.py`, `backend/tests/test_service.py`, `backend/tests/helpers.py`.
**Interfaces:** `IndexingService(settings, embedder=None, store=None)` exposing validate/build/status/verify/publish/recover/rollback/read; all operations return dictionaries or typed errors.
- [ ] RED first vertical slice: a ready build is invisible until explicit publication; embedding failure leaves the old published document readable.
- [ ] Add one RED/GREEN cycle per remaining behavior: noop/cache, readback tampering, retirement, process lock, CAS, operation IDs, interruption, drift, rollback, process restart.
- [ ] Implement writer coordination and immutable snapshots with reports/cache; never write published collections.
- [ ] Run full Python suite green and commit.

### Task 5: CLI and application integration

**Files:** `backend/indexing/cli.py`, `backend/ingest_tansam.py`, `backend/services/rag.py`, `backend/routes/chat.py`, `backend/tests/test_cli_chat.py`.
- [ ] RED: CLI JSON and exit codes; no implicit publication; successful reader sees a new active revision without restart; unavailable knowledge yields 503 and no generation call.
- [ ] Implement thin safe entrypoint and minimal published-reader integration; retain existing chat stream format and prompt policy.
- [ ] Run CLI/Flask tests and all existing tests green; commit.

### Task 6: Migration, backup and restore

**Files:** `backend/indexing/operations.py`, CLI subcommands, `backend/tests/test_operations.py`, approved source manifest.
- [ ] RED: read-only legacy inventory/copy preserves original store and labels missing historical identity; backup restores a verified publication to a different temporary data root.
- [ ] Implement explicit migration and consistent backup/restore under the writer lock; no automatic startup migration.
- [ ] Run migration/restore checks and full Python suite green; commit.

### Task 7: Deployment, integration and final review

**Files:** backend Docker/Compose configuration, pinned requirements, `.github/workflows`, operator runbook, integration tests.
- [ ] Test explicit production configuration and Compose wiring; run real Chroma HTTP + Ollama integration in isolated storage, including restart and rollback.
- [ ] Run `python -m unittest discover -s backend/tests -v`, `npm test`, scoped static/compile checks, build, whitespace checks; record inherited warnings.
- [ ] Obtain a fresh whole-change review under requesting-code-review; reproduce and fix important findings through RED/GREEN tests.
- [ ] Commit completed implementation and record local versus Linux/VPS acceptance evidence without claiming unperformed deployment.

# TANSY indexing operations

Target: one persistent Linux VPS, private Chroma and Ollama, Python 3.11. The indexing implementation is separate from production deployment acceptance. Retrieval ranking, answer-policy improvements and a knowledge administration UI are later work.

## Storage and configuration

Install with `python -m pip install --require-hashes -r backend/requirements.lock`. Set `TANSY_DATA_ROOT` to an absolute persistent local filesystem directory. Do not use NFS, shared hosting filesystems or multiple VPS writers. SQLite WAL/FULL and the root-wide file lock coordinate CLI processes on this VPS. Each API lookup reads the active catalog pointer anew; API restart is unnecessary after publication.

Production additionally requires `TANSY_ENV=production`, `TANSY_CHROMA_MODE=http`, `TANSY_CHROMA_URL` and `TANSY_OLLAMA_URL`. The chat model endpoint can be independently set through `TANSY_CHAT_OLLAMA_URL`. Optional bearer headers are `TANSY_CHROMA_TOKEN` and `TANSY_OLLAMA_TOKEN`; configuring a token here does not install server authentication. Chroma must stay private. Development/test embedded storage is rooted at `backend/index_data` by default; the original `backend/chroma_db` is only a migration source.

The catalog contains sources, chunk provenance, cache checksums, model digest, parser/chunker policy, build jobs, publication generations and audit operation IDs. Collections are complete immutable snapshots. No automatic deletion or GC is provided. Monitor disk space and retain all published/rollback versions until a reviewed offline retention procedure is introduced. Keep the runtime data directories out of Git and the frontend bundle.

## Update approved knowledge

No backend code changes are needed for supported TXT, Markdown and extractable PDF updates. The current approved source is `backend/knowledge_manifest.json`; its SHA-256 is bound to the existing approved TANSAM document. Do not regenerate a hash until the owner has approved the corresponding content.

1. Put the complete desired source set in an operator directory. Each entry needs a stable `source_id`, display `name`, path relative to its manifest (absolute paths also supported), `format`, SHA-256, `approved_by`, and timezone-aware `approved_at`. Keep one owner. Include explicit `retirements: [{"source_id": "old-id", "reason": "approved reason"}]` for sources being removed. Omissions are rejected.
2. `python backend/ingest_tansam.py validate --manifest /approved/manifest.json`
3. `python backend/ingest_tansam.py status --kb tansam` and record the active generation.
4. `python backend/ingest_tansam.py build --manifest /approved/manifest.json`. Save its JSON `revision` and job ID. Build does not publish; failed/interrupted staging does not change active answers.
5. `python backend/ingest_tansam.py verify --revision REVISION`. Review the report in `TANSY_DATA_ROOT/reports/REVISION.json`, source set and representative retrieved excerpts. The report verifies storage/profile integrity; it does not certify answer quality.
6. `python backend/ingest_tansam.py publish --kb tansam --revision REVISION --expected-generation GENERATION --operation-id UNIQUE-ID --actor OPERATOR --reason "approved update"`
7. Test current email/address/hours and representative lab/internship questions. A stale generation requires reviewing/rebuilding against the now-current source set. Do not override it.

Commands output one JSON result on stdout and structured progress on stderr. Exit 0 means success, 2 means invalid input/failed precondition, 3 means busy or publication conflict, and 1 means an unexpected dependency/internal failure. Inspect `status --job-id JOB` after failures. Reuse the exact same publication arguments and operation ID after a lost response: its recorded result is returned even if the model is subsequently unavailable. Reusing an ID with changed arguments is rejected.

The archive stores the exact approved bytes before parsing. Limits default to 100 sources, 10 MiB per file, 100 MiB per build, 200 PDF pages, one million characters per source, 20,000 chunks and a 30-minute build budget. PDFs run in a separate process with a 60-second extraction limit. Encrypted, empty, scanned-only and oversized sources fail explicitly. No OCR or URL crawler is included.

Document bodies use 1,000-character chunks with 150-character overlap within sections; headings/page/source/approval information is retained. Batches are 16 with one embedding request at a time and three attempts for transient failures. New Nomic profiles use `search_document: ` / `search_query: `, explicit `/api/embed` with truncation disabled and L2 normalization. Model identity is rechecked before embedding and publication. Pulling a changed tag requires a new build; rollback requires its original digest to be available. Preserve model artifacts or the ability to restore the exact original digest. Do not overwrite tags while serving a build.

## Interruption and rollback

After confirming the previous worker is dead, run `python backend/ingest_tansam.py recover --kb tansam`. It acquires the OS lock and marks abandoned running jobs interrupted. It does not resume uncertain writes. Start a new build; verified cache entries can be reused. Staging collections and previous published revisions remain retained.

Use `rollback --kb tansam --revision PREVIOUS --expected-generation CURRENT --operation-id UNIQUE-ID --actor OPERATOR --reason "incident reason"`. Only a previously published, still-verifiable revision is eligible. Rollback creates another catalog generation. Never edit the active table manually or rename collection directories. Missing catalog, unavailable collection or model drift returns HTTP 503 from chat before generation.

## Legacy cutover

The existing store is not modified or migrated on application startup. Upgrading the reader without a published catalog deliberately makes chat unavailable until cutover; plan a maintenance window or validate the new deployment alongside the existing one before switching traffic.

1. Take an independent offline backup of the legacy directory and approved knowledge file. Stop every legacy ingestion/writer process and confirm they are stopped. Record the source manifest's approval/hash and review legacy data for unsupported facts.
2. `inventory-legacy --legacy-dir /legacy/chroma_db` reads SQLite in read-only mode and lists collections. Only the reviewed `documents` collection with the approved owner/source names is accepted by migration; unexpected scopes require operator review.
3. Create an approved checks JSON file, e.g. `[{"question":"What is the HR email?","contains":"hr@tansam.org"}]`, including address, opening hours and representative programs. A match confirms retrieval compatibility for those checks, not every historical claim.
4. With a fresh target KB: `migrate-legacy --legacy-dir /legacy/chroma_db --manifest /approved/manifest.json --checks /approved/checks.json --quiesced`. The flag is an operator attestation that writers are stopped. A disposable SQLite/HNSW copy is exported in another process; original files/vectors stay untouched. The copied baseline truthfully records `historical_digest: unknown`, the current digest observed for compatibility checks, old `/api/embeddings`, no prefixes and unchanged stored vectors. It never fabricates historical model identity or silently re-embeds the baseline.
5. Verify and explicitly publish that baseline at generation 0 if its content and checks pass. Build the approved source again to produce a fresh fully profiled version, verify it, publish at generation 1, and exercise rollback while the original query model remains available. Keep the legacy directory and its backup until cutover acceptance.

A fresh approved build may be used instead of the legacy baseline when legacy answers cannot be trusted; it provides no rollback into the old catalog. Do not claim unknown legacy provenance has become known by copying it.

## Backup and disaster recovery

`backup --destination /backups/UNIQUE-NEW-DIRECTORY` acquires the same root-wide writer lock and uses the SQLite backup API. It includes approved archives, reports, complete record provenance and checksum-protected embeddings. `backup.json` is written last and hashes every included file. Backups are portable; they rebuild collections from catalog records/cache rather than copying live Chroma SQLite/HNSW files. Copy completed backups to access-controlled storage outside the VPS and test restore regularly. A directory on the same VPS alone is not disaster recovery.

For restore: stop API and all workers, use a **fresh** data root and preferably an isolated new Chroma instance, keep the exact embedding model digest available, and run `restore --backup /backups/COMPLETED --offline`. The offline flag is a required operator attestation. All checksums/paths, vectors and ready revisions are verified. Every attempt creates fresh collection names and updates only its disposable staged catalog, preserving revision IDs and audit history. Existing collections are never overwritten. The catalog and active pointer are installed only after verification. A failed restore can leave unpublished collections in its isolated target; retry against that same isolated target after resolving the cause, or use another empty target. Run `verify`, inspect `status`, query representative questions, restart the API and repeat. Only switch traffic after acceptance. No automatic restore or deployment restart is performed.

## Compose deployment

### Local activation on Windows / Docker Desktop

The local override uses the already installed Windows Ollama at `host.docker.internal:11434`; it does not download or replace models. Start Docker Desktop's Linux engine and local Ollama with `nomic-embed-text:latest` and `llama3.2:latest` available. From the repository root:

```
docker compose -f backend/compose.yaml -f backend/compose.local.yaml --project-name tansy-local up -d --build api
docker compose -f backend/compose.yaml -f backend/compose.local.yaml --project-name tansy-local run --rm indexer status --kb tansam
```

The API is at `http://127.0.0.1:5001`; run `npm run dev` for the website at `http://localhost:5173`. The `tansy-local_catalog` and `tansy-local_vectors` Docker volumes persist catalog and vectors across container restart. Chroma has no published host port. These volumes are independent of `backend/chroma_db`; never use `docker compose down --volumes` against the activated local project unless its data is explicitly being retired and backed up.

On a new machine, follow validate/build/verify/publish above through `run --rm indexer`; `up` alone deliberately does not publish knowledge. On this machine the approved source was published on 2026-10-17, and the original 1,000-character chunk profile was restored after a hot-update/rollback test. Subsequent owner-approved corrections are published as new revisions. Use `status` to read the current generation rather than copying an old publication command.

For updates without rebuilding the backend, copy the approved `backend/tansam_knowledge.txt` and its updated `backend/knowledge_manifest.json` into the ignored `backend/knowledge/` directory, then validate/build using `--manifest /knowledge/knowledge_manifest.json`. Verify and explicitly publish the returned revision at the current generation. The `/app/knowledge_manifest.json` file is an image-build snapshot intended for initial setup; it does not automatically follow later host-file corrections. The 2026-10-17 inauguration/relocation correction was activated through the mounted `/knowledge` path without restarting the API.

Repeat the opt-in real-answer probe with a Python environment containing `requests`:

```
python backend/tests/check_local_chatbot.py --output backend/index_data/local-chat-check.json
```

This probe only targets a loopback API. It records actual streamed answers, source metadata, timings and pattern checks for approved-fact/unknown-information cases. Results need human review; passing patterns do not guarantee factual correctness. The first local run passed 10/11 cases; inauguration-venue and relocation-year coverage was subsequently expanded for the owner's correction. The consultation-versus-office-hours answer was insufficiently grounded even though retrieval included both approved statements; retain this finding for the retrieval/answer-quality stage. Do not change the approved source or weaken that check to conceal it. Scanned documents, new retrieval ranking and an admin UI remain outside this activation.

Local evidence is under ignored `backend/index_data/local-activation-2026-10-17/`. Backups before publication and after activation are under ignored `backend/backups/`. Knowledge, runtime databases, logs and local backups are not source changes to commit. The local override, stream-reader fix/tests and documentation remain uncommitted pending owner approval.

### VPS deployment

From `backend/`, copy `deploy.env.example` to a private operator configuration, create the knowledge/backup bind directories and grant UID 10001 access (e.g. on Linux `install -d -o 10001 -g 10001 knowledge backups`). Review CPU/RAM/disk allocations for the actual VPS. The supplied values are bounds to validate, not measured sizing guarantees. Container images and Python dependencies are pinned; upgrades need compatibility tests.

```
docker compose --env-file /secure/tansy.env --profile local-llm up -d --build
docker compose --profile local-llm exec ollama ollama pull nomic-embed-text:latest
docker compose --profile local-llm exec ollama ollama pull llama3.2:latest
docker compose --env-file /secure/tansy.env run --rm indexer validate --manifest /app/knowledge_manifest.json
docker compose --env-file /secure/tansy.env run --rm indexer build --manifest /app/knowledge_manifest.json
```

Then use `run --rm indexer verify/publish/status/backup/...` with the arguments above. External additions can be mounted in `/knowledge`; persist the complete manifest/source set there. The indexer and API share only their catalog volume and private services. The indexer is an explicit operations command, with no public administration endpoint. Ollama may be separately hosted through private endpoints instead of the optional `local-llm` profile. Chroma and Ollama have no published ports; the API is bound to VPS loopback `127.0.0.1:5001`. Terminate HTTPS at the organization's reverse proxy, disable response buffering for chat streams and keep internal ports blocked at the VPS firewall. The basic API container health probe checks HTTP availability; a successful probe does not certify a published KB. Use `status` and `verify` for knowledge readiness.

The bounded Chroma adapter speaks the pinned v2 protocol because the 1.5.9 Python SDK uses unbounded HTTP timeouts. The shared HTTP transport uses httpcore's network-backend interface to check a monotonic deadline on socket operations, including headers and body reads; retries share the same budget. HTTPS certificate validation is enabled, with an optional private CA bundle through `REQUESTS_CA_BUNDLE`. Service connections are direct and ignore ambient HTTP proxy variables. The matching Rust image reports protocol `1.0.0`, distinct from Python package `1.5.9`; real-server tests exercise create/upsert/read/query/count. Do not change the server image independently of compatibility verification.

## Acceptance still required on the actual VPS

- Confirm Hostinger plan, persistent filesystem, available CPU/RAM/disk, Ollama model memory/latency, backups outside the VPS, DNS/TLS and firewall/private reachability.
- Run the Windows/Linux suite and isolated HTTP integration. Opt in with `TANSY_TEST_CHROMA_URL` pointing **only to a disposable server**; add `TANSY_TEST_OLLAMA_URL` for live model tests. CI tests deterministic protocol fixtures and a real pinned Chroma container; it does not automatically download an LLM or certify production.
- Validate approved content, migration compatibility, failed builds, process death, publication retries, hot update, model drift, rollback and restore after container/VPS restart.
- Measure concurrent chat plus indexing, memory pressure and storage growth; adjust limits before exposing traffic. Review the existing public chat API's rate limits, request validation, CORS and answer grounding in the subsequent production/retrieval work.

No Hostinger deployment, production traffic switch, admin UI or final retrieval-quality acceptance is claimed by this implementation.

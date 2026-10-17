# Graph Report - TANSAM_4.0  (2026-10-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 950 nodes · 2202 edges · 63 communities (41 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d0db0e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Owl Carousel Plugin
- react
- chat.py
- dependencies
- SkillingPage.jsx
- LabDetailsPage.jsx
- TANSAM Home Page
- package.json
- test1.js
- imageprocesstansam.js
- 3test.js
- Settings
- run_mock.js
- Minified Carousel & WOW Scripts
- WOW.js Scroll Animation Library
- test2.js
- testfinal.js
- imageProcessor.js
- final.js
- VectorStore
- cam.js
- Sensor Snapshot Log (output_data_a9be6cb5)
- .oxlintrc.json
- e
- 404.html (iSTUDIO template)
- iSTUDIO Projects Template Page
- TANSAM App Setup Instructions
- team.html (iSTUDIO Team Page)
- SIL Open Font License 1.1 (OFL.txt)
- test-tail.html (Tailwind Test Page)
- Backend Python Dependencies
- README (React + Vite)
- service.py
- Catalog
- transport.py
- App.jsx
- json
- embedding.py
- TANSY production indexing design
- app.js
- TANSAM/package.json
- TrainingTable.jsx
- ChatWidget.jsx
- IndexingError
- Review Focus
- HomePage.jsx
- react-router-dom
- imageAnalyzer.js
- legacy_worker.py
- .__enter__
- SDD ledger — plan: docs/superpowers/plans/2026-10-16-tansy-production-indexing.md
- scripts

## God Nodes (most connected - your core abstractions)
1. `Settings` - 58 edges
2. `IndexingError` - 57 edges
3. `Owl()` - 53 edges
4. `IndexingService` - 41 edges
5. `EmbeddingServer` - 36 edges
6. `react` - 31 edges
7. `manifest()` - 30 edges
8. `Catalog` - 26 edges
9. `VectorStore` - 25 edges
10. `isolated_root()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `index.html (TANSAM 4.0)` --references--> `TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)`  [INFERRED]
  index.html → _old_archive/Aboutus.html
- `TANSAM App Setup Instructions` --conceptually_related_to--> `Sensor Output Data (Moisture/Distance/Sack Height)`  [AMBIGUOUS]
  _old_archive/TANSAM/readme.txt → graphify-out/converted/output_data_a9be6cb5.md
- `Features Page (iSTUDIO Template)` --semantically_similar_to--> `TANSAM Home Page`  [AMBIGUOUS] [semantically similar]
  _old_archive/feature.html → _old_archive/index.html
- `Corporate Skilling Page` --conceptually_related_to--> `TANSAM Knowledge Base`  [INFERRED]
  _old_archive/skillingsection.html/corporate.html → backend/tansam_knowledge.txt
- `Operations` --uses--> `IndexingError`  [INFERRED]
  backend/indexing/operations.py → backend/indexing/errors.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **iSTUDIO Template Pages** — _old_archive_project, _old_archive_service [EXTRACTED 0.85]
- **Sensor Snapshot Record Schema** — graphify_out_converted_output_data_a9be6cb5_timestamp, graphify_out_converted_output_data_a9be6cb5_percentage, graphify_out_converted_output_data_a9be6cb5_distance_15cm, graphify_out_converted_output_data_a9be6cb5_distance_85cm, graphify_out_converted_output_data_a9be6cb5_rgb_color, graphify_out_converted_output_data_a9be6cb5_snapshot_event [EXTRACTED 0.90]
- **TANSAM Innovation Labs** — _old_archive_productinnovation_center, _old_archive_predictiveengineering_lab, _old_archive_smartfactory_center, _old_archive_productivelifecyclemangement_plm [EXTRACTED 0.90]
- **TANSAM Site Navigation Structure** — _old_archive_index, _old_archive_board, _old_archive_contact, _old_archive_assestperformance [EXTRACTED 0.90]
- **TANSAM legacy static site pages** — _old_archive_aboutus, _old_archive_digital_technology, _old_archive_gcc, _old_archive_skillinghead, _old_archive_research_projecthead, _old_archive_arvrxr, _old_archive_disclaimer, _old_archive_terms_use, _old_archive_learnmore [EXTRACTED 0.90]
- **TANSAM Innovation Labs** — _old_archive_assestperformance, _old_archive_industrial_iot, _old_archive_innovation, _old_archive_predictiveengineering, _old_archive_index [EXTRACTED 0.95]
- **TANSAM Research & Projects Gallery Pages** — _old_archive_research_projects_research_1, _old_archive_research_projects_research_2, _old_archive_research_projects_research_3, _old_archive_research_projects_research_4, _old_archive_research_projects_research_5 [EXTRACTED 0.95]
- **TANSAM Skilling Section Pages** — _old_archive_skillingsection_html_nanmudhalvan, _old_archive_skillingsection_html_academia, _old_archive_skillingsection_html_corporate [EXTRACTED 0.95]
- **TANSAM Industry 4.0 Ecosystem** — _old_archive_skillingsection_html_corporate_corporate_page, backend_tansam_knowledge_knowledge_base, backend_tansam_knowledge_nine_innovation_labs, _old_archive_index_internship_program [INFERRED 0.70]
- **TANSAM organization and program concepts** — concept_tansam, concept_siemens_partnership, concept_industry_4_0, concept_innovation_labs, concept_gcc, concept_skilling [INFERRED 0.80]

## Communities (63 total, 22 thin omitted)

### Community 0 - "Owl Carousel Plugin"
Cohesion: 0.06
Nodes (3): Owl(), prefixed(), test()

### Community 1 - "react"
Cohesion: 0.15
Nodes (17): framer-motion, react, AnimatedSection(), ContactSection(), LabsGrid(), NewsAndEvents(), newsItems, projectsData (+9 more)

### Community 2 - "chat.py"
Cohesion: 0.11
Nodes (11): add_cors_headers(), preflight_handler(), list_models(), public_chat(), generate(), get_installed_models(), ollama_chat_stream(), format_rag_context() (+3 more)

### Community 3 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, bluetooth-serial-port, exceljs, express, fluent-ffmpeg, get-image-colors, install, jimp (+7 more)

### Community 4 - "SkillingPage.jsx"
Cohesion: 0.18
Nodes (26): lucide-react, FaqAccordion(), Chevron(), icons, PathwayCards(), ContentGrid(), EnquiryPanel(), SectionHeading() (+18 more)

### Community 5 - "LabDetailsPage.jsx"
Cohesion: 0.14
Nodes (30): @react-three/drei, @react-three/fiber, three, DataPipe(), HeroSection(), Benefit3D(), Document3D(), MiniModelWrapper() (+22 more)

### Community 6 - "TANSAM Home Page"
Cohesion: 0.07
Nodes (45): arvrxr.html (AR/VR/XR Lab), Asset Performance Page, Research Centre for Asset Performance, Board of Directors Page, Contact Page, Features Page (iSTUDIO Template), Gcc.html (Global Career Connect), TANSAM Home Page (+37 more)

### Community 7 - "package.json"
Cohesion: 0.06
Nodes (31): dependencies, framer-motion, lucide-react, react, react-dom, react-icons, react-router-dom, @react-three/drei (+23 more)

### Community 8 - "test1.js"
Cohesion: 0.12
Nodes (15): axios, bluetooth, constantRGB_A, constantRGB_B, constantRGB_C, ExcelJS, fs, identifyRGB() (+7 more)

### Community 9 - "imageprocesstansam.js"
Cohesion: 0.12
Nodes (16): analyzeTexture(), assessTeaLeafQuality(), axios, bluetooth, estimateLeafDensity(), ExcelJS, fs, imagePath (+8 more)

### Community 10 - "3test.js"
Cohesion: 0.15
Nodes (16): axios, bluetooth, determineTeaLeafQuality(), ExcelJS, extractFeature1(), extractFeature2(), extractFeature3(), fs (+8 more)

### Community 11 - "Settings"
Cohesion: 0.08
Nodes (15): Operations, IndexingService, Settings, EmbeddingServer, isolated_root(), manifest(), CLITests, DocumentTests (+7 more)

### Community 12 - "run_mock.js"
Cohesion: 0.17
Nodes (9): ExcelJS, fs, Jimp, MockBluetoothSerialPort, MockImageReceiver, path, pipeStream(), serial (+1 more)

### Community 13 - "Minified Carousel & WOW Scripts"
Cohesion: 0.20
Nodes (7): e(), f(), a(), c(), d(), e(), g()

### Community 14 - "WOW.js Scroll Animation Library"
Cohesion: 0.20
Nodes (6): _classCallCheck(), createEvent(), extend(), MutationObserver(), WeakMap(), WOW()

### Community 15 - "test2.js"
Cohesion: 0.18
Nodes (10): axios, bluetooth, ExcelJS, fs, ImageReceiver, Jimp, path, pipeStream() (+2 more)

### Community 16 - "testfinal.js"
Cohesion: 0.16
Nodes (9): axios, bluetooth, ExcelJS, fs, ImageReceiver, Jimp, path, saveImage() (+1 more)

### Community 17 - "imageProcessor.js"
Cohesion: 0.39
Nodes (8): determineTeaLeafQuality(), extractFeature1(), extractFeature2(), extractFeature3(), Jimp, meetsCriteriaA(), meetsCriteriaB(), processImage()

### Community 18 - "final.js"
Cohesion: 0.11
Nodes (16): bluetooth, ExcelJS, fs, ImageReceiver, serial, axios, bluetooth, ExcelJS (+8 more)

### Community 19 - "VectorStore"
Cohesion: 0.07
Nodes (8): HTTPChromaClient, perform(), HTTPCollection, VectorStore, do_GET(), do_POST(), send(), partial()

### Community 20 - "cam.js"
Cohesion: 0.20
Nodes (7): axios, fs, ImageReceiver, Jimp, path, pipeStream(), path

### Community 21 - "Sensor Snapshot Log (output_data_a9be6cb5)"
Cohesion: 0.29
Nodes (7): Distance Reading 15cm, Distance Reading 85cm, Percentage Reading (38%), RGB Color Reading (119,154,53), Sensor Snapshot Log (output_data_a9be6cb5), Snapshot Event Type, Timestamp Field

### Community 22 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 41 - "service.py"
Cohesion: 0.16
Nodes (10): canonical(), now(), atomic_write(), chunks_for_sources(), digest(), identifier(), load_manifest(), prepare_sources() (+2 more)

### Community 42 - "Catalog"
Cohesion: 0.10
Nodes (13): Catalog, CatalogTests, Acceptance still required on the actual VPS, Backup and disaster recovery, Compose deployment, Interruption and rollback, Legacy cutover, Local activation on Windows / Docker Desktop (+5 more)

### Community 43 - "transport.py"
Cohesion: 0.14
Nodes (6): perform(), budget(), DeadlineBackend, DeadlineStream, HTTPFailure, request_json()

### Community 44 - "App.jsx"
Cohesion: 0.16
Nodes (15): index.html (TANSAM 4.0), react-dom, AcademiaSkillingPage, App(), BoardDirectorsPage, ContactPage, CorporateSkillingPage, HomePage (+7 more)

### Community 45 - "json"
Cohesion: 0.17
Nodes (5): main(), Parser, main(), ask(), main()

### Community 46 - "embedding.py"
Cohesion: 0.20
Nodes (3): remaining(), retry(), transient()

### Community 47 - "TANSY production indexing design"
Cohesion: 0.12
Nodes (15): 12. Migration from the current index, 13. TDD boundaries and acceptance criteria, 14. Review status and next stage, 1. Outcome and scope, 2. Current evidence and migration baseline, 3. Design choices, 4. Runtime components, 5. Inputs and approval contract (+7 more)

### Community 48 - "app.js"
Cohesion: 0.14
Nodes (12): app, express, ffmpeg, fs, Jimp, path, rtsp, server (+4 more)

### Community 49 - "TANSAM/package.json"
Cohesion: 0.14
Nodes (13): author, description, keywords, license, main, name, version, get-image-colors (+5 more)

### Community 50 - "TrainingTable.jsx"
Cohesion: 0.23
Nodes (11): Digit(), formatter, ParticipationCounter(), RollingNumber(), number, totalNumber, TrainingTable(), facultyRecords (+3 more)

### Community 51 - "ChatWidget.jsx"
Cohesion: 0.22
Nodes (7): ChatWidget(), FLOATING_MESSAGES, renderFormattedMessage(), SUGGESTIONS, CHAT_UNAVAILABLE_MESSAGE, readChatResponse(), reader()

### Community 53 - "Review Focus"
Cohesion: 0.18
Nodes (10): Global Constraints, Review Focus, TANSY Production Indexing Implementation Plan, Task 1: Explicit settings and durable catalog, Task 2: Approved immutable sources and deterministic chunks, Task 3: Bounded embeddings and vector store, Task 4: Build, verify, publish, recovery and reader, Task 5: CLI and application integration (+2 more)

### Community 54 - "HomePage.jsx"
Cohesion: 0.31
Nodes (7): AboutSection(), DottedSphere(), ClientsSection(), defaultAcademicClients, defaultIndustryClients, ServicesSummary(), HomePage()

### Community 55 - "react-router-dom"
Cohesion: 0.36
Nodes (7): react-icons, react-router-dom, Footer(), NavDropdown(), ABOUT_LINKS, CAPABILITIES_LINKS, MainLayout()

### Community 56 - "imageAnalyzer.js"
Cohesion: 0.33
Nodes (7): analyzeTexture(), assessTeaLeafQuality(), estimateLeafDensity(), interpretQualityScore(), loadImageAndExtractRGB(), sharp, sharp

### Community 58 - ".__enter__"
Cohesion: 0.60
Nodes (3): do_GET(), do_POST(), send()

### Community 59 - "SDD ledger — plan: docs/superpowers/plans/2026-10-16-tansy-production-indexing.md"
Cohesion: 0.50
Nodes (3): 2026-10-17: local activation and actual chatbot checks (uncommitted), 2026-10-17: owner-approved inauguration and relocation correction (uncommitted), SDD ledger — plan: docs/superpowers/plans/2026-10-16-tansy-production-indexing.md

### Community 60 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, start, test

## Ambiguous Edges - Review These
- `TANSAM App Setup Instructions` → `Sensor Output Data (Moisture/Distance/Sack Height)`  [AMBIGUOUS]
  _old_archive/TANSAM/readme.txt · relation: conceptually_related_to
- `Features Page (iSTUDIO Template)` → `TANSAM Home Page`  [AMBIGUOUS]
  _old_archive/feature.html · relation: semantically_similar_to

## Knowledge Gaps
- **198 isolated node(s):** `newsItems`, `projectsData`, `technologies`, `VIDEO_IDS`, `axios` (+193 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 342 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `TANSAM App Setup Instructions` and `Sensor Output Data (Moisture/Distance/Sack Height)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `IndexingError` connect `IndexingError` to `service.py`, `Catalog`, `Settings`, `transport.py`, `json`, `embedding.py`, `VectorStore`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `Settings` (e.g. with `main()` and `main()`) actually correct?**
  _`Settings` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `newsItems`, `projectsData`, `technologies` to the rest of the system?**
  _198 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Owl Carousel Plugin` be split into smaller, more focused modules?**
  _Cohesion score 0.0636193531141406 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `Features Page (iSTUDIO Template)` and `TANSAM Home Page`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)` connect `TANSAM Home Page` to `App.jsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
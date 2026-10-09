# Graph Report - TANSAM_4.0  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 593 nodes · 1072 edges · 39 communities (21 shown, 18 thin omitted)
- Extraction: 96% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.84)
- Token cost: 1,259 input · 386 output

## Graph Freshness
- Built from commit: `0076a9b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Owl Carousel Plugin
- React Frontend App
- Flask Backend API
- RTSP Video Streaming Server
- 3D Hero Section Components
- TANSAM Website Pages
- Frontend Package Dependencies
- Tea Leaf Image Analysis
- Tea Leaf Quality Processing
- Tea Leaf Quality Test Script
- RGB Image Comparison Test
- TANSAM Static HTML Pages
- Image Receiver Test Script
- Minified Carousel & WOW Scripts
- WOW.js Scroll Animation Library
- Image Brightness Test Script
- Final Image Receiver Script
- Camera Image Capture Script
- Bluetooth Serial Image Receiver
- Sensor Reading Data Logs
- Oxlint Linter Configuration
- Waypoints Scroll Library
- Archived iSTUDIO Template Files
- iSTUDIO Template Pages
- App Setup & Sensor Data Docs
- iSTUDIO Team & Testimonial Pages
- Nunito Sans Font License
- Tailwind Test Page
- Backend Python Dependencies
- React Vite README

## God Nodes (most connected - your core abstractions)
1. `Owl()` - 53 edges
2. `react` - 25 edges
3. `framer-motion` - 16 edges
4. `TANSAM Home Page` - 16 edges
5. `AnimatedSection()` - 11 edges
6. `Rotating3DIcon()` - 11 edges
7. `jimp` - 11 edges
8. `App()` - 10 edges
9. `path` - 10 edges
10. `TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `index.html (TANSAM 4.0)` --references--> `TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)`  [INFERRED]
  index.html → _old_archive/Aboutus.html
- `TANSAM App Setup Instructions` --conceptually_related_to--> `Sensor Output Data (Moisture/Distance/Sack Height)`  [AMBIGUOUS]
  _old_archive/TANSAM/readme.txt → graphify-out/converted/output_data_a9be6cb5.md
- `Features Page (iSTUDIO Template)` --semantically_similar_to--> `TANSAM Home Page`  [AMBIGUOUS] [semantically similar]
  _old_archive/feature.html → _old_archive/index.html
- `Corporate Skilling Page` --conceptually_related_to--> `TANSAM Knowledge Base`  [INFERRED]
  _old_archive/skillingsection.html/corporate.html → backend/tansam_knowledge.txt
- `iSTUDIO Projects Template Page` --semantically_similar_to--> `iSTUDIO Services Template Page`  [INFERRED] [semantically similar]
  _old_archive/project.html → _old_archive/service.html

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

## Communities (39 total, 18 thin omitted)

### Community 0 - "Owl Carousel Plugin"
Cohesion: 0.06
Nodes (3): Owl(), prefixed(), test()

### Community 1 - "React Frontend App"
Cohesion: 0.08
Nodes (39): index.html (TANSAM 4.0), framer-motion, lucide-react, react, react-dom, react-icons, react-router-dom, App() (+31 more)

### Community 2 - "Flask Backend API"
Cohesion: 0.06
Nodes (18): add_cors_headers(), preflight_handler(), main(), list_models(), public_chat(), generate(), get_installed_models(), ollama_chat_stream() (+10 more)

### Community 3 - "RTSP Video Streaming Server"
Cohesion: 0.05
Nodes (43): app, express, ffmpeg, fs, Jimp, path, rtsp, server (+35 more)

### Community 4 - "3D Hero Section Components"
Cohesion: 0.13
Nodes (33): @react-three/drei, @react-three/fiber, three, AboutSection(), DottedSphere(), DataPipe(), HeroSection(), Benefit3D() (+25 more)

### Community 5 - "TANSAM Website Pages"
Cohesion: 0.11
Nodes (37): Asset Performance Page, Research Centre for Asset Performance, Board of Directors Page, Contact Page, Features Page (iSTUDIO Template), TANSAM Home Page, TANSAM Internship Program, Industrial IoT & Equipment Page (+29 more)

### Community 6 - "Frontend Package Dependencies"
Cohesion: 0.06
Nodes (30): dependencies, framer-motion, lucide-react, react, react-dom, react-icons, react-router-dom, @react-three/drei (+22 more)

### Community 7 - "Tea Leaf Image Analysis"
Cohesion: 0.09
Nodes (23): analyzeTexture(), assessTeaLeafQuality(), estimateLeafDensity(), interpretQualityScore(), loadImageAndExtractRGB(), sharp, analyzeTexture(), assessTeaLeafQuality() (+15 more)

### Community 8 - "Tea Leaf Quality Processing"
Cohesion: 0.12
Nodes (17): determineTeaLeafQuality(), extractFeature1(), extractFeature2(), extractFeature3(), Jimp, meetsCriteriaA(), meetsCriteriaB(), processImage() (+9 more)

### Community 9 - "Tea Leaf Quality Test Script"
Cohesion: 0.15
Nodes (16): axios, bluetooth, determineTeaLeafQuality(), ExcelJS, extractFeature1(), extractFeature2(), extractFeature3(), fs (+8 more)

### Community 10 - "RGB Image Comparison Test"
Cohesion: 0.12
Nodes (15): axios, bluetooth, constantRGB_A, constantRGB_B, constantRGB_C, ExcelJS, fs, identifyRGB() (+7 more)

### Community 11 - "TANSAM Static HTML Pages"
Cohesion: 0.16
Nodes (8): arvrxr.html (AR/VR/XR Lab), Gcc.html (Global Career Connect), Global Career Connect (GCC), Industry 4.0 / Digital Transformation, TANSAM Innovation Labs, Siemens–TIDCO Partnership, TANSAM Skilling Program, TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)

### Community 12 - "Image Receiver Test Script"
Cohesion: 0.16
Nodes (11): axios, bluetooth, ExcelJS, fs, ImageReceiver, Jimp, path, pipeStream() (+3 more)

### Community 13 - "Minified Carousel & WOW Scripts"
Cohesion: 0.20
Nodes (7): e(), f(), a(), c(), d(), e(), g()

### Community 14 - "WOW.js Scroll Animation Library"
Cohesion: 0.20
Nodes (6): _classCallCheck(), createEvent(), extend(), MutationObserver(), WeakMap(), WOW()

### Community 15 - "Image Brightness Test Script"
Cohesion: 0.16
Nodes (9): axios, bluetooth, ExcelJS, fs, ImageReceiver, Jimp, path, saveImage() (+1 more)

### Community 16 - "Final Image Receiver Script"
Cohesion: 0.18
Nodes (9): axios, bluetooth, ExcelJS, fs, ImageReceiver, Jimp, path, pipeStream() (+1 more)

### Community 17 - "Camera Image Capture Script"
Cohesion: 0.20
Nodes (7): axios, fs, ImageReceiver, Jimp, path, pipeStream(), path

### Community 18 - "Bluetooth Serial Image Receiver"
Cohesion: 0.25
Nodes (6): bluetooth, ExcelJS, fs, ImageReceiver, serial, exceljs

### Community 19 - "Sensor Reading Data Logs"
Cohesion: 0.29
Nodes (7): Distance Reading 15cm, Distance Reading 85cm, Percentage Reading (38%), RGB Color Reading (119,154,53), Sensor Snapshot Log (output_data_a9be6cb5), Snapshot Event Type, Timestamp Field

### Community 20 - "Oxlint Linter Configuration"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

## Ambiguous Edges - Review These
- `TANSAM App Setup Instructions` → `Sensor Output Data (Moisture/Distance/Sack Height)`  [AMBIGUOUS]
  _old_archive/TANSAM/readme.txt · relation: conceptually_related_to
- `Features Page (iSTUDIO Template)` → `TANSAM Home Page`  [AMBIGUOUS]
  _old_archive/feature.html · relation: semantically_similar_to

## Knowledge Gaps
- **165 isolated node(s):** `FLOATING_MESSAGES`, `SUGGESTIONS`, `defaultAcademicClients`, `defaultIndustryClients`, `newsItems` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `TANSAM App Setup Instructions` and `Sensor Output Data (Moisture/Distance/Sack Height)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `TANSAM (Tamil Nadu Smart and Advanced Manufacturing Centre)` connect `TANSAM Static HTML Pages` to `React Frontend App`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `FLOATING_MESSAGES`, `SUGGESTIONS`, `defaultAcademicClients` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Owl Carousel Plugin` be split into smaller, more focused modules?**
  _Cohesion score 0.0636193531141406 - nodes in this community are weakly interconnected._
- **What is the exact relationship between `Features Page (iSTUDIO Template)` and `TANSAM Home Page`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `react` connect `React Frontend App` to `3D Hero Section Components`, `Frontend Package Dependencies`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `React Frontend App` be split into smaller, more focused modules?**
  _Cohesion score 0.08022598870056497 - nodes in this community are weakly interconnected._
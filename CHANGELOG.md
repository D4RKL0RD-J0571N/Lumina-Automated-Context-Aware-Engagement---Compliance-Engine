# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [Unreleased]

## [1.3.5] - 2026-02-27

### **Security & Compliance (Smart Suggestions)**
- **Proactive Domain Recommendations**: The Guardrail Engine now detects interest in other managed domains and proactively suggests switching (e.g., "Interested in fishing? Switch to fishing.com").
- **Precision Matching**: Lowered sensitivity threshold for primary domain keywords (e.g., 'fishing', 'repair'). A single mention of a primary keyword for a cross-domain now triggers a helpful recommendation instead of letting the prompt reach the wrong persona.

## [1.3.4] - 2026-02-27

### **UI & Presentation (Alive Prototype)**
- **Engine Pulse (Edge Jitter)**: Added a deterministic jitter algorithm to the Supabase Edge Function to simulate real-time metrics fluctuation.
- **Session-Responsive Metrics**: The dashboard now merges the mock baseline with actual user session violations (stored in `localStorage`), making it react to user interactions instantly.
- **Simulation Transparency**: Renamed the shield badge to "Enterprise Simulation Active" for branding clarity.

## [1.3.3] - 2026-02-27

### **Security & Compliance (SSE Sentinel Hardening)**
- **Deterministic Rejection Delivery**: Added `is_final: true` to the Edge Function's guardrail rejection payload, ensuring rejections are never "swallowed" by the streaming parser.
- **Parser Defense-in-Depth**: Hardened the frontend `orchestrateStream` parser to recognize `classification` events as final even if metadata is missing.
- **Edge Deployment**: Successfully redeployed the hardened Sentinel logic (Regex-based scanning + Forbidden General Topics) to Supabase.

## [1.3.2] - 2026-02-27

### **UI & Presentation (Premium Polish)**
- **Rich Markdown Support**: Integrated `ReactMarkdown` with `remark-gfm` for professional, structured AI responses.
- **Premium Typography**: Added `.markdown-content` design system with glassmorphic code blocks, accented list markers, and improved readability.

### **Security & Compliance (Regex Sentinel)**
- **Whole-Word Matching**: Upgraded both Python and TypeScript scanners to use Regex word boundaries (`\b... \b`). This prevents false positives and ensures deterministic blocking of topics like 'cars' without catching partial overlaps.
- **Zero-Echo Hardening**: Improved reliability of pre-scan rejection for out-of-scope general knowledge queries.

## [1.3.1] - 2026-02-27

### **Security & Compliance (Sentinel Hardening II)**
- **Optimized Zero-Echo**: Added deterministic blocking for General Knowledge topics (Automotive, Space, Sports) to ensure strict domain alignment.
- **Edge Sync**: Corrected `index.ts` to use the same layered system prompt (L1/L2) as the Python backend.
- **Improved Scanners**: Expanded lexicons for better out-of-scope detection across both deployment environments.

## [1.3.0] - 2026-02-27

### **Security & Compliance (Phase 7: Sentinel Hardening)**
- **Zero-Echo Enforcement**: Implemented deterministic input pre-scanning to block violating or out-of-scope prompts *before* reaching the LLM.
- **Out-of-Scope Detection**: Added cross-domain signature detection using `DOMAIN_SIGNATURES` to enforce strict context boundaries.
- **Architectural Parity**: Synchronized Guardrail Engine logic between FastAPI (Python) and Supabase Edge Functions (TypeScript).
- **Hardened L1 Prompts**: Updated universal system instructions to enforce deterministic character loyalty and "Context Lock" behavior.

### **Frontend & UX**
- **Premium Chat UI**: Integrated "Secure Channel" watermarking and persistent "Context Locked" visual indicators.
- **Security Event Styling**: Standardized compliance overrides as professional security events with specific icons and red-alert states.
- **Improved Responsiveness**: Optimized the Chat Widget layout for better text legibility and structured metadata display.

### **Internal**
- Refactored `GuardrailEngine` into a class in TypeScript for better maintainability.
- Added parity Keywords from the CRM Human-in-the-Loop reference architecture.

### **CRITICAL FIX: Production 404 Resolved**
- **FIXED**: All API endpoints returning 404 in production due to URL path mismatch
- **Root Cause**: Frontend sent `/compliance/metrics` but Edge Function only matched `/api/v1/compliance/metrics`
- **Solution**: Added `normalizePath()` to strip both `/lumina-api` and `/api/v1` prefixes

### **API Changes**
- **Added**: `handleGuardrailScan` endpoint for direct compliance scanning
- **Improved**: Route matching now accepts both `/endpoint` and `/api/v1/endpoint` patterns
- **Improved**: Error handling with proper TypeScript error type casting

### **Frontend**
- **Fixed**: Font files (Inter, Playfair Display, JetBrains Mono) 404 in production via `assetsInclude`
- **Added**: API URL wiring integration test (`api.test.ts` — 11 test cases)

### **Documentation**
- **Updated**: DOCS-EN.md — Fixed architecture diagram, API reference table
- **Updated**: DOCS-ES.md — Synced Spanish docs with English changes
- **Rewritten**: DEPLOYMENT.md — Accurate Supabase Edge Functions architecture
- **Rewritten**: README.md — Proper project description replacing CLI install docs

### **Tests**
- Backend: 19/19 passing (pytest)
- Frontend: 3 files, 11/11 passing (vitest)

## [1.1.0] - 2026-02-26

### **MAJOR: Backend Migration Complete**
- **BREAKING**: Migrated from Flask to Supabase Edge Functions
- **NEW**: Full TypeScript implementation across stack
- **NEW**: Production-ready serverless architecture
- **FIXED**: Critical 404 errors on Vercel deployment

### **API Changes**
- **Added**: Supabase Edge Functions deployment
- **Added**: All Flask endpoints migrated to TypeScript
- **Added**: Proper CORS headers and error handling
- **Added**: Environment variable management via Supabase secrets
- **Removed**: Flask serverless configuration from Vercel

### **Frontend Changes**
- **Updated**: API service configuration for Supabase URLs
- **Updated**: Production environment variables
- **Updated**: Vercel deployment configuration
- **Fixed**: API endpoint routing issues

### **Documentation Updates**
- **Added**: Migration guide and deployment instructions
- **Updated**: README with new architecture overview
- **Updated**: Roadmap with completed migration milestone
- **Added**: Comprehensive deployment documentation

### **Live Demo**
- **Frontend**: https://lumina-engine-two.vercel.app/
- **Backend**: https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api
- **Status**: Production-ready with all endpoints functional

---

## [1.0.0] - 2024-12-15

### **Added**
- Multi-domain prompt orchestration system
- Real-time compliance monitoring dashboard
- Streaming AI responses with SSE
- Deterministic guardrail engine
- Context bleed-through detection

### **Technical**
- React/TypeScript frontend with Vite
- Flask backend with LM Studio integration
- Docker deployment configuration
- Vercel CI/CD pipeline

---

## [0.9.0] - 2024-11-01

### **Added**
- Initial prompt orchestration framework
- Domain-specific persona management
- Basic compliance guardrails

### **Technical**
- Set up project structure
- Added development environment
- Initial deployment configurations

## [0.4.0] - 2026-02-27
### Added
- **Vercel Hybrid Bridge**: Enabled cloud deployment connecting to local LM Studio via ngrok.
- **Flask Serverless Backend**: Robust Python backend for Vercel production.
- **Extended Timeout (60s)**: Support for slow local AI generation through ngrok tunnels.
- **ID Collision Fix**: Unique prefixes for chat message IDs (`user-*`, `ai-*`).
- **Diagnostic "Ping" Endpoint**: `/api/v1/ping` for connectivity verification.

## [0.3.0] - 2026-02-26
### Added
- **Phase 6: Engineering Excellence**: Integrated GitHub Actions CI/CD.
- **Bilingual Support**: Added comprehensive technical documentation in Spanish.
- **QA Automation**: Implemented `pytest` suite with coverage reporting.
- **Self-Correction Loop**: Automatic retry on guardrail violations.
- **Audit Trails**: daily structured logging for compliance.

## [0.2.0] - 2026-02-20
### Added
- **Phase 4 & 5 Highlights**:
- Prometheus monitoring and metrics.
- PII Redactor for data privacy.
- Bulk Domain Loader for mass ingestion.
- Prompt Injection Sandbox (Hardened L1).

## [0.1.0] - 2026-02-15
### Initial Release
- Core Layered Orchestration (L1/L2/L3).
- Deterministic Guardrail Engine.
- RAG Engine (Mock Store).
- Glassmorphic Chat UI.

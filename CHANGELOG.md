# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0/).

## [Unreleased]

## [1.2.0] - 2026-02-26

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

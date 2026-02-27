# Changelog

All notable changes to this project will be documented in this file.

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

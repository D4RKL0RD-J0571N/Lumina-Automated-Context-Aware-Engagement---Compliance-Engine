# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.2.0] - 2026-02-26
### Corregido
- **CRÍTICO**: Todos los endpoints de API devolvían 404 en producción por desajuste de rutas URL.
- **Causa Raíz**: El frontend enviaba `/compliance/metrics` pero la Edge Function solo aceptaba `/api/v1/compliance/metrics`.
- **Solución**: Se añadió `normalizePath()` para normalizar ambos patrones de ruta.

### Añadido
- **Endpoint `guardrail/scan`**: Escaneo directo de cumplimiento sin LLM en la Edge Function.
- **Test de cableado API** (`api.test.ts`): 11 casos de prueba para verificar URLs de producción.
- **Soporte de fuentes**: Configuración de `assetsInclude` en Vite para archivos woff/woff2/ttf.

### Actualizado
- **Documentación EN/ES**: Diagrama de arquitectura, tabla de referencia API, y guía de despliegue sincronizados.
- **README.md**: Descripción real del proyecto reemplazando documentación copiada del CLI de Supabase.

## [0.4.0] - 2026-02-27
### Añadido
- **Vercel Hybrid Bridge**: Despliegue en la nube conectando con LM Studio local vía ngrok.
- **Backend Serverless Flask**: Backend robusto en Python para producción en Vercel.
- **Timeout Extendido (60s)**: Soporte para generación lenta de IA local.
- **Arreglo de Colisión de IDs**: Prefijos únicos para IDs de mensajes (`user-*`, `ai-*`).
- **Endpoint de "Ping" Diagnóstico**: `/api/v1/ping` para verificación de conectividad.

## [0.3.0] - 2026-02-26
### Añadido
- **Fase 6: Excelencia en Ingeniería**: Integración de GitHub Actions CI/CD.
- **Soporte Bilingüe**: Documentación técnica completa en español.
- **Automatización de QA**: Suite de `pytest` con reporte de cobertura.
- **Bucle de Autocorrección**: Reintento automático en violaciones de guardrails.
- **Pistas de Auditoría**: Registro estructurado diario para cumplimiento.

## [0.2.0] - 2026-02-20
### Añadido
- **Hitos de Fase 4 y 5**:
- Monitoreo y métricas de Prometheus.
- Redactor de PII para privacidad de datos.
- Cargador de dominios en bloque.
- Sandbox de inyección de prompts (L1 endurecido).

## [0.1.0] - 2026-02-15
### Lanzamiento Inicial
- Orquestación por capas (L1/L2/L3).
- Motor de Guardrails determinista.
- Motor RAG (Almacén simulado).
- Interfaz de chat Glassmorphic.

# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [Sin publicar]

### **Seguridad y Cumplimiento (Persona Restrictiva)**
- **Ejecución de Reglas C/D/E**: Se endurecieron los prompts de la Capa 1 (L1) para prohibir explícitamente acciones fuera de alcance y desviaciones de la persona (p. ej., pedir comida).
- **Léxico Prohibido Expandido**: Se añadieron listas completas de palabras clave para 'Comida, Entrega y Pedidos' (tanto en inglés como en español) al Motor de Guardrails para evitar filtraciones de contexto hacia servicios generales.
- **Composición de Prompts Mejorada**: Se mejoró el `PromptLayerEngine` para integrar correctamente el conocimiento del dominio desde el registro con respaldos robustos.

## [1.3.5] - 2026-02-27

### **Seguridad y Cumplimiento (Sugerencias Inteligentes)**
- **Recomendaciones de Dominio Proactivas**: El motor de guardrail ahora detecta el interés en otros dominios gestionados y sugiere proactivamente cambiar (p. ej., "¿Interesado en la pesca? Cambia a fishing.com").
- **Coincidencia de Precisión**: Se redujo el umbral de sensibilidad para las palabras clave primarias de dominio (p. ej., 'fishing', 'repair'). Una sola mención de una palabra clave primaria para un dominio cruzado ahora activa una recomendación útil en lugar de permitir que el prompt llegue a la persona equivocada.

## [1.3.4] - 2026-02-27

### **UI y Presentación (Prototipo Vivo)**
- **Pulso del Motor (Jitter en Edge)**: Se añadió un algoritmo de jitter determinista a la Edge Function de Supabase para simular la fluctuación de métricas en tiempo real.
- **Métricas Responsivas a la Sesión**: El tablero ahora fusiona la línea base simulada con las violaciones reales de la sesión del usuario (almacenadas en `localStorage`), haciendo que reaccione instantáneamente a las interacciones del usuario.
- **Transparencia de Simulación**: Se renombró la placa de escudo a "Enterprise Simulation Active" para mayor claridad de marca.

## [1.3.3] - 2026-02-27

### **Seguridad y Cumplimiento (Refuerzo de Sentinel SSE)**
- **Entrega de Rechazo Determinista**: Se añadió `is_final: true` a la carga útil de rechazo del guardrail en la Edge Function, asegurando que los rechazos nunca sean "tragados" por el analizador de streaming.
- **Defensa en Profundidad del Analizador**: Se reforzó el analizador `orchestrateStream` del frontend para reconocer eventos de `classification` como finales, incluso si faltan metadatos.
- **Despliegue en Edge**: Despliegue exitoso de la lógica endurecida de Sentinel (escaneo basado en Regex + Temas Generales Prohibidos) en Supabase.

## [1.3.2] - 2026-02-27

### **UI y Presentación (Pulido Premium)**
- **Soporte de Markdown Enriquecido**: Integración de `ReactMarkdown` con `remark-gfm` para respuestas de IA profesionales y estructuradas.
- **Tipografía Premium**: Se añadió el sistema de diseño `.markdown-content` con bloques de código glasmórficos, marcadores de lista acentuados y legibilidad mejorada.

### **Seguridad y Cumplimiento (Sentinel con Regex)**
- **Coincidencia de Palabras Completas**: Se actualizaron los escáneres tanto en Python como en TypeScript para usar límites de palabras con Regex (`\b... \b`). Esto evita falsos positivos y asegura el bloqueo determinista de temas como 'cars' sin capturar coincidencias parciales.
- **Refuerzo Zero-Echo**: Se mejoró la fiabilidad del rechazo previo al escaneo para consultas de conocimiento general fuera de alcance.

## [1.3.1] - 2026-02-27

### **Seguridad y Cumplimiento (Fase 7: Endurecimiento de Sentinel)**
- **Ejecución Zero-Echo**: Implementación de pre-escaneo determinista de entrada para bloquear prompts violatorios o fuera de alcance *antes* de que lleguen al LLM.
- **Detección fuera de alcance (Out-of-Scope)**: Se añadió detección de firmas entre dominios usando `DOMAIN_SIGNATURES` para forzar límites estrictos de contexto.
- **Paridad Arquitectónica**: Sincronización de la lógica del Motor de Guardrails entre FastAPI (Python) y Supabase Edge Functions (TypeScript).
- **Hardening de Prompts L1**: Actualización de instrucciones universales para forzar lealtad determinista al personaje y comportamiento de "Bloqueo de Contexto".

### **Frontend y UX**
- **UI de Chat Premium**: Integración de marca de agua "Secure Channel" e indicadores visuales persistentes de "Contexto Bloqueado".
- **Estilo de Eventos de Seguridad**: Estandarización de las anulaciones de cumplimiento como eventos de seguridad profesionales con iconos específicos y estados de alerta roja.
- **Respuesta Mejorada**: Optimización del diseño del Widget de Chat para mejor legibilidad de texto y visualización de metadatos estructurados.

### **Interno**
- Refactorización de `GuardrailEngine` a una clase en TypeScript para mejor mantenibilidad.
- Adición de palabras clave de paridad de la arquitectura de referencia CRM Human-in-the-Loop.

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

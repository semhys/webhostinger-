# Semhys Agents Backend (MVP)

Backend para sistema multi-agente de ingeniería (FastAPI + Vertex AI Search).

## Requisitos/Setup
1. Copy `.env.example` to `.env` and configure keys.
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload`

## API Endpoints

### 1. Research Agent
**POST** `/api/agents/research`
- Responde preguntas usando RAG de documentos internos.
- **Input**:
```json
{
  "query": "Normativa bombas NFPA",
  "top_k": 5
}
```

### 2. Report Agent
**POST** `/api/reports/generate`
- Genera reportes estructurados con citas internas precisas.
- **Input**:
```json
{
  "topic": "Análisis de riesgo contra incendio",
  "scope": "internal_only",
  "report_type": "technical",
  "audience": "manager"
}
```

### 3. Blog Agent (Privacy Safe)
**POST** `/api/blog/generate`
- Escribe artículos para publico externo sin revelar datos sensibles.
- **Input**:
```json
{
  "topic": "Importancia del mantenimiento de bombas",
  "angle": "educational",
  "seo_keywords": ["bombas", "incendio", "mantenimiento"],
  "use_internal": true,
  "privacy_mode": "strict"
}
```
*Garantía*: No incluye nombres de archivos ni URIs internas en el texto.

### 4. Commercial Agent (Internal Sales)
**POST** `/api/commercial/analyze`
- Identifica oportunidades de venta cross-sell/up-sell basadas en documentos técnicos.
- **Output**: JSON con lista de oportunidades, urgencia y margen estimado.
- **Input**:
```json
{
  "topic": "bombas",
  "top_k": 10,
  "audience": "internal_exec"
}
```
*Privacidad*: Kill-switch activo para evitar salir titulos/URIs en el JSON.

## Tests
- `python scripts/smoke_test.py` (Research)
- `python scripts/test_report.py` (Report Structure)
- `python scripts/test_blog.py` (Privacy/Redaction)
- `python scripts/audit_vertex.py` (Data Store)

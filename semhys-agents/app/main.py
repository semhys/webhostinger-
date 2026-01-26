
from fastapi import FastAPI
from app.api.research_routes import router as research_router
from app.api.report_routes import router as report_router
from app.api.blog_routes import router as blog_router
from app.api.commercial_routes import router as commercial_router

app = FastAPI(title="Semhys Agents Backend", version="0.1.0")

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(research_router, prefix="/api/agents")
app.include_router(report_router, prefix="/api/reports")
app.include_router(blog_router, prefix="/api/blog")
app.include_router(commercial_router, prefix="/api/commercial")

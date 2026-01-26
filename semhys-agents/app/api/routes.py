
from fastapi import APIRouter
from app.api.research_routes import router as research_router
from app.api.report_routes import router as report_router
from app.api.blog_routes import router as blog_router

router = APIRouter(prefix="/api", tags=["agents"])

# Mount sub-routers
# /api/agents/research
router.include_router(research_router, prefix="/agents", tags=["research"])

# /api/reports/generate
router.include_router(report_router, prefix="/reports", tags=["reports"])

# /api/blog/generate
router.include_router(blog_router, prefix="/blog", tags=["blog"])

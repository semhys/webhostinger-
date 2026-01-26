
from app.api.types import ReportResponse, BlogResponse
import logging

try:
    print("Testing ReportResponse defaults...")
    r = ReportResponse(executive_summary="Summary")
    print(f"✅ ReportResponse Success: {r}")
except Exception as e:
    print(f"❌ ReportResponse Failed: {e}")

try:
    print("\nTesting BlogResponse defaults...")
    b = BlogResponse(title="T", meta_description="D", outline=[], content_markdown="C", faq=[])
    print(f"✅ BlogResponse Success: {b}")
except Exception as e:
    print(f"❌ BlogResponse Failed: {e}")

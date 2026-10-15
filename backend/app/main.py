import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import api_router

app = FastAPI(title="EduFlow API", description="EduFlow backend API", version="1.0.0")

# Support configurable CORS origins for deployment (Vercel, custom domain, local)
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allow_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to EduFlow API"}

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok", "app": "EduFlow API", "version": "1.0.0"}

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.db.database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    print(f"ERROR on {request.url.path}: {error_trace}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__, "detail": error_trace.splitlines()[-4:]}
    )

@app.get("/api/v1/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT count(*) FROM users")).scalar()
        return {"status": "connected", "users_count": result}
    except Exception as e:
        return {"status": "error", "error": str(e), "type": type(e).__name__}


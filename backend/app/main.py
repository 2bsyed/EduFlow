import os
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.routers import api_router
from app.db.database import get_db, engine, Base
import app.models.models  # ensure models are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm DB connection and execute safe idempotent migrations on application startup
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("INFO: Database connection pre-warmed successfully on startup.")
            migration_statements = [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS hero_headline VARCHAR",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS hero_subhead VARCHAR",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS about_text TEXT",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS contact_phone VARCHAR",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS contact_email VARCHAR",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS features_json TEXT",
                "ALTER TABLE institutes ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE",
            ]
            for stmt in migration_statements:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception as ex:
                    print(f"DEBUG: Migration stmt notice: {ex}")
    except Exception as e:
        print(f"INFO: Database pre-warm/migration check on startup: {e}")
    yield

app = FastAPI(
    title="EduFlow API",
    description="EduFlow backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# Support configurable CORS origins for deployment (Vercel, custom domain, local)
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allow_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
default_cors_regex = r"https://.*\.vercel\.app|https://.*eduflow.*|http://localhost:.*|http://127\.0\.0\.1:.*"
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX", default_cors_regex)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=cors_origin_regex,
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
@app.api_route("/ping", methods=["GET", "HEAD"])
@app.api_route("/api/v1/ping", methods=["GET", "HEAD"])
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    return {
        "status": "ok",
        "database": db_status,
        "app": "EduFlow API",
        "version": "1.0.0",
    }

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



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api import auth, agents


def create_tables():
    Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
    )

    # CORS must be added before routers
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(agents.router, prefix="/api", tags=["agents"])

    create_tables()
    return app


app = create_app()


@app.get("/health")
def health_check():
    return {"status": "ok"}

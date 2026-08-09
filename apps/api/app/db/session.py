from __future__ import annotations

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


@lru_cache(maxsize=1)
def create_engine_from_settings():
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not configured.")
    return create_engine(settings.database_url, pool_pre_ping=True)


@lru_cache(maxsize=1)
def create_session_factory():
    engine = create_engine_from_settings()
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session)


def get_db_session() -> Iterator[Session]:
    session_factory = create_session_factory()
    session = session_factory()
    try:
        yield session
    finally:
        session.close()

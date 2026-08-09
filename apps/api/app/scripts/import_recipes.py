from __future__ import annotations

import argparse

from sqlalchemy import delete

from app.data.external_recipes import EXTERNAL_FALLBACK_RECIPES
from app.data.recipes import MOCK_RECIPES
from app.db.base import Base
from app.db.models import IngredientModel, RecipeIngredientModel, RecipeModel, RecipeThemeModel
from app.db.session import create_engine_from_settings, create_session_factory
from app.repositories.sqlalchemy_recipe_repository import SqlAlchemyRecipeRepository


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import seed recipes into PostgreSQL.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete existing recipe-related rows before importing.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    engine = create_engine_from_settings()
    Base.metadata.create_all(bind=engine)
    session_factory = create_session_factory()
    with session_factory() as session:
        if args.reset:
            session.execute(delete(RecipeIngredientModel))
            session.execute(delete(RecipeThemeModel))
            session.execute(delete(RecipeModel))
            session.execute(delete(IngredientModel))
            session.commit()

        repository = SqlAlchemyRecipeRepository(session)
        recipes = [*MOCK_RECIPES, *EXTERNAL_FALLBACK_RECIPES]
        repository.upsert_many(recipes)
    print(f"Imported {len(recipes)} seed recipes into PostgreSQL.")


if __name__ == "__main__":
    main()

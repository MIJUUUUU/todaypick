from app.db.session import create_session_factory
from app.repositories.sqlalchemy_recipe_repository import SqlAlchemyRecipeRepository


def main() -> None:
    session_factory = create_session_factory()
    with session_factory() as session:
        repository = SqlAlchemyRecipeRepository(session)
        signals = repository.recompute_home_signals()
    print(f"Rebuilt {len(signals)} home ranking signals from search and click events.")


if __name__ == "__main__":
    main()

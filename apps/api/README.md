# todaypick-api

오늘픽 백엔드의 FastAPI 서비스와 PostgreSQL seed import 구조다.

## 구조

```text
apps/api
├── app
│   ├── api
│   ├── core
│   ├── data
│   ├── domain
│   ├── repositories
│   ├── schemas
│   ├── services
│   └── main.py
└── pyproject.toml
```

## 실행

```bash
cd apps/api
pip install -e .
uvicorn app.main:app --reload
```

기본 주소는 `http://127.0.0.1:8000`이며, 모바일 앱의 기본 `API_URL`과 맞는다.

## PostgreSQL

`DATABASE_URL`이 있으면 추천 저장소가 in-memory 대신 PostgreSQL로 전환된다.

예시:

```bash
cd apps/api
pip install -e .
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todaypick
python -m app.scripts.import_recipes
uvicorn app.main:app --reload
```

기존 데이터를 비우고 다시 적재하려면:

```bash
python -m app.scripts.import_recipes --reset
```

## Alembic 마이그레이션

초기 마이그레이션 구조도 추가해뒀다. 테이블 생성은 `create_all` 대신 Alembic으로 관리할 수 있다.

```bash
cd apps/api
pip install -e .
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todaypick
alembic upgrade head
python -m app.scripts.import_recipes
uvicorn app.main:app --reload
```

새 마이그레이션 생성:

```bash
alembic revision --autogenerate -m "describe change"
```

## DB 구조

- `recipes`: 레시피 기본 정보
- `ingredients`: 재료 마스터
- `recipe_ingredients`: 레시피-재료 매핑
- `recipe_themes`: 레시피-테마 매핑

## Import 구조

- `app/data/recipes.py`: 서비스 기본 mock 레시피
- `app/data/external_recipes.py`: 외부 검색 fallback seed
- `app/scripts/import_recipes.py`: PostgreSQL 적재 진입점

현재 seed import는 mock 레시피와 fallback 레시피를 함께 DB에 적재한다.

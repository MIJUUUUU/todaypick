# todaypick-api

오늘픽 백엔드의 초기 FastAPI 골격이다.

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
uvicorn app.main:app --reload
```

기본 주소는 `http://127.0.0.1:8000`이며, 모바일 앱의 기본 `API_URL`과 맞는다.

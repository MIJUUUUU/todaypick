# TodayPick

**TodayPick**은  
냉장고에 있는 재료와 오늘의 상황을 기준으로,  
지금 바로 만들 수 있는 요리를 빠르게 결정하도록 돕는 모바일 레시피 서비스다.

단순히 레시피를 검색하는 앱이 아니라,  
사용자가 `오늘 뭐 해먹지?`라는 질문에 답을 찾는 과정 자체를 줄이는 데 초점을 맞췄다.

## 프로젝트 소개

혼자 요리할 때 가장 자주 생기는 문제는 두 가지다.

- 지금 가진 재료로 무엇을 만들 수 있는지 바로 떠오르지 않는다.
- 레시피를 찾더라도 실제로 따라 하기 전까지는 할 수 있는 요리인지 판단하기 어렵다.

TodayPick은 이 문제를 `재료 선택 → 추천 결과 → 레시피 미리보기 → 재료 체크 → 단계별 조리` 흐름으로 풀어낸다.  
사용자는 긴 검색이나 비교 없이, 지금 가능한 요리를 빠르게 고르고 바로 조리를 시작할 수 있다.

## 핵심 경험

### 1. 재료 중심 탐색

사용자가 가진 재료를 직접 검색하거나 선택하면,  
그 재료 조합에 맞는 레시피를 우선순위 기반으로 추천한다.

### 2. 바로 판단 가능한 레시피 미리보기

추천 결과에서 바로 상세로 진입했을 때,

- 필요한 재료
- 조리 시간
- 난이도
- 인분
- 준비 과정 일부

를 먼저 보여줘서 사용자가 `지금 만들 수 있는지`를 빠르게 판단할 수 있도록 했다.

### 3. 조리 직전 체크리스트

레시피를 선택한 뒤에는 재료 준비 체크리스트로 이어진다.  
이 단계는 단순한 상세 화면이 아니라, 실제 조리를 시작하기 전 사용자가 준비 상태를 정리하는 전환 구간이다.

특히 `핵심 재료(required ingredient)`를 기준으로 조리 시작 가능 여부를 제어해,  
아무 재료나 체크하고 넘어가는 흐름이 아니라 실제 조리 가능 상태를 반영하도록 설계했다.

### 4. 단계별 조리 모드

조리 화면은 긴 레시피 본문을 스크롤하는 방식이 아니라,

- 한 단계씩 집중해서 보기
- 단계별 타이머 사용
- 진행 흐름 유지

에 맞춘 `cooking mode` 형태로 구성했다.

### 5. 조리 완료 후 기록 경험

조리가 끝나면 완성 화면에서

- 요리 완료 기록
- 찜
- 인증사진 첨부
- 한 줄 메모
- 내 컬렉션 저장

까지 이어지도록 만들어, 단발성 사용이 아니라 개인 요리 기록이 쌓이는 구조를 만들었다.

## 왜 이 프로젝트를 만들었는가

이 프로젝트는 “레시피를 보여주는 앱”보다  
“요리를 결정하고, 준비하고, 끝까지 만들게 하는 앱”을 만드는 데 더 가깝다.

포인트는 레시피 데이터 그 자체보다,  
사용자가 실제로 주방에서 겪는 맥락을 인터랙션으로 풀어내는 데 있다.

예를 들어,

- 재료가 없으면 추천 단계에서 먼저 인지시키고
- 조리 직전에는 준비 체크리스트로 한 번 더 정리하고
- 조리 중에는 타이머와 단계 집중 흐름을 유지하고
- 끝난 뒤에는 기록과 보관 경험으로 연결한다

이런 식으로 하나의 레시피를 `검색 결과`가 아니라 `사용 흐름`으로 설계했다.

## 구현 범위

현재 프로젝트에는 아래 흐름이 구현되어 있다.

- 메인 홈
- 재료로 찾기
- 테마로 찾기
- 추천 결과 목록
- 레시피 미리보기
- 재료 체크리스트
- 단계별 조리 모드
- 단계별 타이머
- 조리 완료 화면
- 내 요리 컬렉션

## 기술 구성

### Mobile

- Expo 52
- React Native 0.76
- Expo Router
- AsyncStorage
- Expo Image Picker

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Psycopg 3

## 아키텍처 포인트

이 프로젝트는 모바일 UI와 백엔드를 분리한 구조로 구성되어 있다.

```text
todaypick
├── apps
│   ├── mobile   # Expo Router 기반 모바일 앱
│   └── api      # FastAPI + PostgreSQL 기반 API
├── 01_Project_Overview.md
├── 02_Requirements.md
├── 03_User_Flow.md
├── 04_Information_Architecture.md
├── 05_Technical_Stack.md
└── 06_Architecture_Guide.md
```

특히 백엔드는 이후 실제 레시피 데이터 확장과 추천 로직 고도화를 고려해

- 도메인 모델
- 저장소 레이어
- 서비스 레이어
- Alembic 마이그레이션

을 분리해두었다.

모바일은 단순 화면 나열이 아니라,

- 탐색
- 미리보기
- 체크리스트
- 조리
- 완료/기록

으로 이어지는 사용자 플로우 중심으로 설계했다.

## 실행 방법

### Mobile

```bash
cd apps/mobile
npm install
npm run ios
```

또는

```bash
cd apps/mobile
npm start
```

### API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

### PostgreSQL + Migration

```bash
cd apps/api
source .venv/bin/activate
export DATABASE_URL='postgresql+psycopg://miju@127.0.0.1:5432/todaypick'
alembic upgrade head
python -m app.scripts.import_recipes
uvicorn app.main:app --reload
```

## 문서

- [01_Project_Overview.md](./01_Project_Overview.md)
- [02_Requirements.md](./02_Requirements.md)
- [03_User_Flow.md](./03_User_Flow.md)
- [04_Information_Architecture.md](./04_Information_Architecture.md)
- [05_Technical_Stack.md](./05_Technical_Stack.md)
- [06_Architecture_Guide.md](./06_Architecture_Guide.md)
- [apps/api/README.md](./apps/api/README.md)

## 한 줄 요약

TodayPick은  
`지금 있는 재료로, 오늘 바로 만들 수 있는 요리`를  
가장 빠르게 결정하고 끝까지 실행하게 만드는 레시피 앱이다.

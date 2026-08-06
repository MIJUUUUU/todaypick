# 오늘픽 기술 스택 및 운영 계획

## 1. 기술 스택 결정

오늘픽은 iOS·Android 동시 출시와 장기적인 확장성을 고려해 다음 기술 스택을 사용한다.

| 영역 | 기술 |
| --- | --- |
| 모바일 앱 | React Native + Expo |
| 언어 | TypeScript / Python |
| API 서버 | FastAPI |
| 데이터베이스 | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| 데이터 검증 | Pydantic |
| DB 마이그레이션 | Alembic |
| 인증 | JWT + OAuth |
| 이미지 저장 | Cloudflare R2 또는 S3 호환 스토리지 |
| 캐시 | Redis (필요 시 추가) |
| 비동기 작업 | ARQ 또는 Celery (필요 시 추가) |
| 오류 추적 | Sentry |

## 2. 기본 아키텍처

```text
React Native + Expo 앱
        ↓
FastAPI API 서버
        ├── 인증
        ├── 재료 입력 및 표준화
        ├── 레시피 추천
        ├── 추가 재료 반영
        └── 조리 기록
        ↓
PostgreSQL
        ├── recipes
        ├── ingredients
        ├── themes
        ├── users
        └── cooking_sessions
```

## 3. 초기 배포 구조

MVP에서는 복잡한 마이크로서비스를 사용하지 않는다.

```text
FastAPI 단일 서버
        ↓
PostgreSQL 단일 인스턴스
        ↓
Cloudflare R2 이미지 저장소
```

Redis와 작업 큐는 AI 요청이나 트래픽이 증가한 뒤 추가한다.

## 4. AI 처리 원칙

- 앱에서 AI API를 직접 호출하지 않는다.
- FastAPI 서버에서만 AI API를 호출한다.
- 검증된 레시피를 우선 검색한다.
- AI는 추천 이유, 재료 매칭, 추가 재료 반영을 담당한다.
- AI 응답은 Pydantic 모델로 검증한다.
- 동일한 요청은 캐시해 중복 비용을 줄인다.
- 사용자별 AI 호출 횟수와 요청 크기를 제한한다.

## 5. DB 이전 가능성 확보

앱이 PostgreSQL에 직접 접근하지 않고 모든 데이터 요청을 FastAPI를 통해 처리한다.

```text
앱 → FastAPI → PostgreSQL
```

데이터 접근 코드는 Repository 계층으로 분리하고, 앱 화면에 DB 전용 컬럼명이나 쿼리를 노출하지 않는다. 이를 통해 추후 PostgreSQL 호스팅 업체나 서버 환경을 변경할 수 있다.

## 6. 비용 계획

### 개발·검증 단계

- API 서버: 무료 또는 저가 인스턴스
- PostgreSQL: 무료 구간 또는 소형 인스턴스
- 이미지 저장: 무료 구간 또는 사용량 기반 소액
- Redis: 사용하지 않음
- AI API: 호출량에 따른 종량제
- Apple Developer Program: 연간 99달러
- Google Play Console: 25달러 1회

### 사용자 증가 단계

- API 서버 수평 확장
- PostgreSQL 백업과 고가용성 구성
- Redis 캐시 도입
- AI 작업 큐 분리
- 이미지 CDN 적용
- 로그·오류 추적 비용 증가

정확한 운영비는 사용자 수 자체보다 월간 API 요청 수, AI 요청 수, 이미지 전송량, 동시 접속자 수로 계산한다.

## 7. 확장 순서

```text
단일 FastAPI + PostgreSQL
↓
Redis 캐시 추가
↓
AI 작업 큐 분리
↓
API 서버 수평 확장
↓
추천·이미지 처리 서버 분리
```

처음부터 마이크로서비스로 나누지 않고, 실제 병목이 확인된 기능부터 분리한다.

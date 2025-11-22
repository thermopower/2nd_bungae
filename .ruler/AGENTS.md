# Korean Text
코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
항상 한국어로 응답하세요.


코드 수정 작업을 완료한 뒤 commit을 남겨주세요. message는 최근 기록을 참고해서 적절히 작성하세요.

# SOT(Source Of Truth) Design
docs폴더의 문서를 참고하여 프로그램 구조를 파악하세요. docs/external에는 외부서비스 연동 관련 문서가 있으니 필요시 확인하여 파악하세요.

# Functional Programming Principles

모든 코드는 다음 함수형 프로그래밍 원칙을 따릅니다.

## 핵심 원칙
1. **순수 함수**: 같은 입력 → 같은 출력, 외부 상태 변경 금지
2. **불변성**: 데이터 직접 변경 금지, 새 객체 생성 (스프레드 연산자 활용)
3. **선언적 코드**: for/while 대신 map/filter/reduce 사용
4. **함수 합성**: 작은 순수 함수들을 조합

## 적용 방법
- const 선호, let 최소화
- 배열/객체 변경 시 스프레드 연산자 사용
- 루프 대신 Array 메서드 활용 (map, filter, reduce, every, some)
- 조건문보다 객체 매핑이나 삼항 연산자 선호

---

# Codebase Structure (Layered Architecture + SOLID)

## 기술 스택
- **Frontend**: Next.js App Router (React 18) + Flux + Context API
- **Server**: Hono (@hono/vercel) - Next.js API Routes 내에서 실행
- **BaaS**: Supabase (PostgreSQL, Auth, SDK/REST API)
- **Deployment**: Vercel

## 설계 원칙

### 레이어 분리 규칙
1. **Presentation ↔ Business Logic 분리**: UI 컴포넌트는 비즈니스 로직을 직접 포함하지 않음
2. **Business Logic ↔ Persistence 분리**: 순수 비즈니스 로직은 DB 접근 코드와 분리
3. **Internal Logic ↔ External Contract 분리**: 내부 로직과 외부 서비스 연동 계약은 분리
4. **단일 책임 원칙**: 각 모듈은 하나의 명확한 책임만 가짐

## Directory Structure

```
src/
├── app/                          # Next.js App Router (Presentation Layer - Server)
│   ├── (auth)/                   # 인증 관련 페이지 그룹
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (main)/                   # 메인 기능 페이지 그룹
│   │   ├── rooms/
│   │   │   ├── page.tsx          # 채팅방 목록
│   │   │   └── [roomId]/page.tsx # 채팅방 상세
│   │   └── bookmarks/page.tsx    # 북마크 목록
│   ├── api/                      # API Routes (Hono 진입점)
│   │   └── [[...route]]/route.ts # Hono catch-all handler
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # React Components (Presentation Layer - Client)
│   ├── ui/                       # 재사용 가능한 순수 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── features/                 # 기능별 컴포넌트 (Container)
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── chat/
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── room/
│   │   │   ├── RoomList.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   └── CreateRoomForm.tsx
│   │   └── bookmark/
│   │       ├── BookmarkList.tsx
│   │       └── BookmarkItem.tsx
│   └── layout/                   # 레이아웃 컴포넌트
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
│
├── contexts/                     # React Context (State Management)
│   ├── AuthContext.tsx           # 인증 상태 관리
│   ├── ChatContext.tsx           # 채팅 상태 관리
│   ├── RoomContext.tsx           # 채팅방 상태 관리
│   └── index.ts
│
├── hooks/                        # Custom Hooks (Presentation ↔ Business 연결)
│   ├── useAuth.ts                # 인증 관련 훅
│   ├── useMessages.ts            # 메시지 폴링/관리 훅
│   ├── useRooms.ts               # 채팅방 관리 훅
│   ├── useBookmarks.ts           # 북마크 관리 훅
│   └── usePolling.ts             # 공통 폴링 로직 훅
│
├── server/                       # Server Layer (Hono 기반)
│   ├── index.ts                  # Hono 앱 인스턴스 & 라우트 등록
│   ├── routes/                   # API 라우트 정의
│   │   ├── auth.routes.ts        # 인증 관련 라우트
│   │   ├── messages.routes.ts    # 메시지 관련 라우트
│   │   ├── rooms.routes.ts       # 채팅방 관련 라우트
│   │   ├── bookmarks.routes.ts   # 북마크 관련 라우트
│   │   ├── reactions.routes.ts   # 리액션 관련 라우트
│   │   └── webhooks.routes.ts    # Supabase 웹훅 수신
│   ├── middleware/               # Hono 미들웨어
│   │   ├── auth.middleware.ts    # 세션 검증 미들웨어
│   │   ├── rateLimit.middleware.ts
│   │   ├── audit.middleware.ts   # 감사 로깅
│   │   └── errorHandler.middleware.ts
│   └── handlers/                 # 라우트 핸들러 (Controller 역할)
│       ├── auth.handler.ts
│       ├── messages.handler.ts
│       ├── rooms.handler.ts
│       ├── bookmarks.handler.ts
│       └── reactions.handler.ts
│
├── services/                     # Business Logic Layer (순수 함수)
│   ├── auth/
│   │   ├── auth.service.ts       # 인증 비즈니스 로직
│   │   └── auth.validator.ts     # 인증 입력 검증
│   ├── message/
│   │   ├── message.service.ts    # 메시지 비즈니스 로직
│   │   ├── message.validator.ts  # 메시지 입력 검증
│   │   └── message.transformer.ts # 메시지 데이터 변환
│   ├── room/
│   │   ├── room.service.ts       # 채팅방 비즈니스 로직
│   │   └── room.validator.ts
│   ├── bookmark/
│   │   ├── bookmark.service.ts
│   │   └── bookmark.validator.ts
│   └── reaction/
│       ├── reaction.service.ts
│       └── reaction.validator.ts
│
├── repositories/                 # Data Access Layer (Persistence)
│   ├── base.repository.ts        # 공통 Repository 인터페이스/유틸
│   ├── user.repository.ts        # 사용자 데이터 접근
│   ├── message.repository.ts     # 메시지 데이터 접근
│   ├── room.repository.ts        # 채팅방 데이터 접근
│   ├── bookmark.repository.ts    # 북마크 데이터 접근
│   └── reaction.repository.ts    # 리액션 데이터 접근
│
├── external/                     # External Integration Layer
│   ├── supabase/                 # Supabase 연동
│   │   ├── client.ts             # Supabase 클라이언트 팩토리
│   │   ├── server.ts             # 서버용 Supabase 클라이언트
│   │   └── types.ts              # Supabase 타입 정의
│   └── contracts/                # 외부 서비스 계약 (Interface)
│       ├── database.contract.ts  # DB 접근 인터페이스
│       └── auth.contract.ts      # 인증 서비스 인터페이스
│
├── types/                        # TypeScript 타입 정의
│   ├── domain/                   # 도메인 모델 타입
│   │   ├── user.types.ts
│   │   ├── message.types.ts
│   │   ├── room.types.ts
│   │   ├── bookmark.types.ts
│   │   └── reaction.types.ts
│   ├── api/                      # API 요청/응답 타입
│   │   ├── request.types.ts
│   │   └── response.types.ts
│   └── common/                   # 공통 타입
│       └── result.types.ts       # Result<T, E> 패턴
│
├── utils/                        # 순수 유틸리티 함수
│   ├── date.utils.ts             # 날짜 관련 유틸
│   ├── string.utils.ts           # 문자열 관련 유틸
│   ├── validation.utils.ts       # 공통 검증 유틸
│   └── result.utils.ts           # Result 패턴 헬퍼
│
└── constants/                    # 상수 정의
    ├── api.constants.ts          # API 관련 상수
    ├── polling.constants.ts      # 폴링 설정 상수
    └── error.constants.ts        # 에러 코드 상수
```

## Top-Level Building Blocks

### 1. Presentation Layer
**책임**: UI 렌더링, 사용자 입력 처리, 상태 표시

| 모듈 | 위치 | 책임 |
|------|------|------|
| Pages | `app/` | Next.js 라우팅, 페이지 레이아웃 |
| Components | `components/` | 재사용 가능한 UI 컴포넌트 |
| Contexts | `contexts/` | Flux 기반 전역 상태 관리 |
| Hooks | `hooks/` | UI와 비즈니스 로직 연결 |

### 2. Server Layer (API Gateway)
**책임**: HTTP 요청 처리, 인증/권한, 라우팅, 미들웨어

| 모듈 | 위치 | 책임 |
|------|------|------|
| Routes | `server/routes/` | API 엔드포인트 정의 |
| Handlers | `server/handlers/` | 요청 처리, 응답 생성 |
| Middleware | `server/middleware/` | 공통 관심사 (인증, 로깅, Rate Limit) |

### 3. Business Logic Layer (Services)
**책임**: 도메인 규칙, 비즈니스 로직, 데이터 검증/변환

| 모듈 | 위치 | 책임 |
|------|------|------|
| Services | `services/*/` | 순수 비즈니스 로직 |
| Validators | `services/*/*.validator.ts` | 입력 데이터 검증 |
| Transformers | `services/*/*.transformer.ts` | 데이터 형식 변환 |

### 4. Data Access Layer (Repositories)
**책임**: 데이터 영속화, CRUD 연산, 쿼리 구성

| 모듈 | 위치 | 책임 |
|------|------|------|
| Repositories | `repositories/` | 데이터 접근 추상화 |

### 5. External Integration Layer
**책임**: 외부 서비스 연동, 계약 정의, 어댑터 구현

| 모듈 | 위치 | 책임 |
|------|------|------|
| Supabase | `external/supabase/` | Supabase SDK/REST 연동 |
| Contracts | `external/contracts/` | 외부 서비스 인터페이스 정의 |

### 6. Shared (Types, Utils, Constants)
**책임**: 타입 정의, 공통 유틸리티, 상수

| 모듈 | 위치 | 책임 |
|------|------|------|
| Types | `types/` | TypeScript 타입 정의 |
| Utils | `utils/` | 순수 유틸리티 함수 |
| Constants | `constants/` | 상수 값 정의 |

## 의존성 규칙 (Dependency Flow)

```
Presentation Layer
       │
       ▼
Server Layer (Hono)
       │
       ▼
Business Logic Layer (Services)
       │
       ▼
Data Access Layer (Repositories)
       │
       ▼
External Integration Layer
```

- 상위 레이어는 하위 레이어에만 의존
- 동일 레이어 간 의존 최소화
- External Layer는 Contracts를 통해 추상화

## 파일 네이밍 규칙

| 유형 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase.tsx | `MessageList.tsx` |
| 훅 | use*.ts | `useMessages.ts` |
| 서비스 | *.service.ts | `message.service.ts` |
| 리포지토리 | *.repository.ts | `message.repository.ts` |
| 타입 | *.types.ts | `message.types.ts` |
| 유틸리티 | *.utils.ts | `date.utils.ts` |
| 상수 | *.constants.ts | `api.constants.ts` |
| 미들웨어 | *.middleware.ts | `auth.middleware.ts` |
| 라우트 | *.routes.ts | `messages.routes.ts` |
| 핸들러 | *.handler.ts | `messages.handler.ts` |
| 검증기 | *.validator.ts | `message.validator.ts` |
| 변환기 | *.transformer.ts | `message.transformer.ts` |

# 상태관리 설계 문서

## 개요

이 문서는 폴링 기반 채팅 애플리케이션의 상태관리 설계를 정의합니다. Flux 패턴과 React Context API를 활용하여 예측 가능하고 유지보수가 용이한 상태 관리를 구현합니다.

---

## 기술 스택

- **패턴**: Flux (Action -> Dispatcher -> Store -> View)
- **구현체**: React Context API + useReducer
- **원칙**: 함수형 프로그래밍 (불변성, 순수 함수)

---

## Context 구조

```
src/contexts/
├── AuthContext.tsx      # 인증 상태 관리
├── RoomContext.tsx      # 채팅방 목록 관리
├── ChatContext.tsx      # 채팅방 상세 (메시지, 리액션, 북마크)
├── BookmarkContext.tsx  # 북마크 목록 관리
└── index.ts             # Context 내보내기
```

---

## Context별 책임

| Context | 책임 | 적용 페이지 |
|---------|------|-------------|
| AuthContext | 인증 상태, 로그인/로그아웃 | 전역 (모든 페이지) |
| RoomContext | 채팅방 목록, 검색, 방 생성 | `/rooms` |
| ChatContext | 메시지, 폴링, 리액션, 북마크 토글 | `/rooms/[roomId]` |
| BookmarkContext | 북마크 목록, 북마크 해제 | `/bookmarks` |

---

## 페이지별 Context 사용

```
/ (랜딩)
└── 상태관리 불필요 (정적 페이지)

/login
└── AuthContext (로그인 처리)

/signup
└── AuthContext (회원가입 처리)

/rooms
├── AuthContext (인증 확인)
└── RoomContext (방 목록/검색/생성)

/rooms/[roomId]
├── AuthContext (인증 확인)
└── ChatContext (메시지/리액션/북마크)

/bookmarks
├── AuthContext (인증 확인)
└── BookmarkContext (북마크 목록)
```

---

## 상세 설계 문서

1. **[AuthContext](./auth-context.md)** - 인증 상태 관리
   - 로그인/로그아웃/회원가입
   - 세션 관리
   - 인증 상태 확인

2. **[RoomContext](./room-context.md)** - 채팅방 목록 관리
   - 방 목록 조회
   - 검색 필터링
   - 방 생성

3. **[ChatContext](./chat-context.md)** - 채팅방 상세 관리
   - 메시지 조회/전송/삭제
   - 3초 주기 폴링
   - 리액션/북마크 토글
   - 낙관적 UI 업데이트

4. **[BookmarkContext](./bookmark-context.md)** - 북마크 목록 관리
   - 북마크 목록 조회
   - 북마크 해제
   - 삭제된 메시지 처리

---

## Flux 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────┐    │
│  │          │    │              │    │                    │    │
│  │  Action  │───▶│   Dispatch   │───▶│  Reducer (Store)   │    │
│  │ Creator  │    │              │    │                    │    │
│  │          │    │              │    │                    │    │
│  └──────────┘    └──────────────┘    └─────────┬──────────┘    │
│       ▲                                        │               │
│       │                                        │               │
│       │                                        ▼               │
│  ┌────┴─────────────────────────────────────────────────┐      │
│  │                                                      │      │
│  │                    View (React)                      │      │
│  │                                                      │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Provider 계층 구조

```tsx
// src/app/layout.tsx
<AuthProvider>
  <RoomProvider>
    <ChatProvider>
      <BookmarkProvider>
        {children}
      </BookmarkProvider>
    </ChatProvider>
  </RoomProvider>
</AuthProvider>
```

**참고**: 실제 구현 시 성능 최적화를 위해 필요한 페이지에서만 Provider를 사용하도록 분리할 수 있습니다.

```tsx
// src/app/(main)/rooms/layout.tsx
<RoomProvider>
  {children}
</RoomProvider>

// src/app/(main)/rooms/[roomId]/layout.tsx
<ChatProvider>
  {children}
</ChatProvider>

// src/app/(main)/bookmarks/layout.tsx
<BookmarkProvider>
  {children}
</BookmarkProvider>
```

---

## 공통 설계 원칙

### 1. 불변성 유지

```typescript
// Good: 스프레드 연산자로 새 객체 생성
return {
  ...state,
  messages: [...state.messages, newMessage],
};

// Bad: 직접 수정
state.messages.push(newMessage);
return state;
```

### 2. 순수 리듀서 함수

```typescript
// Good: 순수 함수 (외부 상태 의존 없음)
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    default:
      return state;
  }
};

// Bad: 부수 효과 포함
const reducer = (state: State, action: Action): State => {
  localStorage.setItem('items', JSON.stringify(state.items)); // 부수 효과!
  return state;
};
```

### 3. 타입 안전성

```typescript
// readonly로 불변성 타입 레벨에서 보장
interface State {
  readonly items: readonly Item[];
  readonly isLoading: boolean;
}

// 유니온 타입으로 액션 정의
type Action =
  | { readonly type: 'FETCH_START' }
  | { readonly type: 'FETCH_SUCCESS'; readonly payload: readonly Item[] }
  | { readonly type: 'FETCH_FAILURE'; readonly payload: Error };
```

### 4. 낙관적 UI 업데이트

```typescript
// 1. 즉시 UI 업데이트
case 'TOGGLE_LIKE_START':
  return {
    ...state,
    messages: state.messages.map(msg =>
      msg.id === action.payload
        ? { ...msg, isLiked: !msg.isLiked }
        : msg
    ),
  };

// 2. 성공 시 서버 데이터로 확정
case 'TOGGLE_LIKE_SUCCESS':
  return { ...state, /* 서버 응답 반영 */ };

// 3. 실패 시 롤백
case 'TOGGLE_LIKE_FAILURE':
  return {
    ...state,
    messages: state.messages.map(msg =>
      msg.id === action.payload.messageId
        ? { ...msg, isLiked: !msg.isLiked } // 롤백
        : msg
    ),
  };
```

---

## 폴링 설정

```typescript
// src/constants/polling.constants.ts
export const POLLING_INTERVAL = 3000;        // 3초 주기
export const POLLING_RETRY_DELAY = 5000;     // 에러 시 재시도 간격
export const MAX_POLLING_ERRORS = 3;         // 최대 연속 에러 횟수
```

---

## Custom Hooks 목록

| Hook | Context | 용도 |
|------|---------|------|
| `useAuth` | AuthContext | 인증 상태 및 액션 |
| `useUser` | AuthContext | 현재 사용자 정보 |
| `useIsAuthenticated` | AuthContext | 인증 여부 확인 |
| `useRooms` | RoomContext | 방 목록 상태 및 액션 |
| `useRoomSearch` | RoomContext | 방 검색 기능 |
| `useCreateRoom` | RoomContext | 방 생성 기능 |
| `useChat` | ChatContext | 채팅 상태 및 액션 |
| `useChatRoom` | ChatContext | 방 입장/퇴장 자동 관리 |
| `useMessages` | ChatContext | 메시지 목록 |
| `useMessageInput` | ChatContext | 메시지 입력 관리 |
| `useBookmarks` | BookmarkContext | 북마크 상태 및 액션 |
| `useRemoveBookmark` | BookmarkContext | 북마크 해제 기능 |

---

## 에러 처리 패턴

각 Context는 일관된 에러 구조를 사용합니다:

```typescript
interface ContextError {
  readonly code: ErrorCode;  // 에러 코드 (enum)
  readonly message: string;  // 사용자 표시용 메시지
}
```

에러 코드 예시:
- `NETWORK_ERROR` - 네트워크 연결 실패
- `FETCH_FAILED` - 데이터 조회 실패
- `PERMISSION_DENIED` - 권한 없음
- `SESSION_EXPIRED` - 세션 만료

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |

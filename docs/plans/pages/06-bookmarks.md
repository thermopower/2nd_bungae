# 북마크 목록 페이지 구현 계획

## 1. 개요

사용자가 북마크한 메시지 목록을 조회하고 관리하는 페이지입니다.

### 페이지 정보
- **경로**: `/bookmarks`
- **인증 필요**: O (인증 필요)
- **상태관리**: BookmarkContext (북마크 목록 관리)

---

## 2. 구현할 파일 목록

```
src/app/(main)/bookmarks/
├── page.tsx                     # 북마크 목록 페이지
└── layout.tsx                   # BookmarkProvider 레이아웃

src/components/features/bookmark/
├── BookmarkList.tsx             # 북마크 목록 컴포넌트
├── BookmarkItem.tsx             # 개별 북마크 아이템
├── BookmarkEmptyState.tsx       # 빈 상태 컴포넌트
├── BookmarkHeader.tsx           # 북마크 페이지 헤더
└── index.ts                     # 내보내기
```

---

## 3. 상세 구현 내용

### 3.1 BookmarkProvider 레이아웃 (app/(main)/bookmarks/layout.tsx)

```typescript
// src/app/(main)/bookmarks/layout.tsx
import { BookmarkProvider } from '@/contexts/BookmarkContext';

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookmarkProvider>{children}</BookmarkProvider>;
}
```

### 3.2 북마크 목록 페이지 (app/(main)/bookmarks/page.tsx)

```typescript
// src/app/(main)/bookmarks/page.tsx
'use client';

import { useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkHeader } from '@/components/features/bookmark/BookmarkHeader';
import { BookmarkList } from '@/components/features/bookmark/BookmarkList';
import { BookmarkEmptyState } from '@/components/features/bookmark/BookmarkEmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function BookmarksPage(): JSX.Element {
  const { state, actions } = useBookmarks();

  // 페이지 진입 시 북마크 목록 로드
  useEffect(() => {
    actions.fetchBookmarks();
  }, [actions]);

  // 로딩 상태 (초기 로딩)
  if (state.isLoading && state.bookmarks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <BookmarkHeader />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (state.error && state.bookmarks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <BookmarkHeader />
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage
            message={state.error.message}
            onRetry={actions.fetchBookmarks}
          />
        </div>
      </div>
    );
  }

  // 빈 상태
  if (state.bookmarks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <BookmarkHeader />
        <BookmarkEmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BookmarkHeader />
      <BookmarkList />
    </div>
  );
}
```

### 3.3 BookmarkHeader 컴포넌트

```typescript
// src/components/features/bookmark/BookmarkHeader.tsx
'use client';

import { useBookmarks } from '@/hooks/useBookmarks';

export const BookmarkHeader = (): JSX.Element => {
  const { state } = useBookmarks();

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">북마크</h1>
          <p className="mt-1 text-sm text-gray-500">
            저장한 메시지를 확인하세요
          </p>
        </div>

        {/* 북마크 개수 표시 */}
        {state.bookmarks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              총 <span className="font-medium text-gray-900">{state.bookmarks.length}</span>개
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3.4 BookmarkList 컴포넌트

```typescript
// src/components/features/bookmark/BookmarkList.tsx
'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkItem } from './BookmarkItem';
import { Spinner } from '@/components/ui/Spinner';

export const BookmarkList = (): JSX.Element => {
  const { state, actions } = useBookmarks();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && state.hasMore && !state.isLoading) {
          actions.fetchMoreBookmarks();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [state.hasMore, state.isLoading, actions]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 북마크 목록 */}
        <div className="space-y-4">
          {state.bookmarks.map((bookmark) => (
            <BookmarkItem key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>

        {/* 추가 로딩 트리거 */}
        <div ref={loadMoreRef} className="py-4">
          {state.isLoading && state.bookmarks.length > 0 && (
            <div className="flex justify-center">
              <Spinner size="md" className="text-blue-600" />
            </div>
          )}

          {!state.hasMore && state.bookmarks.length > 0 && (
            <p className="text-center text-sm text-gray-400">
              모든 북마크를 불러왔습니다
            </p>
          )}
        </div>

        {/* 에러 표시 (추가 로드 실패) */}
        {state.error && state.bookmarks.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-red-500 mb-2">{state.error.message}</p>
            <button
              onClick={actions.fetchMoreBookmarks}
              className="text-sm text-blue-600 hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 3.5 BookmarkItem 컴포넌트

```typescript
// src/components/features/bookmark/BookmarkItem.tsx
'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types/domain/bookmark.types';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/utils/date.utils';

interface BookmarkItemProps {
  readonly bookmark: Bookmark;
}

export const BookmarkItem = ({ bookmark }: BookmarkItemProps): JSX.Element => {
  const { state, actions } = useBookmarks();
  const [isConfirming, setIsConfirming] = useState(false);

  const isRemoving = state.isRemoving.has(bookmark.id);
  const isDeleted = bookmark.message.deletedAt !== null;

  // 북마크 해제 핸들러
  const handleRemove = useCallback(async () => {
    if (isConfirming) {
      await actions.removeBookmark(bookmark.id);
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
      // 3초 후 확인 모드 자동 취소
      setTimeout(() => setIsConfirming(false), 3000);
    }
  }, [isConfirming, bookmark.id, actions]);

  // 확인 모드 취소
  const handleCancelConfirm = useCallback(() => {
    setIsConfirming(false);
  }, []);

  return (
    <Card
      className={`transition-opacity ${
        isRemoving ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="p-4">
        {/* 삭제된 메시지 */}
        {isDeleted ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 italic">삭제된 메시지입니다</p>
                <p className="text-xs text-gray-400 mt-1">
                  {bookmark.message.room.name}
                </p>
              </div>
            </div>

            {/* 북마크 해제 버튼 */}
            <RemoveButton
              isConfirming={isConfirming}
              isRemoving={isRemoving}
              onRemove={handleRemove}
              onCancel={handleCancelConfirm}
            />
          </div>
        ) : (
          <>
            {/* 메시지 헤더 */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={bookmark.message.user.nickname ?? bookmark.message.user.email}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {bookmark.message.user.nickname ?? bookmark.message.user.email}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Link
                      href={`/rooms/${bookmark.message.room.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {bookmark.message.room.name}
                    </Link>
                    <span>-</span>
                    <span>{formatRelativeTime(bookmark.message.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2">
                {/* 원본 보기 링크 */}
                <Link
                  href={`/rooms/${bookmark.message.room.id}`}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  원본 보기
                </Link>

                {/* 북마크 해제 버튼 */}
                <RemoveButton
                  isConfirming={isConfirming}
                  isRemoving={isRemoving}
                  onRemove={handleRemove}
                  onCancel={handleCancelConfirm}
                />
              </div>
            </div>

            {/* 메시지 내용 */}
            <div className="mt-3 ml-13">
              <p className="text-gray-700 whitespace-pre-wrap break-words">
                {bookmark.message.content}
              </p>
            </div>

            {/* 북마크 날짜 */}
            <div className="mt-3 ml-13 flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>북마크됨 {formatRelativeTime(bookmark.createdAt)}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

// 북마크 해제 버튼 서브 컴포넌트
interface RemoveButtonProps {
  readonly isConfirming: boolean;
  readonly isRemoving: boolean;
  readonly onRemove: () => void;
  readonly onCancel: () => void;
}

const RemoveButton = ({
  isConfirming,
  isRemoving,
  onRemove,
  onCancel,
}: RemoveButtonProps): JSX.Element => {
  if (isRemoving) {
    return (
      <span className="text-xs text-gray-400">해제 중...</span>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onRemove}
          className="text-xs text-red-500 hover:underline"
        >
          확인
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:underline"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onRemove}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      aria-label="북마크 해제"
      title="북마크 해제"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
};
```

### 3.6 BookmarkEmptyState 컴포넌트

```typescript
// src/components/features/bookmark/BookmarkEmptyState.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const BookmarkEmptyState = (): JSX.Element => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center px-4">
      {/* 아이콘 */}
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>

      {/* 텍스트 */}
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        북마크한 메시지가 없습니다
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        채팅방에서 마음에 드는 메시지를 북마크하면
        이곳에서 다시 확인할 수 있습니다.
      </p>

      {/* CTA 버튼 */}
      <Link href="/rooms">
        <Button>채팅방 둘러보기</Button>
      </Link>
    </div>
  </div>
);
```

### 3.7 인덱스 파일

```typescript
// src/components/features/bookmark/index.ts
export { BookmarkList } from './BookmarkList';
export { BookmarkItem } from './BookmarkItem';
export { BookmarkEmptyState } from './BookmarkEmptyState';
export { BookmarkHeader } from './BookmarkHeader';
```

---

## 4. 기능 요구사항

### 4.1 북마크 목록 조회
- 북마크한 메시지 목록 표시
- 최신 북마크순 정렬
- 페이지네이션 (무한 스크롤)

### 4.2 북마크 정보 표시
| 항목 | 설명 |
|------|------|
| 작성자 | 메시지 작성자 닉네임/이메일 |
| 채팅방 | 원본 메시지가 있는 채팅방 이름 |
| 메시지 내용 | 북마크된 메시지 본문 |
| 작성 시간 | 메시지 작성 시간 |
| 북마크 시간 | 북마크한 시간 |

### 4.3 삭제된 메시지 처리
- 원본 메시지가 삭제되어도 북마크 유지
- 삭제된 메시지는 "삭제된 메시지입니다" 표시
- 삭제된 메시지의 원본 보기 링크 숨김

### 4.4 북마크 해제
- 2단계 확인 후 해제 (오클릭 방지)
- 낙관적 UI 업데이트
- 해제 실패 시 롤백 및 에러 표시

### 4.5 원본 메시지 이동
- 원본 보기 클릭 시 해당 채팅방으로 이동
- 채팅방 이름 클릭으로도 이동 가능

---

## 5. 상태 흐름

```mermaid
flowchart TD
    A[북마크 페이지 접근] --> B{인증 확인}
    B -->|No| C[/login으로 리다이렉트]
    B -->|Yes| D[FETCH_BOOKMARKS_START]

    D --> E[API 호출]
    E --> F{응답 결과}

    F -->|성공| G[FETCH_BOOKMARKS_SUCCESS]
    G --> H{북마크 있음?}

    H -->|No| I[빈 상태 표시]
    H -->|Yes| J[북마크 목록 표시]

    F -->|실패| K[FETCH_BOOKMARKS_FAILURE]
    K --> L[에러 메시지 표시]
    L --> M[재시도 버튼]
    M --> D

    J --> N[스크롤 하단 도달]
    N --> O{더 있음?}
    O -->|Yes| P[FETCH_MORE_BOOKMARKS_START]
    P --> Q[추가 북마크 로드]
    Q --> J

    J --> R[북마크 해제 클릭]
    R --> S[확인 모드]
    S --> T{확인?}
    T -->|Yes| U[REMOVE_BOOKMARK_START]
    U --> V[API 호출]
    V --> W{결과}
    W -->|성공| X[REMOVE_BOOKMARK_SUCCESS]
    X --> J
    W -->|실패| Y[REMOVE_BOOKMARK_FAILURE]
    Y --> Z[에러 표시 + 롤백]
    T -->|No/Timeout| J
```

---

## 6. API 연동

### 6.1 북마크 목록 조회 API

```typescript
// GET /api/bookmarks?page=1&limit=20
// Headers: Authorization: Bearer <token>

// Response (Success)
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "bookmark-uuid",
        "messageId": "message-uuid",
        "userId": "user-uuid",
        "createdAt": "2025-01-15T12:00:00Z",
        "message": {
          "id": "message-uuid",
          "content": "북마크된 메시지 내용",
          "createdAt": "2025-01-15T10:00:00Z",
          "deletedAt": null,
          "user": {
            "id": "author-uuid",
            "email": "author@example.com",
            "nickname": "작성자"
          },
          "room": {
            "id": "room-uuid",
            "name": "채팅방 이름"
          }
        }
      }
    ],
    "hasMore": true,
    "total": 50
  }
}

// Response (Failure)
{
  "success": false,
  "error": {
    "code": "FETCH_FAILED",
    "message": "북마크 목록을 불러오는데 실패했습니다."
  }
}
```

### 6.2 북마크 해제 API

```typescript
// DELETE /api/bookmarks/:bookmarkId
// Headers: Authorization: Bearer <token>

// Response (Success)
{
  "success": true,
  "data": {
    "id": "bookmark-uuid"
  }
}

// Response (Failure)
{
  "success": false,
  "error": {
    "code": "BOOKMARK_NOT_FOUND",
    "message": "북마크를 찾을 수 없습니다."
  }
}
```

---

## 7. 의존성 및 순서

### 7.1 의존성

- `@/contexts/BookmarkContext` - 북마크 상태 관리
- `@/hooks/useBookmarks` - 북마크 훅
- `@/components/ui/*` - UI 컴포넌트 (Card, Avatar, Button, Spinner)
- `@/utils/date.utils` - 날짜 포맷 유틸

### 7.2 구현 순서

1. BookmarkContext 및 useBookmarks 훅 구현 (00-contexts.md 참조)
2. BookmarkEmptyState 컴포넌트 구현
3. BookmarkItem 컴포넌트 구현
4. BookmarkHeader 컴포넌트 구현
5. BookmarkList 컴포넌트 구현 (무한 스크롤)
6. 북마크 목록 페이지 조립
7. API 연동 테스트

---

## 8. ChatContext와의 동기화

### 8.1 동기화 필요성
- 채팅방에서 북마크 토글 시 북마크 목록에 반영
- 북마크 목록에서 해제 시 채팅방 UI에 반영

### 8.2 동기화 전략 - 페이지 진입 시 새로고침

북마크 목록 페이지 진입 시 항상 최신 데이터를 서버에서 가져옵니다:

```typescript
// src/app/(main)/bookmarks/page.tsx
useEffect(() => {
  // 페이지 진입 시 항상 최신 목록 로드
  actions.fetchBookmarks();
}, [actions]);
```

### 8.3 대안 - 이벤트 기반 동기화

실시간 동기화가 필요한 경우 CustomEvent 활용:

```typescript
// src/hooks/useBookmarkSync.ts
import { useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types/domain/bookmark.types';

export const BOOKMARK_ADDED_EVENT = 'bookmark:added';
export const BOOKMARK_REMOVED_EVENT = 'bookmark:removed';

// 북마크 추가 이벤트 발생
export const emitBookmarkAdded = (bookmark: Bookmark): void => {
  window.dispatchEvent(new CustomEvent(BOOKMARK_ADDED_EVENT, { detail: bookmark }));
};

// 북마크 해제 이벤트 발생
export const emitBookmarkRemoved = (bookmarkId: string): void => {
  window.dispatchEvent(new CustomEvent(BOOKMARK_REMOVED_EVENT, { detail: bookmarkId }));
};

// 북마크 동기화 훅
export const useBookmarkSync = (): void => {
  const { dispatch } = useBookmarks();

  useEffect(() => {
    const handleBookmarkAdded = (event: CustomEvent<Bookmark>) => {
      dispatch({ type: 'ADD_BOOKMARK', payload: event.detail });
    };

    const handleBookmarkRemoved = (event: CustomEvent<string>) => {
      dispatch({ type: 'REMOVE_BOOKMARK_SUCCESS', payload: event.detail });
    };

    window.addEventListener(BOOKMARK_ADDED_EVENT, handleBookmarkAdded as EventListener);
    window.addEventListener(BOOKMARK_REMOVED_EVENT, handleBookmarkRemoved as EventListener);

    return () => {
      window.removeEventListener(BOOKMARK_ADDED_EVENT, handleBookmarkAdded as EventListener);
      window.removeEventListener(BOOKMARK_REMOVED_EVENT, handleBookmarkRemoved as EventListener);
    };
  }, [dispatch]);
};
```

---

## 9. 반응형 디자인

| 화면 크기 | 레이아웃 |
|-----------|----------|
| Mobile (< 640px) | 풀 너비, 컴팩트한 여백 |
| Tablet (640px - 1024px) | 중앙 정렬, 최대 너비 제한 |
| Desktop (> 1024px) | 최대 768px 너비, 중앙 정렬 |

---

## 10. 테스트 계획

### 10.1 단위 테스트

- BookmarkItem 렌더링 테스트
- 삭제된 메시지 표시 테스트
- 북마크 해제 확인 모드 테스트
- 빈 상태 컴포넌트 테스트

### 10.2 통합 테스트

- 북마크 목록 로딩 테스트
- 무한 스크롤 테스트
- 북마크 해제 플로우 테스트
- 원본 메시지 이동 테스트

### 10.3 테스트 파일

```
__tests__/
├── components/
│   └── bookmark/
│       ├── BookmarkItem.test.tsx
│       ├── BookmarkList.test.tsx
│       └── BookmarkEmptyState.test.tsx
└── pages/
    └── bookmarks.test.tsx
```

---

## 11. 접근성

- 북마크 해제 버튼에 적절한 aria-label
- 확인 모드 시 시각적 피드백 제공
- 키보드 네비게이션 지원
- 스크린 리더를 위한 상태 안내

---

## 12. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |

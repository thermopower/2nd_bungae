# 채팅방 목록 페이지 구현 계획

## 1. 개요

전체 채팅방 목록 조회, 검색, 방 생성 기능을 제공하는 페이지입니다.

### 페이지 정보
- **경로**: `/rooms`
- **인증 필요**: O (인증 필요)
- **상태관리**: RoomContext (방 목록/검색/생성)

---

## 2. 구현할 파일 목록

```
src/app/(main)/
├── layout.tsx                   # 메인 영역 레이아웃
└── rooms/
    ├── page.tsx                 # 채팅방 목록 페이지
    └── layout.tsx               # 채팅방 영역 레이아웃 (RoomProvider)

src/components/features/room/
├── RoomList.tsx                 # 채팅방 목록 컴포넌트
├── RoomCard.tsx                 # 채팅방 카드 컴포넌트
├── RoomSearchBar.tsx            # 채팅방 검색바
├── CreateRoomModal.tsx          # 채팅방 생성 모달
├── CreateRoomForm.tsx           # 채팅방 생성 폼
└── index.ts                     # 내보내기
```

---

## 3. 상세 구현 내용

### 3.1 메인 영역 레이아웃 (app/(main)/layout.tsx)

```typescript
// src/app/(main)/layout.tsx
import { AuthGuard } from '@/components/layout/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookmarkProvider } from '@/contexts/BookmarkContext';

export default function MainAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <BookmarkProvider>
        <MainLayout>{children}</MainLayout>
      </BookmarkProvider>
    </AuthGuard>
  );
}
```

### 3.2 채팅방 영역 레이아웃 (app/(main)/rooms/layout.tsx)

```typescript
// src/app/(main)/rooms/layout.tsx
import { RoomProvider } from '@/contexts/RoomContext';

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoomProvider>{children}</RoomProvider>;
}
```

### 3.3 채팅방 목록 페이지 (app/(main)/rooms/page.tsx)

```typescript
// src/app/(main)/rooms/page.tsx
'use client';

import { useEffect } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { RoomList } from '@/components/features/room/RoomList';
import { RoomSearchBar } from '@/components/features/room/RoomSearchBar';
import { CreateRoomModal } from '@/components/features/room/CreateRoomModal';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function RoomsPage(): JSX.Element {
  const { state, actions } = useRooms();

  // 초기 데이터 로드
  useEffect(() => {
    actions.fetchRooms();
  }, [actions]);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">채팅방</h1>
          <p className="mt-1 text-sm text-gray-500">
            관심 있는 채팅방에 참여하거나 새로운 방을 만들어보세요
          </p>
        </div>
        <CreateRoomModal />
      </div>

      {/* 검색바 */}
      <RoomSearchBar />

      {/* 에러 메시지 */}
      {state.error && (
        <ErrorMessage
          message={state.error.message}
          onRetry={actions.fetchRooms}
        />
      )}

      {/* 로딩 상태 */}
      {state.isLoading && state.rooms.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      ) : (
        <RoomList />
      )}
    </div>
  );
}
```

### 3.4 채팅방 목록 컴포넌트 (RoomList.tsx)

```typescript
// src/components/features/room/RoomList.tsx
'use client';

import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from './RoomCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export const RoomList = (): JSX.Element => {
  const { state, actions } = useRooms();

  // 빈 목록
  if (state.filteredRooms.length === 0) {
    if (state.searchQuery) {
      return (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="검색 결과가 없습니다"
          description={`"${state.searchQuery}"에 대한 검색 결과가 없습니다.`}
          action={
            <Button variant="outline" onClick={actions.clearSearch}>
              검색 초기화
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        title="채팅방이 없습니다"
        description="첫 번째 채팅방을 만들어 대화를 시작해보세요."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 채팅방 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {/* 추가 로드 버튼 */}
      {state.hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={actions.fetchMoreRooms}
            isLoading={state.isLoading}
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
};
```

### 3.5 채팅방 카드 컴포넌트 (RoomCard.tsx)

```typescript
// src/components/features/room/RoomCard.tsx
'use client';

import Link from 'next/link';
import { Room } from '@/types/domain/room.types';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/date.utils';

interface RoomCardProps {
  readonly room: Room;
}

export const RoomCard = ({ room }: RoomCardProps): JSX.Element => (
  <Link href={`/rooms/${room.id}`}>
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {room.name}
          </h3>
          <Badge variant={room.isPublic ? 'primary' : 'default'}>
            {room.isPublic ? '공개' : '비공개'}
          </Badge>
        </div>

        {/* 설명 */}
        {room.description ? (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
            {room.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-4 flex-grow">
            설명이 없습니다
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {room.memberCount ?? 0}명
          </span>
          <span>{formatRelativeTime(room.createdAt)}</span>
        </div>
      </CardBody>
    </Card>
  </Link>
);
```

### 3.6 검색바 컴포넌트 (RoomSearchBar.tsx)

```typescript
// src/components/features/room/RoomSearchBar.tsx
'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { Input } from '@/components/ui/Input';

export const RoomSearchBar = (): JSX.Element => {
  const { state, actions } = useRooms();
  const [inputValue, setInputValue] = useState(state.searchQuery);

  // 디바운스된 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      actions.setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, actions]);

  // 상태 동기화
  useEffect(() => {
    setInputValue(state.searchQuery);
  }, [state.searchQuery]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    actions.clearSearch();
  }, [actions]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="채팅방 검색..."
        value={inputValue}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
```

### 3.7 채팅방 생성 모달 (CreateRoomModal.tsx)

```typescript
// src/components/features/room/CreateRoomModal.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateRoomForm } from './CreateRoomForm';

export const CreateRoomModal = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <Button onClick={handleOpen}>
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        방 만들기
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="새 채팅방 만들기" size="md">
        <CreateRoomForm onSuccess={handleClose} onCancel={handleClose} />
      </Modal>
    </>
  );
};
```

### 3.8 채팅방 생성 폼 (CreateRoomForm.tsx)

```typescript
// src/components/features/room/CreateRoomForm.tsx
'use client';

import { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRooms } from '@/hooks/useRooms';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface CreateRoomFormProps {
  readonly onSuccess?: () => void;
  readonly onCancel?: () => void;
}

interface FormState {
  readonly name: string;
  readonly description: string;
  readonly isPublic: boolean;
}

interface FormErrors {
  readonly name?: string;
}

const initialFormState: FormState = {
  name: '',
  description: '',
  isPublic: true,
};

export const CreateRoomForm = ({
  onSuccess,
  onCancel,
}: CreateRoomFormProps): JSX.Element => {
  const router = useRouter();
  const { state, actions } = useRooms();

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

        setFormState((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    []
  );

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formState.name.trim()) {
      errors.name = '채팅방 이름을 입력해주세요.';
    } else if (formState.name.length > 50) {
      errors.name = '채팅방 이름은 50자 이내로 입력해주세요.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState.name]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      const room = await actions.createRoom({
        name: formState.name.trim(),
        description: formState.description.trim() || undefined,
        isPublic: formState.isPublic,
      });

      if (room) {
        onSuccess?.();
        router.push(`/rooms/${room.id}`);
      }
    },
    [formState, validateForm, actions, router, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 에러 메시지 */}
      {state.error && (
        <ErrorMessage message={state.error.message} />
      )}

      {/* 채팅방 이름 */}
      <Input
        label="채팅방 이름"
        placeholder="채팅방 이름을 입력하세요"
        value={formState.name}
        onChange={handleChange('name')}
        error={formErrors.name}
        disabled={state.isCreating}
        maxLength={50}
        autoFocus
      />

      {/* 채팅방 설명 */}
      <TextArea
        label="설명 (선택)"
        placeholder="채팅방에 대한 설명을 입력하세요"
        value={formState.description}
        onChange={handleChange('description')}
        disabled={state.isCreating}
        rows={3}
        maxLength={200}
      />

      {/* 공개 여부 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={formState.isPublic}
          onChange={handleChange('isPublic')}
          disabled={state.isCreating}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">
          공개 채팅방으로 만들기
        </label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          isLoading={state.isCreating}
          disabled={!formState.name.trim()}
        >
          만들기
        </Button>
      </div>
    </form>
  );
};
```

### 3.9 인덱스 파일

```typescript
// src/components/features/room/index.ts
export { RoomList } from './RoomList';
export { RoomCard } from './RoomCard';
export { RoomSearchBar } from './RoomSearchBar';
export { CreateRoomModal } from './CreateRoomModal';
export { CreateRoomForm } from './CreateRoomForm';
```

---

## 4. 기능 요구사항

### 4.1 채팅방 목록 조회

- 공개된 채팅방 목록 표시
- 카드 형식으로 표시 (이름, 설명, 참여자 수, 생성일)
- 페이지네이션 (더보기 버튼)

### 4.2 검색 기능

- 채팅방 이름/설명으로 검색
- 디바운스 적용 (300ms)
- 클라이언트 사이드 필터링

### 4.3 채팅방 생성

- 모달 폼으로 생성
- 필수: 채팅방 이름
- 선택: 설명, 공개 여부
- 생성 후 해당 채팅방으로 이동

---

## 5. API 연동

### 5.1 채팅방 목록 조회

```typescript
// GET /api/rooms?page=1&limit=20&search=keyword
// Response
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "name": "개발자 모임",
        "description": "개발 이야기를 나누는 방",
        "isPublic": true,
        "createdBy": "user-uuid",
        "createdAt": "2025-01-01T00:00:00Z",
        "memberCount": 15
      }
    ],
    "hasMore": true,
    "total": 50
  }
}
```

### 5.2 채팅방 생성

```typescript
// POST /api/rooms
// Request
{
  "name": "새 채팅방",
  "description": "설명",
  "isPublic": true
}

// Response
{
  "success": true,
  "data": {
    "room": {
      "id": "uuid",
      "name": "새 채팅방",
      "description": "설명",
      "isPublic": true,
      "createdBy": "user-uuid",
      "createdAt": "2025-01-01T00:00:00Z",
      "memberCount": 1
    }
  }
}
```

---

## 6. 의존성 및 순서

### 6.1 의존성

- `@/contexts/RoomContext` - 채팅방 상태 관리
- `@/hooks/useRooms` - 채팅방 훅
- `@/components/ui/*` - UI 컴포넌트
- `@/components/layout/*` - 레이아웃 컴포넌트
- `@/utils/date.utils` - 날짜 유틸

### 6.2 구현 순서

1. RoomContext 및 useRooms 훅 구현
2. 레이아웃 컴포넌트 구성
3. RoomCard 컴포넌트 구현
4. RoomSearchBar 컴포넌트 구현
5. CreateRoomForm/Modal 컴포넌트 구현
6. RoomList 컴포넌트 구현
7. 페이지 조립 및 API 연동

---

## 7. 테스트 계획

### 7.1 단위 테스트

- RoomCard 렌더링 테스트
- 검색 디바운스 테스트
- 폼 유효성 검증 테스트

### 7.2 통합 테스트

- 목록 로드 테스트
- 검색 기능 테스트
- 방 생성 플로우 테스트

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |

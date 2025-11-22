'use client';

import type { BookmarkWithMessage } from '@/types/domain/bookmark.types';
import { BookmarkItem } from './BookmarkItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface BookmarkListProps {
  readonly bookmarks: readonly BookmarkWithMessage[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onRemove: (bookmarkId: string) => void;
  readonly onRetry?: () => void;
}

export const BookmarkList = ({
  bookmarks,
  isLoading,
  error,
  onRemove,
  onRetry,
}: BookmarkListProps): JSX.Element => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onRetry}
        className="my-4"
      />
    );
  }

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        }
        title="북마크가 없습니다"
        description="채팅방에서 메시지를 북마크해보세요."
        action={
          <Link href="/rooms">
            <Button>채팅방 둘러보기</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

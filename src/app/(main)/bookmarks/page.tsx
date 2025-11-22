'use client';

import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkList } from '@/components/features/bookmark/BookmarkList';

export default function BookmarksPage() {
  const { bookmarks, isLoading, error, removeBookmark, fetchBookmarks, clearError } = useBookmarks();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">북마크</h1>
        <p className="text-gray-600">저장한 메시지를 확인하세요.</p>
      </div>

      {/* 북마크 목록 */}
      <BookmarkList
        bookmarks={bookmarks}
        isLoading={isLoading}
        error={error}
        onRemove={removeBookmark}
        onRetry={() => {
          clearError();
          fetchBookmarks();
        }}
      />
    </div>
  );
}

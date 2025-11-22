'use client';

import { useState, useCallback, useEffect } from 'react';
import type { BookmarkWithMessage } from '@/types/domain/bookmark.types';
import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { ERROR_CODES } from '@/constants/error.constants';

interface UseBookmarksResult {
  bookmarks: readonly BookmarkWithMessage[];
  isLoading: boolean;
  error: string | null;
  fetchBookmarks: () => Promise<Result<readonly BookmarkWithMessage[], string>>;
  removeBookmark: (bookmarkId: string) => Promise<Result<void, string>>;
  clearError: () => void;
}

/**
 * 북마크 관련 훅
 */
export const useBookmarks = (): UseBookmarksResult => {
  const [bookmarks, setBookmarks] = useState<readonly BookmarkWithMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (): Promise<Result<readonly BookmarkWithMessage[], string>> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.BOOKMARKS.LIST);
      const data = await response.json();

      if (!response.ok) {
        const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
        setError(errorCode);
        setIsLoading(false);
        return err(errorCode);
      }

      const fetchedBookmarks = data.data as BookmarkWithMessage[];
      setBookmarks(fetchedBookmarks);
      setIsLoading(false);
      return ok(fetchedBookmarks);
    } catch {
      setError(ERROR_CODES.NETWORK_ERROR);
      setIsLoading(false);
      return err(ERROR_CODES.NETWORK_ERROR);
    }
  }, []);

  const removeBookmark = useCallback(async (bookmarkId: string): Promise<Result<void, string>> => {
    try {
      const response = await fetch(API_ENDPOINTS.BOOKMARKS.DELETE(bookmarkId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        const errorCode = data.error?.code || ERROR_CODES.INTERNAL_ERROR;
        return err(errorCode);
      }

      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      return ok(undefined);
    } catch {
      return err(ERROR_CODES.NETWORK_ERROR);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    isLoading,
    error,
    fetchBookmarks,
    removeBookmark,
    clearError,
  };
};

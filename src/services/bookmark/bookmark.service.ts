/**
 * Bookmark Service - 북마크 비즈니스 로직
 *
 * 북마크 목록 조회, 토글 등 북마크 관련 비즈니스 로직을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err, isErr } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { BookmarkWithMessage } from '@/types/domain/bookmark.types';
import type { ApiError, PaginationParams } from '@/repositories/base.repository';
import * as bookmarkRepository from '@/repositories/bookmark.repository';
import * as messageRepository from '@/repositories/message.repository';
import { ERROR_CODES } from '@/constants/error.constants';

/** 북마크 토글 결과 */
export interface ToggleBookmarkResult {
  readonly isBookmarked: boolean;
}

/**
 * 사용자의 북마크 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<{ bookmarks: BookmarkWithMessage[], hasMore: boolean }, ApiError>
 */
export const getBookmarks = async (
  client: ServerClient,
  params: { userId: string; pagination?: PaginationParams }
): Promise<Result<{ bookmarks: readonly BookmarkWithMessage[]; hasMore: boolean }, ApiError>> => {
  return bookmarkRepository.findByUserId(client, params);
};

/**
 * 북마크를 토글합니다. (있으면 제거, 없으면 추가)
 * @param client - Supabase 클라이언트
 * @param params - 토글 파라미터
 * @returns Result<ToggleBookmarkResult, ApiError>
 */
export const toggleBookmark = async (
  client: ServerClient,
  params: {
    messageId: string;
    userId: string;
  }
): Promise<Result<ToggleBookmarkResult, ApiError>> => {
  // 메시지 존재 확인
  const messageResult = await messageRepository.findById(client, params.messageId);
  if (isErr(messageResult)) {
    return messageResult;
  }

  // 기존 북마크 확인
  const existingResult = await bookmarkRepository.findByMessageAndUser(client, params);
  if (isErr(existingResult)) {
    return existingResult;
  }

  let isBookmarked: boolean;

  if (existingResult.data) {
    // 북마크가 있으면 제거
    const removeResult = await bookmarkRepository.remove(client, params);
    if (isErr(removeResult)) {
      return removeResult;
    }
    isBookmarked = false;
  } else {
    // 북마크가 없으면 추가
    const createResult = await bookmarkRepository.create(client, params);
    if (isErr(createResult)) {
      return createResult;
    }
    isBookmarked = true;
  }

  return ok({ isBookmarked });
};

/**
 * 북마크를 해제합니다. (ID로)
 * @param client - Supabase 클라이언트
 * @param params - 삭제 파라미터
 * @returns Result<void, ApiError>
 */
export const removeBookmark = async (
  client: ServerClient,
  params: { bookmarkId: string; userId: string }
): Promise<Result<void, ApiError>> => {
  return bookmarkRepository.removeById(client, params.bookmarkId, params.userId);
};

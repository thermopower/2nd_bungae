/**
 * Bookmark Repository - 북마크 데이터 접근
 *
 * bookmarks 테이블과 관련된 데이터 접근을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { Bookmark, BookmarkWithMessage } from '@/types/domain/bookmark.types';
import type { ApiError, DbBookmark, PaginationParams } from './base.repository';
import { toApiError, calculateOffset, hasMoreItems } from './base.repository';

/**
 * DB Row를 Bookmark 도메인 타입으로 변환합니다.
 */
const toBookmark = (row: DbBookmark): Bookmark => ({
  id: row.id,
  messageId: row.message_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

/**
 * 사용자의 북마크 목록을 조회합니다. (메시지 정보 포함)
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<{ bookmarks: BookmarkWithMessage[], hasMore: boolean }, ApiError>
 */
export const findByUserId = async (
  client: ServerClient,
  params: { userId: string; pagination?: PaginationParams }
): Promise<Result<{ bookmarks: readonly BookmarkWithMessage[]; hasMore: boolean }, ApiError>> => {
  let query = client
    .from('bookmarks')
    .select(`
      *,
      messages:message_id (
        id,
        content,
        created_at,
        deleted_at,
        rooms:room_id (
          id,
          name
        )
      )
    `)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false });

  if (params.pagination) {
    const offset = calculateOffset(params.pagination);
    query = query.range(offset, offset + params.pagination.limit - 1);
  } else {
    query = query.limit(50);
  }

  const { data, error } = await query;

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  const bookmarks = (data ?? []).map((row) => {
    const message = row.messages as {
      id: string;
      content: string;
      created_at: string;
      deleted_at: string | null;
      rooms: { id: string; name: string } | null;
    } | null;

    return {
      ...toBookmark(row),
      message: {
        id: message?.id ?? '',
        content: message?.content ?? '',
        createdAt: message?.created_at ?? '',
        deletedAt: message?.deleted_at ?? null,
        room: {
          id: message?.rooms?.id ?? '',
          name: message?.rooms?.name ?? '',
        },
      },
    };
  });

  return ok({
    bookmarks,
    hasMore: params.pagination
      ? hasMoreItems(data?.length ?? 0, params.pagination.limit)
      : false,
  });
};

/**
 * 사용자의 특정 메시지에 대한 북마크를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<Bookmark | null, ApiError>
 */
export const findByMessageAndUser = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<Bookmark | null, ApiError>> => {
  const { data, error } = await client
    .from('bookmarks')
    .select('*')
    .eq('message_id', params.messageId)
    .eq('user_id', params.userId)
    .maybeSingle();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(data ? toBookmark(data) : null);
};

/**
 * 새 북마크를 생성합니다.
 * @param client - Supabase 클라이언트
 * @param params - 북마크 생성 파라미터
 * @returns Result<Bookmark, ApiError>
 */
export const create = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<Bookmark, ApiError>> => {
  const { data, error } = await client
    .from('bookmarks')
    .insert({
      message_id: params.messageId,
      user_id: params.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return err({ code: 'ALREADY_BOOKMARKED', message: '이미 북마크한 메시지입니다.' });
    }
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '북마크 생성에 실패했습니다.' });
  }

  return ok(toBookmark(data));
};

/**
 * 북마크를 삭제합니다.
 * @param client - Supabase 클라이언트
 * @param params - 삭제 파라미터
 * @returns Result<void, ApiError>
 */
export const remove = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<void, ApiError>> => {
  const { error } = await client
    .from('bookmarks')
    .delete()
    .eq('message_id', params.messageId)
    .eq('user_id', params.userId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(undefined);
};

/**
 * ID로 북마크를 삭제합니다.
 * @param client - Supabase 클라이언트
 * @param bookmarkId - 북마크 ID
 * @param userId - 사용자 ID (소유자 확인용)
 * @returns Result<void, ApiError>
 */
export const removeById = async (
  client: ServerClient,
  bookmarkId: string,
  userId: string
): Promise<Result<void, ApiError>> => {
  const { error } = await client
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', userId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(undefined);
};

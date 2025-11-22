/**
 * Bookmarks Handler - 북마크 핸들러
 *
 * 북마크 관련 API 요청을 처리합니다.
 */

import type { Context } from 'hono';
import { isErr } from '@/utils/result.utils';
import * as bookmarkService from '@/services/bookmark/bookmark.service';
import { respondWithError } from '../middleware/errorHandler.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

/** 성공 응답 헬퍼 */
const success = <T>(c: Context, data: T, status: 200 | 201 = 200) =>
  c.json({ success: true as const, data }, status);

/**
 * 북마크 목록 조회 핸들러
 * GET /api/bookmarks
 */
export const getBookmarks = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');

  const pageParam = c.req.query('page');
  const limitParam = c.req.query('limit');

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const result = await bookmarkService.getBookmarks(supabase, {
    userId: user.id,
    pagination: page && limit ? { page, limit } : undefined,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, result.data);
};

/**
 * 북마크 토글 핸들러
 * POST /api/messages/:messageId/bookmarks
 */
export const toggleBookmark = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const messageId = c.req.param('messageId');

  const result = await bookmarkService.toggleBookmark(supabase, {
    messageId,
    userId: user.id,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, result.data);
};

/**
 * 북마크 해제 핸들러 (ID로)
 * DELETE /api/bookmarks/:bookmarkId
 */
export const removeBookmark = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const bookmarkId = c.req.param('bookmarkId');

  const result = await bookmarkService.removeBookmark(supabase, {
    bookmarkId,
    userId: user.id,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: '북마크가 해제되었습니다.' });
};

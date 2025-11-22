/**
 * Reactions Handler - 리액션 핸들러
 *
 * 리액션(좋아요) 관련 API 요청을 처리합니다.
 */

import type { Context } from 'hono';
import { isErr } from '@/utils/result.utils';
import * as reactionService from '@/services/reaction/reaction.service';
import { respondWithError } from '../middleware/errorHandler.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

/** 성공 응답 헬퍼 */
const success = <T>(c: Context, data: T, status: 200 | 201 = 200) =>
  c.json({ success: true as const, data }, status);

/**
 * 리액션 토글 핸들러
 * POST /api/messages/:messageId/reactions
 */
export const toggleReaction = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const messageId = c.req.param('messageId');

  const result = await reactionService.toggleReaction(supabase, {
    messageId,
    userId: user.id,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, result.data);
};

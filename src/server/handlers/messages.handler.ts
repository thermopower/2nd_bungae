/**
 * Messages Handler - 메시지 핸들러
 *
 * 메시지 관련 API 요청을 처리합니다.
 */

import type { Context } from 'hono';
import { isErr } from '@/utils/result.utils';
import * as messageService from '@/services/message/message.service';
import { respondWithError } from '../middleware/errorHandler.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

/** 성공 응답 헬퍼 */
const success = <T>(c: Context, data: T, status: 200 | 201 = 200) =>
  c.json({ success: true as const, data }, status);

/**
 * 메시지 목록 조회 핸들러
 * GET /api/rooms/:roomId/messages
 */
export const getMessages = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  const afterParam = c.req.query('after');
  const pageParam = c.req.query('page');
  const limitParam = c.req.query('limit');

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  const result = await messageService.getMessages(supabase, {
    roomId,
    userId: user.id,
    afterMessageId: afterParam ?? undefined,
    pagination: page && limit ? { page, limit } : undefined,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, result.data);
};

/**
 * 메시지 전송 핸들러
 * POST /api/rooms/:roomId/messages
 */
export const sendMessage = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const roomId = c.req.param('roomId');
  const body = await c.req.json<{ content: string }>();

  const result = await messageService.sendMessage(supabase, {
    roomId,
    userId: user.id,
    content: body.content,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: result.data }, 201);
};

/**
 * 메시지 삭제 핸들러
 * DELETE /api/messages/:messageId
 */
export const deleteMessage = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const messageId = c.req.param('messageId');

  const result = await messageService.deleteMessage(supabase, {
    messageId,
    userId: user.id,
  });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: '메시지가 삭제되었습니다.' });
};

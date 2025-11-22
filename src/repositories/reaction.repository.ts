/**
 * Reaction Repository - 리액션 데이터 접근
 *
 * reactions 테이블과 관련된 데이터 접근을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { Reaction } from '@/types/domain/reaction.types';
import type { ApiError, DbReaction } from './base.repository';
import { toApiError } from './base.repository';

/**
 * DB Row를 Reaction 도메인 타입으로 변환합니다.
 */
const toReaction = (row: DbReaction): Reaction => ({
  id: row.id,
  messageId: row.message_id,
  userId: row.user_id,
  createdAt: row.created_at,
});

/**
 * 사용자의 특정 메시지에 대한 리액션을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<Reaction | null, ApiError>
 */
export const findByMessageAndUser = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<Reaction | null, ApiError>> => {
  const { data, error } = await client
    .from('reactions')
    .select('*')
    .eq('message_id', params.messageId)
    .eq('user_id', params.userId)
    .maybeSingle();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(data ? toReaction(data) : null);
};

/**
 * 새 리액션을 생성합니다.
 * @param client - Supabase 클라이언트
 * @param params - 리액션 생성 파라미터
 * @returns Result<Reaction, ApiError>
 */
export const create = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<Reaction, ApiError>> => {
  const { data, error } = await client
    .from('reactions')
    .insert({
      message_id: params.messageId,
      user_id: params.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return err({ code: 'ALREADY_REACTED', message: '이미 좋아요를 눌렀습니다.' });
    }
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '리액션 생성에 실패했습니다.' });
  }

  return ok(toReaction(data));
};

/**
 * 리액션을 삭제합니다.
 * @param client - Supabase 클라이언트
 * @param params - 삭제 파라미터
 * @returns Result<void, ApiError>
 */
export const remove = async (
  client: ServerClient,
  params: { messageId: string; userId: string }
): Promise<Result<void, ApiError>> => {
  const { error } = await client
    .from('reactions')
    .delete()
    .eq('message_id', params.messageId)
    .eq('user_id', params.userId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(undefined);
};

/**
 * 메시지의 리액션 수를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param messageId - 메시지 ID
 * @returns Result<number, ApiError>
 */
export const countByMessageId = async (
  client: ServerClient,
  messageId: string
): Promise<Result<number, ApiError>> => {
  const { count, error } = await client
    .from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('message_id', messageId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(count ?? 0);
};

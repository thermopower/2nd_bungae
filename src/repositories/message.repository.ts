/**
 * Message Repository - 메시지 데이터 접근
 *
 * messages 테이블과 관련된 데이터 접근을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { Message, MessageWithAuthor, MessageWithReactions } from '@/types/domain/message.types';
import type { ApiError, DbMessage, PaginationParams } from './base.repository';
import { toApiError, calculateOffset, hasMoreItems } from './base.repository';

/**
 * DB Row를 Message 도메인 타입으로 변환합니다.
 */
const toMessage = (row: DbMessage): Message => ({
  id: row.id,
  roomId: row.room_id,
  userId: row.user_id,
  content: row.content,
  createdAt: row.created_at,
  deletedAt: row.deleted_at,
});

/**
 * 채팅방의 메시지 목록을 조회합니다. (리액션, 북마크 정보 포함)
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<{ messages: MessageWithReactions[], hasMore: boolean }, ApiError>
 */
export const findByRoomId = async (
  client: ServerClient,
  params: {
    roomId: string;
    userId: string;
    pagination?: PaginationParams;
    afterMessageId?: string;
  }
): Promise<Result<{ messages: readonly MessageWithReactions[]; hasMore: boolean }, ApiError>> => {
  let query = client
    .from('messages')
    .select(`
      *,
      profiles:user_id (
        id,
        nickname
      )
    `)
    .eq('room_id', params.roomId)
    .is('deleted_at', null);

  if (params.afterMessageId) {
    // 폴링: 특정 메시지 이후의 메시지만 조회
    query = query.gt('id', params.afterMessageId);
  }

  query = query.order('created_at', { ascending: true });

  if (params.pagination) {
    const offset = calculateOffset(params.pagination);
    query = query.range(offset, offset + params.pagination.limit - 1);
  } else {
    query = query.limit(100);
  }

  const { data: messages, error } = await query;

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  const messagesWithReactions = await Promise.all(
    (messages ?? []).map(async (msg) => {
      // 리액션 수 조회
      const { count: reactionCount } = await client
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('message_id', msg.id);

      // 현재 사용자의 리액션 여부
      const { data: userReaction } = await client
        .from('reactions')
        .select('id')
        .eq('message_id', msg.id)
        .eq('user_id', params.userId)
        .maybeSingle();

      // 현재 사용자의 북마크 여부
      const { data: userBookmark } = await client
        .from('bookmarks')
        .select('id')
        .eq('message_id', msg.id)
        .eq('user_id', params.userId)
        .maybeSingle();

      const profile = msg.profiles as { id: string; nickname: string | null } | null;

      return {
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        content: msg.content,
        createdAt: msg.created_at,
        deletedAt: msg.deleted_at,
        author: {
          id: profile?.id ?? msg.user_id,
          nickname: profile?.nickname ?? null,
        },
        reactionCount: reactionCount ?? 0,
        hasReacted: userReaction !== null,
        hasBookmarked: userBookmark !== null,
      };
    })
  );

  return ok({
    messages: messagesWithReactions,
    hasMore: params.pagination
      ? hasMoreItems(messages?.length ?? 0, params.pagination.limit)
      : false,
  });
};

/**
 * ID로 메시지를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param messageId - 메시지 ID
 * @returns Result<Message, ApiError>
 */
export const findById = async (
  client: ServerClient,
  messageId: string
): Promise<Result<Message, ApiError>> => {
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error) {
    return err(toApiError(error, 'MESSAGE_NOT_FOUND'));
  }

  if (!data) {
    return err({ code: 'MESSAGE_NOT_FOUND', message: '메시지를 찾을 수 없습니다.' });
  }

  return ok(toMessage(data));
};

/**
 * 새 메시지를 생성합니다.
 * @param client - Supabase 클라이언트
 * @param params - 메시지 생성 파라미터
 * @returns Result<MessageWithAuthor, ApiError>
 */
export const create = async (
  client: ServerClient,
  params: { roomId: string; userId: string; content: string }
): Promise<Result<MessageWithAuthor, ApiError>> => {
  const { data, error } = await client
    .from('messages')
    .insert({
      room_id: params.roomId,
      user_id: params.userId,
      content: params.content,
    })
    .select(`
      *,
      profiles:user_id (
        id,
        nickname
      )
    `)
    .single();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '메시지 생성에 실패했습니다.' });
  }

  const profile = data.profiles as { id: string; nickname: string | null } | null;

  return ok({
    ...toMessage(data),
    author: {
      id: profile?.id ?? data.user_id,
      nickname: profile?.nickname ?? null,
    },
  });
};

/**
 * 메시지를 소프트 삭제합니다.
 * @param client - Supabase 클라이언트
 * @param messageId - 메시지 ID
 * @returns Result<void, ApiError>
 */
export const softDelete = async (
  client: ServerClient,
  messageId: string
): Promise<Result<void, ApiError>> => {
  const { error } = await client
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(undefined);
};

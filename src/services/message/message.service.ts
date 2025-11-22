/**
 * Message Service - 메시지 비즈니스 로직
 *
 * 메시지 조회, 전송, 삭제 등 메시지 관련 비즈니스 로직을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { err, isErr } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { MessageWithAuthor, MessageWithReactions } from '@/types/domain/message.types';
import type { ApiError, PaginationParams } from '@/repositories/base.repository';
import * as messageRepository from '@/repositories/message.repository';
import * as roomRepository from '@/repositories/room.repository';
import { validateMessageContent } from '@/utils/validation.utils';
import { ERROR_CODES } from '@/constants/error.constants';

/**
 * 채팅방의 메시지 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 조회 파라미터
 * @returns Result<{ messages: MessageWithReactions[], hasMore: boolean }, ApiError>
 */
export const getMessages = async (
  client: ServerClient,
  params: {
    roomId: string;
    userId: string;
    pagination?: PaginationParams;
    afterMessageId?: string;
  }
): Promise<Result<{ messages: readonly MessageWithReactions[]; hasMore: boolean }, ApiError>> => {
  // 채팅방 멤버인지 확인
  const isMemberResult = await roomRepository.isMember(client, {
    roomId: params.roomId,
    userId: params.userId,
  });

  if (isErr(isMemberResult)) {
    return isMemberResult;
  }

  if (!isMemberResult.data) {
    return err({
      code: ERROR_CODES.NOT_A_MEMBER,
      message: '채팅방 멤버가 아닙니다.',
    });
  }

  return messageRepository.findByRoomId(client, params);
};

/**
 * 새 메시지를 전송합니다.
 * @param client - Supabase 클라이언트
 * @param params - 메시지 전송 파라미터
 * @returns Result<MessageWithAuthor, ApiError>
 */
export const sendMessage = async (
  client: ServerClient,
  params: {
    roomId: string;
    userId: string;
    content: string;
  }
): Promise<Result<MessageWithAuthor, ApiError>> => {
  // 메시지 내용 검증
  const contentResult = validateMessageContent(params.content);
  if (!contentResult.success) {
    const code =
      contentResult.error === 'EMPTY_MESSAGE'
        ? ERROR_CODES.EMPTY_MESSAGE
        : ERROR_CODES.MESSAGE_TOO_LONG;
    return err({ code, message: code });
  }

  // 채팅방 멤버인지 확인
  const isMemberResult = await roomRepository.isMember(client, {
    roomId: params.roomId,
    userId: params.userId,
  });

  if (isErr(isMemberResult)) {
    return isMemberResult;
  }

  if (!isMemberResult.data) {
    return err({
      code: ERROR_CODES.NOT_A_MEMBER,
      message: '채팅방 멤버가 아닙니다.',
    });
  }

  return messageRepository.create(client, {
    roomId: params.roomId,
    userId: params.userId,
    content: contentResult.data,
  });
};

/**
 * 메시지를 삭제합니다. (soft delete)
 * @param client - Supabase 클라이언트
 * @param params - 삭제 파라미터
 * @returns Result<void, ApiError>
 */
export const deleteMessage = async (
  client: ServerClient,
  params: {
    messageId: string;
    userId: string;
  }
): Promise<Result<void, ApiError>> => {
  // 메시지 조회
  const messageResult = await messageRepository.findById(client, params.messageId);
  if (isErr(messageResult)) {
    return messageResult;
  }

  const message = messageResult.data;

  // 이미 삭제된 메시지인지 확인
  if (message.deletedAt !== null) {
    return err({
      code: ERROR_CODES.MESSAGE_NOT_FOUND,
      message: '이미 삭제된 메시지입니다.',
    });
  }

  // 메시지 작성자인지 확인
  if (message.userId !== params.userId) {
    return err({
      code: ERROR_CODES.NOT_MESSAGE_OWNER,
      message: '본인의 메시지만 삭제할 수 있습니다.',
    });
  }

  return messageRepository.softDelete(client, params.messageId);
};

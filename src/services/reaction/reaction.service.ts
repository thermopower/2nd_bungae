/**
 * Reaction Service - 리액션 비즈니스 로직
 *
 * 좋아요 토글 등 리액션 관련 비즈니스 로직을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err, isErr } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { ApiError } from '@/repositories/base.repository';
import * as reactionRepository from '@/repositories/reaction.repository';
import * as messageRepository from '@/repositories/message.repository';
import { ERROR_CODES } from '@/constants/error.constants';

/** 리액션 토글 결과 */
export interface ToggleReactionResult {
  readonly isReacted: boolean;
  readonly count: number;
}

/**
 * 리액션을 토글합니다. (있으면 제거, 없으면 추가)
 * @param client - Supabase 클라이언트
 * @param params - 토글 파라미터
 * @returns Result<ToggleReactionResult, ApiError>
 */
export const toggleReaction = async (
  client: ServerClient,
  params: {
    messageId: string;
    userId: string;
  }
): Promise<Result<ToggleReactionResult, ApiError>> => {
  // 메시지 존재 확인
  const messageResult = await messageRepository.findById(client, params.messageId);
  if (isErr(messageResult)) {
    return messageResult;
  }

  // 삭제된 메시지인지 확인
  if (messageResult.data.deletedAt !== null) {
    return err({
      code: ERROR_CODES.MESSAGE_NOT_FOUND,
      message: '삭제된 메시지에는 좋아요를 할 수 없습니다.',
    });
  }

  // 기존 리액션 확인
  const existingResult = await reactionRepository.findByMessageAndUser(client, params);
  if (isErr(existingResult)) {
    return existingResult;
  }

  let isReacted: boolean;

  if (existingResult.data) {
    // 리액션이 있으면 제거
    const removeResult = await reactionRepository.remove(client, params);
    if (isErr(removeResult)) {
      return removeResult;
    }
    isReacted = false;
  } else {
    // 리액션이 없으면 추가
    const createResult = await reactionRepository.create(client, params);
    if (isErr(createResult)) {
      return createResult;
    }
    isReacted = true;
  }

  // 최신 리액션 수 조회
  const countResult = await reactionRepository.countByMessageId(client, params.messageId);
  if (isErr(countResult)) {
    return countResult;
  }

  return ok({
    isReacted,
    count: countResult.data,
  });
};

/**
 * Room Service - 채팅방 비즈니스 로직
 *
 * 채팅방 생성, 조회, 참여, 나가기 등 채팅방 관련 비즈니스 로직을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err, isErr } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { RoomWithMemberCount } from '@/types/domain/room.types';
import type { ApiError, PaginationParams } from '@/repositories/base.repository';
import * as roomRepository from '@/repositories/room.repository';
import { validateRoomName } from '@/utils/validation.utils';
import { ERROR_CODES } from '@/constants/error.constants';

/** 채팅방 생성 입력 */
export interface CreateRoomInput {
  readonly name: string;
  readonly description?: string;
  readonly isPublic?: boolean;
}

/**
 * 공개 채팅방 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 페이지네이션 파라미터
 * @returns Result<{ rooms: RoomWithMemberCount[], hasMore: boolean }, ApiError>
 */
export const getPublicRooms = async (
  client: ServerClient,
  params: PaginationParams = { page: 1, limit: 20 }
): Promise<Result<{ rooms: readonly RoomWithMemberCount[]; hasMore: boolean }, ApiError>> => {
  return roomRepository.findPublicRooms(client, params);
};

/**
 * 사용자가 참여 중인 채팅방 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns Result<RoomWithMemberCount[], ApiError>
 */
export const getUserRooms = async (
  client: ServerClient,
  userId: string
): Promise<Result<readonly RoomWithMemberCount[], ApiError>> => {
  return roomRepository.findUserRooms(client, userId);
};

/**
 * 채팅방 상세 정보를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param roomId - 채팅방 ID
 * @param userId - 요청 사용자 ID (권한 확인용)
 * @returns Result<RoomWithMemberCount, ApiError>
 */
export const getRoomDetail = async (
  client: ServerClient,
  roomId: string,
  userId: string
): Promise<Result<RoomWithMemberCount, ApiError>> => {
  const roomResult = await roomRepository.findById(client, roomId);
  if (isErr(roomResult)) {
    return roomResult;
  }

  const room = roomResult.data;

  // 비공개 방인 경우 멤버인지 확인
  if (!room.isPublic) {
    const isMemberResult = await roomRepository.isMember(client, { roomId, userId });
    if (isErr(isMemberResult)) {
      return isMemberResult;
    }

    if (!isMemberResult.data) {
      return err({
        code: ERROR_CODES.ROOM_ACCESS_DENIED,
        message: '접근 권한이 없습니다.',
      });
    }
  }

  return ok(room);
};

/**
 * 새 채팅방을 생성합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 생성자 ID
 * @param input - 채팅방 생성 입력
 * @returns Result<RoomWithMemberCount, ApiError>
 */
export const createRoom = async (
  client: ServerClient,
  userId: string,
  input: CreateRoomInput
): Promise<Result<RoomWithMemberCount, ApiError>> => {
  // 채팅방 이름 검증
  const nameResult = validateRoomName(input.name);
  if (!nameResult.success) {
    return err({ code: ERROR_CODES.INVALID_INPUT, message: '채팅방 이름이 올바르지 않습니다.' });
  }

  // 채팅방 생성
  const roomResult = await roomRepository.create(client, {
    createdBy: userId,
    name: nameResult.data,
    description: input.description?.trim(),
    isPublic: input.isPublic ?? true,
  });

  if (isErr(roomResult)) {
    return roomResult;
  }

  // 생성자를 멤버로 자동 추가
  const memberResult = await roomRepository.addMember(client, {
    roomId: roomResult.data.id,
    userId,
  });

  if (isErr(memberResult)) {
    return memberResult;
  }

  return ok({
    ...roomResult.data,
    memberCount: 1,
  });
};

/**
 * 채팅방에 참여합니다.
 * @param client - Supabase 클라이언트
 * @param roomId - 채팅방 ID
 * @param userId - 사용자 ID
 * @returns Result<void, ApiError>
 */
export const joinRoom = async (
  client: ServerClient,
  roomId: string,
  userId: string
): Promise<Result<void, ApiError>> => {
  // 채팅방 존재 확인
  const roomResult = await roomRepository.findById(client, roomId);
  if (isErr(roomResult)) {
    return roomResult;
  }

  // 이미 멤버인지 확인
  const isMemberResult = await roomRepository.isMember(client, { roomId, userId });
  if (isErr(isMemberResult)) {
    return isMemberResult;
  }

  if (isMemberResult.data) {
    return err({
      code: ERROR_CODES.ALREADY_MEMBER,
      message: '이미 참여 중인 채팅방입니다.',
    });
  }

  // 비공개 방인 경우 접근 불가
  if (!roomResult.data.isPublic) {
    return err({
      code: ERROR_CODES.ROOM_ACCESS_DENIED,
      message: '비공개 채팅방입니다.',
    });
  }

  // 멤버 추가
  const memberResult = await roomRepository.addMember(client, { roomId, userId });
  if (isErr(memberResult)) {
    return memberResult;
  }

  return ok(undefined);
};

/**
 * 채팅방에서 나갑니다.
 * @param client - Supabase 클라이언트
 * @param roomId - 채팅방 ID
 * @param userId - 사용자 ID
 * @returns Result<void, ApiError>
 */
export const leaveRoom = async (
  client: ServerClient,
  roomId: string,
  userId: string
): Promise<Result<void, ApiError>> => {
  // 멤버인지 확인
  const isMemberResult = await roomRepository.isMember(client, { roomId, userId });
  if (isErr(isMemberResult)) {
    return isMemberResult;
  }

  if (!isMemberResult.data) {
    return err({
      code: ERROR_CODES.NOT_A_MEMBER,
      message: '채팅방 멤버가 아닙니다.',
    });
  }

  return roomRepository.removeMember(client, { roomId, userId });
};

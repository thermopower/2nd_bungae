/**
 * Room Repository - 채팅방 데이터 접근
 *
 * rooms, room_members 테이블과 관련된 데이터 접근을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { Room, RoomMember, RoomWithMemberCount } from '@/types/domain/room.types';
import type { ApiError, DbRoom, DbRoomMember, PaginationParams } from './base.repository';
import { toApiError, calculateOffset, hasMoreItems } from './base.repository';

/**
 * DB Row를 Room 도메인 타입으로 변환합니다.
 */
const toRoom = (row: DbRoom): Room => ({
  id: row.id,
  createdBy: row.created_by,
  name: row.name,
  description: row.description,
  isPublic: row.is_public,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * DB Row를 RoomMember 도메인 타입으로 변환합니다.
 */
const toRoomMember = (row: DbRoomMember): RoomMember => ({
  id: row.id,
  roomId: row.room_id,
  userId: row.user_id,
  joinedAt: row.joined_at,
});

/**
 * 공개 채팅방 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param params - 페이지네이션 파라미터
 * @returns Result<{ rooms: RoomWithMemberCount[], hasMore: boolean }, ApiError>
 */
export const findPublicRooms = async (
  client: ServerClient,
  params: PaginationParams
): Promise<Result<{ rooms: readonly RoomWithMemberCount[]; hasMore: boolean }, ApiError>> => {
  const offset = calculateOffset(params);

  const { data: rooms, error } = await client
    .from('rooms')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + params.limit - 1);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  const roomsWithCount = await Promise.all(
    (rooms ?? []).map(async (room) => {
      const { count } = await client
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      return {
        ...toRoom(room),
        memberCount: count ?? 0,
      };
    })
  );

  return ok({
    rooms: roomsWithCount,
    hasMore: hasMoreItems(rooms?.length ?? 0, params.limit),
  });
};

/**
 * 사용자가 참여 중인 채팅방 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns Result<RoomWithMemberCount[], ApiError>
 */
export const findUserRooms = async (
  client: ServerClient,
  userId: string
): Promise<Result<readonly RoomWithMemberCount[], ApiError>> => {
  const { data: memberships, error: memberError } = await client
    .from('room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (memberError) {
    return err(toApiError(memberError, 'INTERNAL_ERROR'));
  }

  if (!memberships || memberships.length === 0) {
    return ok([]);
  }

  const roomIds = memberships.map((m) => m.room_id);

  const { data: rooms, error: roomError } = await client
    .from('rooms')
    .select('*')
    .in('id', roomIds)
    .order('created_at', { ascending: false });

  if (roomError) {
    return err(toApiError(roomError, 'INTERNAL_ERROR'));
  }

  const roomsWithCount = await Promise.all(
    (rooms ?? []).map(async (room) => {
      const { count } = await client
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

      return {
        ...toRoom(room),
        memberCount: count ?? 0,
      };
    })
  );

  return ok(roomsWithCount);
};

/**
 * ID로 채팅방을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param roomId - 채팅방 ID
 * @returns Result<RoomWithMemberCount, ApiError>
 */
export const findById = async (
  client: ServerClient,
  roomId: string
): Promise<Result<RoomWithMemberCount, ApiError>> => {
  const { data: room, error } = await client
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    return err(toApiError(error, 'ROOM_NOT_FOUND'));
  }

  if (!room) {
    return err({ code: 'ROOM_NOT_FOUND', message: '채팅방을 찾을 수 없습니다.' });
  }

  const { count } = await client
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  return ok({
    ...toRoom(room),
    memberCount: count ?? 0,
  });
};

/**
 * 새 채팅방을 생성합니다.
 * @param client - Supabase 클라이언트
 * @param params - 채팅방 생성 파라미터
 * @returns Result<Room, ApiError>
 */
export const create = async (
  client: ServerClient,
  params: { createdBy: string; name: string; description?: string; isPublic?: boolean }
): Promise<Result<Room, ApiError>> => {
  const { data, error } = await client
    .from('rooms')
    .insert({
      created_by: params.createdBy,
      name: params.name,
      description: params.description ?? null,
      is_public: params.isPublic ?? true,
    })
    .select()
    .single();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '채팅방 생성에 실패했습니다.' });
  }

  return ok(toRoom(data));
};

/**
 * 채팅방 멤버를 추가합니다.
 * @param client - Supabase 클라이언트
 * @param params - 멤버 추가 파라미터
 * @returns Result<RoomMember, ApiError>
 */
export const addMember = async (
  client: ServerClient,
  params: { roomId: string; userId: string }
): Promise<Result<RoomMember, ApiError>> => {
  const { data, error } = await client
    .from('room_members')
    .insert({
      room_id: params.roomId,
      user_id: params.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return err({ code: 'ALREADY_MEMBER', message: '이미 참여 중인 채팅방입니다.' });
    }
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  if (!data) {
    return err({ code: 'INTERNAL_ERROR', message: '멤버 추가에 실패했습니다.' });
  }

  return ok(toRoomMember(data));
};

/**
 * 채팅방 멤버를 제거합니다.
 * @param client - Supabase 클라이언트
 * @param params - 멤버 제거 파라미터
 * @returns Result<void, ApiError>
 */
export const removeMember = async (
  client: ServerClient,
  params: { roomId: string; userId: string }
): Promise<Result<void, ApiError>> => {
  const { error } = await client
    .from('room_members')
    .delete()
    .eq('room_id', params.roomId)
    .eq('user_id', params.userId);

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(undefined);
};

/**
 * 사용자가 채팅방 멤버인지 확인합니다.
 * @param client - Supabase 클라이언트
 * @param params - 확인 파라미터
 * @returns Result<boolean, ApiError>
 */
export const isMember = async (
  client: ServerClient,
  params: { roomId: string; userId: string }
): Promise<Result<boolean, ApiError>> => {
  const { data, error } = await client
    .from('room_members')
    .select('id')
    .eq('room_id', params.roomId)
    .eq('user_id', params.userId)
    .maybeSingle();

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok(data !== null);
};

/**
 * 채팅방 멤버 목록을 조회합니다.
 * @param client - Supabase 클라이언트
 * @param roomId - 채팅방 ID
 * @returns Result<RoomMember[], ApiError>
 */
export const findMembers = async (
  client: ServerClient,
  roomId: string
): Promise<Result<readonly RoomMember[], ApiError>> => {
  const { data, error } = await client
    .from('room_members')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) {
    return err(toApiError(error, 'INTERNAL_ERROR'));
  }

  return ok((data ?? []).map(toRoomMember));
};

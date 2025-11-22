/**
 * Rooms Handler - 채팅방 핸들러
 *
 * 채팅방 관련 API 요청을 처리합니다.
 */

import type { Context } from 'hono';
import { isErr } from '@/utils/result.utils';
import * as roomService from '@/services/room/room.service';
import type { CreateRoomInput } from '@/services/room/room.service';
import { respondWithError } from '../middleware/errorHandler.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

/** 성공 응답 헬퍼 */
const success = <T>(c: Context, data: T, status: 200 | 201 = 200) =>
  c.json({ success: true as const, data }, status);

/**
 * 채팅방 목록 조회 핸들러
 * GET /api/rooms
 */
export const getRooms = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');

  const pageParam = c.req.query('page');
  const limitParam = c.req.query('limit');
  const myRoomsParam = c.req.query('myRooms');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  if (myRoomsParam === 'true') {
    // 내가 참여 중인 채팅방만 조회
    const result = await roomService.getUserRooms(supabase, user.id);

    if (isErr(result)) {
      return respondWithError(c, result.error.code, result.error.message);
    }

    return success(c, { rooms: result.data, hasMore: false });
  }

  // 공개 채팅방 목록 조회
  const result = await roomService.getPublicRooms(supabase, { page, limit });

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, result.data);
};

/**
 * 채팅방 상세 조회 핸들러
 * GET /api/rooms/:roomId
 */
export const getRoomDetail = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  const result = await roomService.getRoomDetail(supabase, roomId, user.id);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { room: result.data });
};

/**
 * 채팅방 생성 핸들러
 * POST /api/rooms
 */
export const createRoom = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const body = await c.req.json<CreateRoomInput>();

  const result = await roomService.createRoom(supabase, user.id, body);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { room: result.data }, 201);
};

/**
 * 채팅방 참여 핸들러
 * POST /api/rooms/:roomId/join
 */
export const joinRoom = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  const result = await roomService.joinRoom(supabase, roomId, user.id);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: '채팅방에 참여했습니다.' });
};

/**
 * 채팅방 나가기 핸들러
 * DELETE /api/rooms/:roomId/leave
 */
export const leaveRoom = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');
  const roomId = c.req.param('roomId');

  const result = await roomService.leaveRoom(supabase, roomId, user.id);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: '채팅방에서 나왔습니다.' });
};

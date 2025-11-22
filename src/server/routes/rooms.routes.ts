/**
 * Rooms Routes - 채팅방 라우트
 *
 * 채팅방 관련 API 엔드포인트를 정의합니다.
 */

import { Hono } from 'hono';
import * as roomsHandler from '../handlers/rooms.handler';
import * as messagesHandler from '../handlers/messages.handler';
import { authMiddleware } from '../middleware/auth.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

const roomsRoutes = new Hono<{ Variables: AuthVariables }>();

// 모든 라우트에 인증 미들웨어 적용
roomsRoutes.use('*', authMiddleware);

// 채팅방 목록 / 생성
roomsRoutes.get('/', roomsHandler.getRooms);
roomsRoutes.post('/', roomsHandler.createRoom);

// 채팅방 상세 / 참여 / 나가기
roomsRoutes.get('/:roomId', roomsHandler.getRoomDetail);
roomsRoutes.post('/:roomId/join', roomsHandler.joinRoom);
roomsRoutes.delete('/:roomId/leave', roomsHandler.leaveRoom);

// 메시지 (채팅방 하위 리소스)
roomsRoutes.get('/:roomId/messages', messagesHandler.getMessages);
roomsRoutes.post('/:roomId/messages', messagesHandler.sendMessage);

export { roomsRoutes };

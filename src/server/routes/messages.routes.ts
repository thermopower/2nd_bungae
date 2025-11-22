/**
 * Messages Routes - 메시지 라우트
 *
 * 메시지 관련 API 엔드포인트를 정의합니다.
 */

import { Hono } from 'hono';
import * as messagesHandler from '../handlers/messages.handler';
import * as reactionsHandler from '../handlers/reactions.handler';
import * as bookmarksHandler from '../handlers/bookmarks.handler';
import { authMiddleware } from '../middleware/auth.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

const messagesRoutes = new Hono<{ Variables: AuthVariables }>();

// 모든 라우트에 인증 미들웨어 적용
messagesRoutes.use('*', authMiddleware);

// 메시지 삭제
messagesRoutes.delete('/:messageId', messagesHandler.deleteMessage);

// 리액션 토글
messagesRoutes.post('/:messageId/reactions', reactionsHandler.toggleReaction);

// 북마크 토글
messagesRoutes.post('/:messageId/bookmarks', bookmarksHandler.toggleBookmark);

export { messagesRoutes };

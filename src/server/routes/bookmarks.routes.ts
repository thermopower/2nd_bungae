/**
 * Bookmarks Routes - 북마크 라우트
 *
 * 북마크 관련 API 엔드포인트를 정의합니다.
 */

import { Hono } from 'hono';
import * as bookmarksHandler from '../handlers/bookmarks.handler';
import { authMiddleware } from '../middleware/auth.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

const bookmarksRoutes = new Hono<{ Variables: AuthVariables }>();

// 모든 라우트에 인증 미들웨어 적용
bookmarksRoutes.use('*', authMiddleware);

// 북마크 목록 조회
bookmarksRoutes.get('/', bookmarksHandler.getBookmarks);

// 북마크 해제 (ID로)
bookmarksRoutes.delete('/:bookmarkId', bookmarksHandler.removeBookmark);

export { bookmarksRoutes };

/**
 * Server - Hono 앱 인스턴스 및 라우트 등록
 *
 * Hono 기반 API 서버를 설정하고 모든 라우트를 등록합니다.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth.routes';
import { roomsRoutes } from './routes/rooms.routes';
import { messagesRoutes } from './routes/messages.routes';
import { bookmarksRoutes } from './routes/bookmarks.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

// Hono 앱 인스턴스 생성
const app = new Hono().basePath('/api');

// 글로벌 미들웨어
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? '*',
    credentials: true,
  })
);

// 에러 핸들러
app.use('*', errorHandler);

// 라우트 등록
app.route('/auth', authRoutes);
app.route('/rooms', roomsRoutes);
app.route('/messages', messagesRoutes);
app.route('/bookmarks', bookmarksRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 핸들러
app.notFound((c) =>
  c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '요청한 리소스를 찾을 수 없습니다.',
      },
    },
    404
  )
);

export { app };
export type AppType = typeof app;

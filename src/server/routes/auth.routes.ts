/**
 * Auth Routes - 인증 라우트
 *
 * 인증 관련 API 엔드포인트를 정의합니다.
 */

import { Hono } from 'hono';
import * as authHandler from '../handlers/auth.handler';
import { authMiddleware, supabaseMiddleware } from '../middleware/auth.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

const authRoutes = new Hono<{ Variables: AuthVariables }>();

// 인증 불필요 (회원가입, 로그인)
authRoutes.post('/signup', supabaseMiddleware, authHandler.signup);
authRoutes.post('/login', supabaseMiddleware, authHandler.login);

// 인증 필요
authRoutes.post('/logout', authMiddleware, authHandler.logout);
authRoutes.get('/me', authMiddleware, authHandler.getCurrentUser);

export { authRoutes };

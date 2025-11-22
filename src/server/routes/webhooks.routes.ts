/**
 * Webhooks Routes - 웹훅 라우트
 *
 * Supabase 웹훅 관련 API 엔드포인트를 정의합니다.
 */

import { Hono } from 'hono';
import { handleSupabaseWebhook } from '../handlers/webhooks.handler';

const webhooksRoutes = new Hono();

/**
 * Supabase Database Webhook 수신 엔드포인트
 * POST /api/webhooks/supabase
 *
 * Supabase에서 설정한 Database Webhook이 이 엔드포인트로 POST 요청을 보냅니다.
 * X-Webhook-Secret 헤더로 인증을 검증합니다.
 */
webhooksRoutes.post('/supabase', handleSupabaseWebhook);

export { webhooksRoutes };

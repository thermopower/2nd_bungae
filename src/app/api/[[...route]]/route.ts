/**
 * API Route Handler - Hono catch-all handler
 *
 * Next.js App Router에서 Hono 앱을 사용하기 위한 진입점입니다.
 */

import { handle } from 'hono/vercel';
import { app } from '@/server';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

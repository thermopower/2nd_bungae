/**
 * Auth Middleware - 인증 미들웨어
 *
 * API 요청의 인증을 처리합니다.
 */

import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/external/supabase/types';
import { ERROR_CODES } from '@/constants/error.constants';
import { respondWithError } from './errorHandler.middleware';

/** 인증된 사용자 정보 */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

/** Hono Context에 추가되는 변수 타입 */
export interface AuthVariables {
  user: AuthUser;
  supabase: ReturnType<typeof createClient<Database>>;
}

/**
 * Supabase 클라이언트를 생성합니다. (Service Role)
 */
const createServerClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

/**
 * Authorization 헤더에서 토큰을 추출합니다.
 */
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

/**
 * 인증 미들웨어 - 인증 필수
 * Authorization 헤더의 JWT 토큰을 검증하고 사용자 정보를 context에 추가합니다.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const supabase = createServerClient();
    c.set('supabase', supabase);

    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return respondWithError(c, ERROR_CODES.UNAUTHORIZED);
    }

    // 토큰으로 사용자 정보 조회
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return respondWithError(c, ERROR_CODES.UNAUTHORIZED);
    }

    c.set('user', {
      id: user.id,
      email: user.email ?? '',
    });

    await next();
  }
);

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 그냥 통과합니다.
 */
export const optionalAuthMiddleware = createMiddleware<{ Variables: Partial<AuthVariables> }>(
  async (c, next) => {
    const supabase = createServerClient();
    c.set('supabase', supabase);

    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        c.set('user', {
          id: user.id,
          email: user.email ?? '',
        });
      }
    }

    await next();
  }
);

/**
 * Supabase 클라이언트만 설정하는 미들웨어 (인증 불필요)
 */
export const supabaseMiddleware = createMiddleware<{ Variables: Pick<AuthVariables, 'supabase'> }>(
  async (c, next) => {
    const supabase = createServerClient();
    c.set('supabase', supabase);
    await next();
  }
);

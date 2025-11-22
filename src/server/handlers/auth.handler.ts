/**
 * Auth Handler - 인증 핸들러
 *
 * 인증 관련 API 요청을 처리합니다.
 */

import type { Context } from 'hono';
import { isErr } from '@/utils/result.utils';
import * as authService from '@/services/auth/auth.service';
import type { SignupInput, LoginInput } from '@/services/auth/auth.validator';
import { respondWithError } from '../middleware/errorHandler.middleware';
import type { AuthVariables } from '../middleware/auth.middleware';

/** 성공 응답 헬퍼 */
const success = <T>(c: Context, data: T, status: 200 | 201 = 200) =>
  c.json({ success: true as const, data }, status);

/**
 * 회원가입 핸들러
 * POST /api/auth/signup
 */
export const signup = async (c: Context<{ Variables: Pick<AuthVariables, 'supabase'> }>) => {
  try {
    const body = await c.req.json<SignupInput>();
    const supabase = c.get('supabase');

    const result = await authService.signup(supabase, body);

    if (isErr(result)) {
      return respondWithError(c, result.error.code, result.error.message);
    }

    return success(c, {
      user: result.data.user,
      accessToken: result.data.session.accessToken,
      refreshToken: result.data.session.refreshToken,
    }, 201);
  } catch (error) {
    console.error('Signup handler error:', error);
    return respondWithError(c, 'INTERNAL_ERROR', '회원가입 처리 중 오류가 발생했습니다.');
  }
};

/**
 * 로그인 핸들러
 * POST /api/auth/login
 */
export const login = async (c: Context<{ Variables: Pick<AuthVariables, 'supabase'> }>) => {
  const body = await c.req.json<LoginInput>();
  const supabase = c.get('supabase');

  const result = await authService.login(supabase, body);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, {
    user: result.data.user,
    accessToken: result.data.session.accessToken,
    refreshToken: result.data.session.refreshToken,
  });
};

/**
 * 로그아웃 핸들러
 * POST /api/auth/logout
 */
export const logout = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');

  const result = await authService.logout(supabase);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { message: '로그아웃되었습니다.' });
};

/**
 * 현재 사용자 정보 조회 핸들러
 * GET /api/auth/me
 */
export const getCurrentUser = async (c: Context<{ Variables: AuthVariables }>) => {
  const supabase = c.get('supabase');
  const user = c.get('user');

  const result = await authService.getCurrentUser(supabase, user.id);

  if (isErr(result)) {
    return respondWithError(c, result.error.code, result.error.message);
  }

  return success(c, { user: result.data });
};

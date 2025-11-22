/**
 * Auth Service - 인증 비즈니스 로직
 *
 * 회원가입, 로그인, 로그아웃 등 인증 관련 비즈니스 로직을 담당합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err, isErr } from '@/utils/result.utils';
import type { ServerClient } from '@/external/supabase/server';
import type { User } from '@/types/domain/user.types';
import type { ApiError } from '@/repositories/base.repository';
import * as userRepository from '@/repositories/user.repository';
import {
  validateSignupInput,
  validateLoginInput,
  type SignupInput,
  type LoginInput,
} from './auth.validator';
import { ERROR_CODES } from '@/constants/error.constants';

/** 인증 결과 타입 */
export interface AuthResult {
  readonly user: User;
  readonly session: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
}

/**
 * 회원가입을 처리합니다.
 * @param client - Supabase 클라이언트
 * @param input - 회원가입 입력
 * @returns Result<AuthResult, ApiError>
 */
export const signup = async (
  client: ServerClient,
  input: SignupInput
): Promise<Result<AuthResult, ApiError>> => {
  // 입력 검증
  const validationResult = validateSignupInput(input);
  if (!validationResult.success) {
    return err({ code: validationResult.error, message: validationResult.error });
  }

  const { email, password, nickname } = validationResult.data;

  // Supabase Auth로 회원가입
  const { data: authData, error: authError } = await client.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return err({
        code: ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: '이미 사용 중인 이메일입니다.',
      });
    }
    return err({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: authError.message,
    });
  }

  if (!authData.user || !authData.session) {
    return err({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '회원가입 처리에 실패했습니다.',
    });
  }

  // profiles 테이블에 사용자 정보 생성
  const profileResult = await userRepository.create(client, {
    id: authData.user.id,
    email,
    nickname,
  });

  if (isErr(profileResult)) {
    // 프로필 생성 실패 시 Auth 계정도 삭제 시도 (롤백)
    // 참고: admin.deleteUser는 실패할 수 있으므로 에러를 무시합니다
    try {
      await client.auth.admin.deleteUser(authData.user.id);
    } catch {
      console.error('Failed to rollback auth user:', authData.user.id);
    }
    return profileResult;
  }

  return ok({
    user: profileResult.data,
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    },
  });
};

/**
 * 로그인을 처리합니다.
 * @param client - Supabase 클라이언트
 * @param input - 로그인 입력
 * @returns Result<AuthResult, ApiError>
 */
export const login = async (
  client: ServerClient,
  input: LoginInput
): Promise<Result<AuthResult, ApiError>> => {
  // 입력 검증
  const validationResult = validateLoginInput(input);
  if (!validationResult.success) {
    return err({ code: validationResult.error, message: validationResult.error });
  }

  const { email, password } = validationResult.data;

  // Supabase Auth로 로그인
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return err({
      code: ERROR_CODES.INVALID_CREDENTIALS,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  }

  if (!authData.user || !authData.session) {
    return err({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '로그인 처리에 실패했습니다.',
    });
  }

  // profiles에서 사용자 정보 조회
  const userResult = await userRepository.findById(client, authData.user.id);
  if (isErr(userResult)) {
    return userResult;
  }

  return ok({
    user: userResult.data,
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    },
  });
};

/**
 * 로그아웃을 처리합니다.
 * @param client - Supabase 클라이언트
 * @returns Result<void, ApiError>
 */
export const logout = async (
  client: ServerClient
): Promise<Result<void, ApiError>> => {
  const { error } = await client.auth.signOut();

  if (error) {
    return err({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
    });
  }

  return ok(undefined);
};

/**
 * 현재 사용자 정보를 조회합니다.
 * @param client - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns Result<User, ApiError>
 */
export const getCurrentUser = async (
  client: ServerClient,
  userId: string
): Promise<Result<User, ApiError>> => {
  return userRepository.findById(client, userId);
};

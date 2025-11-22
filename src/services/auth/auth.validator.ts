/**
 * Auth Validator - 인증 입력 검증
 *
 * 인증 관련 입력 데이터를 검증하는 순수 함수들입니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from '@/utils/result.utils';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  isNotEmpty,
} from '@/utils/validation.utils';
import { ERROR_CODES } from '@/constants/error.constants';

/** 회원가입 입력 타입 */
export interface SignupInput {
  readonly email: string;
  readonly password: string;
  readonly passwordConfirm: string;
  readonly nickname?: string;
}

/** 로그인 입력 타입 */
export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

/** 검증된 회원가입 데이터 */
export interface ValidatedSignupData {
  readonly email: string;
  readonly password: string;
  readonly nickname?: string;
}

/** 검증된 로그인 데이터 */
export interface ValidatedLoginData {
  readonly email: string;
  readonly password: string;
}

/**
 * 회원가입 입력을 검증합니다.
 * @param input - 회원가입 입력
 * @returns Result<ValidatedSignupData, string>
 */
export const validateSignupInput = (
  input: SignupInput
): Result<ValidatedSignupData, string> => {
  const emailResult = validateEmail(input.email);
  if (!emailResult.success) {
    return err(ERROR_CODES.INVALID_EMAIL_FORMAT);
  }

  const passwordResult = validatePassword(input.password);
  if (!passwordResult.success) {
    return err(ERROR_CODES.PASSWORD_TOO_SHORT);
  }

  const matchResult = validatePasswordMatch(input.password, input.passwordConfirm);
  if (!matchResult.success) {
    return err(ERROR_CODES.PASSWORD_MISMATCH);
  }

  const nickname = input.nickname?.trim();

  return ok({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    nickname: nickname && isNotEmpty(nickname) ? nickname : undefined,
  });
};

/**
 * 로그인 입력을 검증합니다.
 * @param input - 로그인 입력
 * @returns Result<ValidatedLoginData, string>
 */
export const validateLoginInput = (
  input: LoginInput
): Result<ValidatedLoginData, string> => {
  if (!isNotEmpty(input.email)) {
    return err(ERROR_CODES.INVALID_INPUT);
  }

  if (!isNotEmpty(input.password)) {
    return err(ERROR_CODES.INVALID_INPUT);
  }

  const emailResult = validateEmail(input.email);
  if (!emailResult.success) {
    return err(ERROR_CODES.INVALID_EMAIL_FORMAT);
  }

  return ok({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
};

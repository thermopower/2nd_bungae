/**
 * 검증 유틸리티 함수
 *
 * 입력 데이터 검증을 위한 순수 함수들입니다.
 * Result 패턴을 활용하여 검증 결과를 반환합니다.
 */

import type { Result } from '@/types/common/result.types';
import { ok, err } from './result.utils';

/** 이메일 정규식 패턴 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 최소 비밀번호 길이 */
const MIN_PASSWORD_LENGTH = 8;

/** 최대 메시지 길이 */
const MAX_MESSAGE_LENGTH = 2000;

/** 최대 채팅방 이름 길이 */
const MAX_ROOM_NAME_LENGTH = 50;

/**
 * 이메일 형식이 유효한지 확인합니다.
 * @param email - 검사할 이메일
 * @returns 유효하면 true
 */
export const isValidEmail = (email: string): boolean =>
  EMAIL_REGEX.test(email);

/**
 * 비밀번호가 최소 길이를 충족하는지 확인합니다.
 * @param password - 검사할 비밀번호
 * @returns 유효하면 true
 */
export const isValidPassword = (password: string): boolean =>
  password.length >= MIN_PASSWORD_LENGTH;

/**
 * 문자열이 비어있지 않은지 확인합니다.
 * 공백만 있는 경우도 빈 문자열로 처리합니다.
 * @param value - 검사할 문자열
 * @returns 비어있지 않으면 true
 */
export const isNotEmpty = (value: string): boolean =>
  value.trim().length > 0;

/**
 * 문자열이 최대 길이 이내인지 확인합니다.
 * @param value - 검사할 문자열
 * @param maxLength - 최대 길이
 * @returns 최대 길이 이내면 true
 */
export const isWithinLength = (value: string, maxLength: number): boolean =>
  value.length <= maxLength;

/**
 * 이메일을 검증하고 Result를 반환합니다.
 * @param email - 검증할 이메일
 * @returns Result<string, string>
 */
export const validateEmail = (email: string): Result<string, string> =>
  isValidEmail(email) ? ok(email) : err('INVALID_EMAIL_FORMAT');

/**
 * 비밀번호를 검증하고 Result를 반환합니다.
 * @param password - 검증할 비밀번호
 * @returns Result<string, string>
 */
export const validatePassword = (password: string): Result<string, string> =>
  isValidPassword(password) ? ok(password) : err('PASSWORD_TOO_SHORT');

/**
 * 비밀번호 일치 여부를 검증합니다.
 * @param password - 비밀번호
 * @param confirm - 확인 비밀번호
 * @returns Result<string, string>
 */
export const validatePasswordMatch = (
  password: string,
  confirm: string
): Result<string, string> =>
  password === confirm ? ok(password) : err('PASSWORD_MISMATCH');

/**
 * 메시지 내용을 검증합니다.
 * - 빈 메시지 체크
 * - 최대 길이 체크 (2000자)
 * @param content - 메시지 내용
 * @returns Result<string, string> - 성공 시 트림된 메시지 반환
 */
export const validateMessageContent = (content: string): Result<string, string> => {
  if (!isNotEmpty(content)) {
    return err('EMPTY_MESSAGE');
  }
  if (!isWithinLength(content, MAX_MESSAGE_LENGTH)) {
    return err('MESSAGE_TOO_LONG');
  }
  return ok(content.trim());
};

/**
 * 채팅방 이름을 검증합니다.
 * - 빈 이름 체크
 * - 최대 길이 체크 (50자)
 * @param name - 채팅방 이름
 * @returns Result<string, string> - 성공 시 트림된 이름 반환
 */
export const validateRoomName = (name: string): Result<string, string> => {
  if (!isNotEmpty(name)) {
    return err('INVALID_INPUT');
  }
  if (!isWithinLength(name, MAX_ROOM_NAME_LENGTH)) {
    return err('INVALID_INPUT');
  }
  return ok(name.trim());
};

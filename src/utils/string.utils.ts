/**
 * 문자열 유틸리티 함수
 *
 * 문자열 조작 및 변환을 위한 순수 함수들입니다.
 */

/**
 * 문자열을 지정된 길이로 자르고 말줄임표를 추가합니다.
 * @param str - 자를 문자열
 * @param maxLength - 최대 길이
 * @returns 잘린 문자열 (필요 시 ...이 추가됨)
 */
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

/**
 * HTML 특수 문자를 이스케이프하여 XSS를 방지합니다.
 * @param str - 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 */
export const sanitize = (str: string): string =>
  str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

/**
 * 고유한 ID를 생성합니다.
 * @returns UUID 형식의 문자열
 */
export const generateId = (): string => crypto.randomUUID();

/**
 * 문자열의 첫 글자를 대문자로 변환합니다.
 * @param str - 변환할 문자열
 * @returns 첫 글자가 대문자인 문자열
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

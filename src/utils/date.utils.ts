/**
 * 날짜 유틸리티 함수
 *
 * 날짜 관련 포맷팅 및 변환을 위한 순수 함수들입니다.
 */

/** 시간 단위 상수 (밀리초) */
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

/**
 * ISO 문자열을 상대적인 시간 표현으로 변환합니다.
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 상대 시간 문자열 (예: "방금 전", "5분 전", "2시간 전")
 */
export const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < MINUTE) {
    return '방금 전';
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}분 전`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}시간 전`;
  }
  if (diff < DAY * 7) {
    return `${Math.floor(diff / DAY)}일 전`;
  }

  return formatDateTime(isoString);
};

/**
 * ISO 문자열을 날짜 시간 형식으로 포맷팅합니다.
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns 포맷된 날짜 문자열 (YYYY.MM.DD HH:mm)
 */
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

/**
 * 문자열이 유효한 ISO 날짜 형식인지 확인합니다.
 * @param value - 검사할 문자열
 * @returns 유효한 ISO 문자열이면 true
 */
export const isValidISOString = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Date 객체를 ISO 문자열로 변환합니다.
 * @param date - Date 객체
 * @returns ISO 8601 형식의 문자열
 */
export const toISOString = (date: Date): string => date.toISOString();

/**
 * 폴링 관련 상수 정의
 */

/** 폴링 주기 (밀리초) - 3초 */
export const POLLING_INTERVAL = 3000 as const;

/** 폴링 재시도 대기 시간 (밀리초) - 5초 */
export const POLLING_RETRY_DELAY = 5000 as const;

/** 폴링 최대 재시도 횟수 */
export const POLLING_MAX_RETRIES = 3 as const;

/** 메시지 조회 시 한 번에 가져올 개수 */
export const MESSAGE_FETCH_LIMIT = 50 as const;

/** 초기 메시지 로드 개수 */
export const INITIAL_MESSAGE_LIMIT = 50 as const;

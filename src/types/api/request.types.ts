/**
 * API 요청 타입 정의
 */

/** 로그인 요청 */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/** 회원가입 요청 */
export interface SignupRequest {
  readonly email: string;
  readonly password: string;
  readonly passwordConfirm: string;
}

/** 채팅방 생성 요청 */
export interface CreateRoomRequest {
  readonly name: string;
  readonly description?: string;
  readonly isPublic: boolean;
}

/** 메시지 전송 요청 */
export interface SendMessageRequest {
  readonly content: string;
}

/** 메시지 목록 조회 요청 */
export interface GetMessagesRequest {
  readonly after?: string;
  readonly limit?: number;
}

/** 북마크 추가 요청 */
export interface CreateBookmarkRequest {
  readonly messageId: string;
}

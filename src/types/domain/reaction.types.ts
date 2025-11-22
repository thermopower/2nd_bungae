/**
 * Reaction 도메인 타입 정의
 */

/** 리액션(좋아요) 정보 */
export interface Reaction {
  readonly id: string;
  readonly messageId: string;
  readonly userId: string;
  readonly createdAt: string;
}

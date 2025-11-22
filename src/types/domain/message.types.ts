/**
 * Message 도메인 타입 정의
 */

/** 메시지 정보 */
export interface Message {
  readonly id: string;
  readonly roomId: string;
  readonly userId: string;
  readonly content: string;
  readonly createdAt: string;
  readonly deletedAt: string | null;
}

/** 메시지 (작성자 정보 포함) */
export interface MessageWithAuthor extends Message {
  readonly author: {
    readonly id: string;
    readonly nickname: string | null;
  };
}

/** 메시지 (리액션 및 북마크 정보 포함) */
export interface MessageWithReactions extends MessageWithAuthor {
  readonly reactionCount: number;
  readonly hasReacted: boolean;
  readonly hasBookmarked: boolean;
}

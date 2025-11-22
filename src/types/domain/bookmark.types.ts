/**
 * Bookmark 도메인 타입 정의
 */

/** 북마크 정보 */
export interface Bookmark {
  readonly id: string;
  readonly messageId: string;
  readonly userId: string;
  readonly createdAt: string;
}

/** 북마크 (메시지 정보 포함) */
export interface BookmarkWithMessage extends Bookmark {
  readonly message: {
    readonly id: string;
    readonly content: string;
    readonly createdAt: string;
    readonly deletedAt: string | null;
    readonly room: {
      readonly id: string;
      readonly name: string;
    };
  };
}

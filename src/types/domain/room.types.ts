/**
 * Room 도메인 타입 정의
 */

/** 채팅방 정보 */
export interface Room {
  readonly id: string;
  readonly createdBy: string;
  readonly name: string;
  readonly description: string | null;
  readonly isPublic: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** 채팅방 멤버 */
export interface RoomMember {
  readonly id: string;
  readonly roomId: string;
  readonly userId: string;
  readonly joinedAt: string;
}

/** 채팅방 (멤버 수 포함) */
export interface RoomWithMemberCount extends Room {
  readonly memberCount: number;
}

-- Migration: Initial Schema
-- Description: 채팅 애플리케이션의 초기 데이터베이스 스키마 생성
-- Created: 2025-11-23

-- ============================================
-- 1. profiles 테이블 (auth.users 연동)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nickname TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. rooms 테이블 (채팅방)
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS rooms_created_by_idx ON rooms(created_by);
CREATE INDEX IF NOT EXISTS rooms_is_public_idx ON rooms(is_public);
CREATE INDEX IF NOT EXISTS rooms_created_at_idx ON rooms(created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER rooms_updated_at_trigger
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. room_members 테이블 (채팅방 참여자)
-- ============================================
CREATE TABLE IF NOT EXISTS room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS room_members_room_user_idx ON room_members(room_id, user_id);
CREATE INDEX IF NOT EXISTS room_members_user_id_idx ON room_members(user_id);

-- ============================================
-- 4. messages 테이블 (메시지)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX IF NOT EXISTS messages_room_created_idx ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_polling_idx ON messages(room_id, id) WHERE deleted_at IS NULL;

-- ============================================
-- 5. reactions 테이블 (좋아요)
-- ============================================
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS reactions_message_user_idx ON reactions(message_id, user_id);
CREATE INDEX IF NOT EXISTS reactions_message_id_idx ON reactions(message_id);

-- ============================================
-- 6. bookmarks 테이블 (북마크)
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_message_user_idx ON bookmarks(message_id, user_id);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id, created_at DESC);

-- ============================================
-- 7. RLS 비활성화 (Hono 계층에서 접근 제어)
-- ============================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. profiles 자동 생성 함수 (auth.users 연동)
-- ============================================
-- auth.users에 새 사용자가 생성되면 profiles에 자동으로 레코드 추가
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users INSERT 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

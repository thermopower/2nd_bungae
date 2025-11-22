/**
 * Supabase 브라우저 클라이언트 팩토리
 *
 * 클라이언트 컴포넌트에서 Supabase에 접근할 때 사용합니다.
 * 환경 변수에서 URL과 공개 키를 읽어 클라이언트를 생성합니다.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * 브라우저용 Supabase 클라이언트를 생성합니다.
 * @returns Supabase 클라이언트 인스턴스
 */
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

/** 클라이언트 타입 */
export type BrowserClient = ReturnType<typeof createClient>;

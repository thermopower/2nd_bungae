import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// 환경 변수 모킹
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

// crypto.randomUUID 폴리필
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
    },
  });
}

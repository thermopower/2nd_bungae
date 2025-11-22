# API Routes 구현 계획 (Hono 서버)

## 1. 개요

Hono 기반 API 서버 구현 계획입니다. Next.js App Router의 `app/api/[[...route]]/route.ts`에서 모든 API 요청을 처리합니다.

### 기술 스택
- Hono + @hono/vercel
- Supabase SDK (서버 전용 클라이언트)
- TypeScript

---

## 2. 구현할 파일 목록

### 2.1 서버 진입점
```
src/
├── app/api/[[...route]]/route.ts   # Hono catch-all handler
└── server/
    ├── index.ts                     # Hono 앱 인스턴스 및 라우트 등록
    ├── routes/
    │   ├── auth.routes.ts           # 인증 관련 라우트
    │   ├── rooms.routes.ts          # 채팅방 관련 라우트
    │   ├── messages.routes.ts       # 메시지 관련 라우트
    │   ├── reactions.routes.ts      # 리액션 관련 라우트
    │   └── bookmarks.routes.ts      # 북마크 관련 라우트
    ├── handlers/
    │   ├── auth.handler.ts          # 인증 핸들러
    │   ├── rooms.handler.ts         # 채팅방 핸들러
    │   ├── messages.handler.ts      # 메시지 핸들러
    │   ├── reactions.handler.ts     # 리액션 핸들러
    │   └── bookmarks.handler.ts     # 북마크 핸들러
    └── middleware/
        ├── auth.middleware.ts       # 인증 미들웨어
        ├── rateLimit.middleware.ts  # Rate Limit 미들웨어
        └── errorHandler.middleware.ts # 에러 핸들러 미들웨어
```

### 2.2 비즈니스 로직
```
src/services/
├── auth/
│   ├── auth.service.ts              # 인증 비즈니스 로직
│   └── auth.validator.ts            # 인증 입력 검증
├── room/
│   ├── room.service.ts              # 채팅방 비즈니스 로직
│   └── room.validator.ts            # 채팅방 입력 검증
├── message/
│   ├── message.service.ts           # 메시지 비즈니스 로직
│   ├── message.validator.ts         # 메시지 입력 검증
│   └── message.transformer.ts       # 메시지 데이터 변환
├── reaction/
│   ├── reaction.service.ts          # 리액션 비즈니스 로직
│   └── reaction.validator.ts        # 리액션 입력 검증
└── bookmark/
    ├── bookmark.service.ts          # 북마크 비즈니스 로직
    └── bookmark.validator.ts        # 북마크 입력 검증
```

### 2.3 데이터 접근
```
src/repositories/
├── base.repository.ts               # 공통 Repository 유틸
├── user.repository.ts               # 사용자 데이터 접근
├── room.repository.ts               # 채팅방 데이터 접근
├── roomMember.repository.ts         # 채팅방 멤버 데이터 접근
├── message.repository.ts            # 메시지 데이터 접근
├── reaction.repository.ts           # 리액션 데이터 접근
└── bookmark.repository.ts           # 북마크 데이터 접근
```

---

## 3. 상세 구현 내용

### 3.1 Hono 진입점 (app/api/[[...route]]/route.ts)

```typescript
// src/app/api/[[...route]]/route.ts
import { handle } from '@hono/vercel';
import { app } from '@/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
```

### 3.2 Hono 앱 인스턴스 (server/index.ts)

```typescript
// src/server/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { authRoutes } from './routes/auth.routes';
import { roomsRoutes } from './routes/rooms.routes';
import { messagesRoutes } from './routes/messages.routes';
import { reactionsRoutes } from './routes/reactions.routes';
import { bookmarksRoutes } from './routes/bookmarks.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

// 환경 변수 타입
type Env = {
  Variables: {
    user: { id: string; email: string } | null;
  };
};

export const app = new Hono<Env>().basePath('/api');

// 공통 미들웨어
app.use('*', logger());
app.use('*', cors());
app.onError(errorHandler);

// 라우트 등록
app.route('/auth', authRoutes);
app.route('/rooms', roomsRoutes);
app.route('/messages', messagesRoutes);
app.route('/bookmarks', bookmarksRoutes);

// 헬스 체크
app.get('/health', (c) => c.json({ status: 'ok' }));
```

### 3.3 인증 미들웨어 (server/middleware/auth.middleware.ts)

```typescript
// src/server/middleware/auth.middleware.ts
import { createMiddleware } from 'hono/factory';
import { createServerClient } from '@/external/supabase/server';

type Env = {
  Variables: {
    user: { id: string; email: string } | null;
  };
};

// 인증 필수 미들웨어
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' }
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createServerClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' }
    }, 401);
  }

  c.set('user', { id: user.id, email: user.email ?? '' });
  await next();
});

// 선택적 인증 미들웨어 (인증 정보가 있으면 설정)
export const optionalAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser(token);

    if (user) {
      c.set('user', { id: user.id, email: user.email ?? '' });
    }
  }

  await next();
});
```

### 3.4 에러 핸들러 미들웨어

```typescript
// src/server/middleware/errorHandler.middleware.ts
import { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Server error:', err);

  // 알려진 에러 타입 처리
  if (err instanceof ValidationError) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message }
    }, 400);
  }

  if (err instanceof NotFoundError) {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: err.message }
    }, 404);
  }

  if (err instanceof UnauthorizedError) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: err.message }
    }, 401);
  }

  // 알 수 없는 에러
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' }
  }, 500);
};

// 커스텀 에러 클래스
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

---

## 4. API 엔드포인트별 상세 구현

### 4.1 인증 API

```typescript
// src/server/routes/auth.routes.ts
import { Hono } from 'hono';
import { authHandler } from '../handlers/auth.handler';

export const authRoutes = new Hono()
  .post('/signup', authHandler.signup)
  .post('/login', authHandler.login)
  .post('/logout', authHandler.logout)
  .get('/session', authHandler.getSession);
```

```typescript
// src/server/handlers/auth.handler.ts
import { Context } from 'hono';
import { authService } from '@/services/auth/auth.service';
import { validateSignupInput, validateLoginInput } from '@/services/auth/auth.validator';

export const authHandler = {
  // POST /api/auth/signup
  signup: async (c: Context) => {
    const body = await c.req.json();

    // 입력 검증
    const validation = validateSignupInput(body);
    if (!validation.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error }
      }, 400);
    }

    // 회원가입 처리
    const result = await authService.signup(validation.data);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 400);
    }

    return c.json({
      success: true,
      data: { user: result.data.user }
    }, 201);
  },

  // POST /api/auth/login
  login: async (c: Context) => {
    const body = await c.req.json();

    const validation = validateLoginInput(body);
    if (!validation.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error }
      }, 400);
    }

    const result = await authService.login(validation.data);

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error
      }, 401);
    }

    return c.json({
      success: true,
      data: {
        user: result.data.user,
        accessToken: result.data.accessToken
      }
    });
  },

  // POST /api/auth/logout
  logout: async (c: Context) => {
    const authHeader = c.req.header('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      await authService.logout(token);
    }

    return c.json({ success: true });
  },

  // GET /api/auth/session
  getSession: async (c: Context) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: true, data: { user: null } });
    }

    const token = authHeader.slice(7);
    const result = await authService.getSession(token);

    return c.json({
      success: true,
      data: { user: result.success ? result.data : null }
    });
  },
};
```

### 4.2 채팅방 API

```typescript
// src/server/routes/rooms.routes.ts
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.middleware';
import { roomsHandler } from '../handlers/rooms.handler';
import { messagesHandler } from '../handlers/messages.handler';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const roomsRoutes = new Hono<Env>()
  // 인증 필요
  .use('*', requireAuth)

  // 채팅방 목록/생성
  .get('/', roomsHandler.getList)
  .post('/', roomsHandler.create)

  // 채팅방 상세
  .get('/:roomId', roomsHandler.getDetail)

  // 채팅방 참여
  .post('/:roomId/join', roomsHandler.join)
  .delete('/:roomId/leave', roomsHandler.leave)

  // 메시지 (채팅방 하위)
  .get('/:roomId/messages', messagesHandler.getList)
  .post('/:roomId/messages', messagesHandler.create);
```

```typescript
// src/server/handlers/rooms.handler.ts
import { Context } from 'hono';
import { roomService } from '@/services/room/room.service';
import { validateCreateRoomInput } from '@/services/room/room.validator';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const roomsHandler = {
  // GET /api/rooms
  getList: async (c: Context<Env>) => {
    const user = c.get('user');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') ?? '1', 10);
    const limit = parseInt(c.req.query('limit') ?? '20', 10);

    const result = await roomService.getList({
      userId: user.id,
      search,
      page,
      limit,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: {
        rooms: result.data.rooms,
        hasMore: result.data.hasMore,
        total: result.data.total,
      },
    });
  },

  // POST /api/rooms
  create: async (c: Context<Env>) => {
    const user = c.get('user');
    const body = await c.req.json();

    const validation = validateCreateRoomInput(body);
    if (!validation.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error }
      }, 400);
    }

    const result = await roomService.create({
      ...validation.data,
      createdBy: user.id,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      data: { room: result.data }
    }, 201);
  },

  // GET /api/rooms/:roomId
  getDetail: async (c: Context<Env>) => {
    const user = c.get('user');
    const roomId = c.req.param('roomId');

    const result = await roomService.getDetail(roomId, user.id);

    if (!result.success) {
      const status = result.error.code === 'ROOM_NOT_FOUND' ? 404 : 500;
      return c.json({ success: false, error: result.error }, status);
    }

    return c.json({
      success: true,
      data: { room: result.data }
    });
  },

  // POST /api/rooms/:roomId/join
  join: async (c: Context<Env>) => {
    const user = c.get('user');
    const roomId = c.req.param('roomId');

    const result = await roomService.join(roomId, user.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({ success: true });
  },

  // DELETE /api/rooms/:roomId/leave
  leave: async (c: Context<Env>) => {
    const user = c.get('user');
    const roomId = c.req.param('roomId');

    const result = await roomService.leave(roomId, user.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({ success: true });
  },
};
```

### 4.3 메시지 API

```typescript
// src/server/routes/messages.routes.ts
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.middleware';
import { messagesHandler } from '../handlers/messages.handler';
import { reactionsRoutes } from './reactions.routes';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const messagesRoutes = new Hono<Env>()
  .use('*', requireAuth)

  // 메시지 삭제
  .delete('/:messageId', messagesHandler.delete)

  // 리액션 (메시지 하위)
  .route('/:messageId/reactions', reactionsRoutes)

  // 북마크 (메시지 하위)
  .post('/:messageId/bookmarks', messagesHandler.toggleBookmark);
```

```typescript
// src/server/handlers/messages.handler.ts
import { Context } from 'hono';
import { messageService } from '@/services/message/message.service';
import { validateMessageContent } from '@/services/message/message.validator';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const messagesHandler = {
  // GET /api/rooms/:roomId/messages
  getList: async (c: Context<Env>) => {
    const user = c.get('user');
    const roomId = c.req.param('roomId');
    const after = c.req.query('after'); // 폴링용: 이 ID 이후 메시지만 조회
    const limit = parseInt(c.req.query('limit') ?? '50', 10);

    const result = await messageService.getList({
      roomId,
      userId: user.id,
      after,
      limit,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: { messages: result.data },
    });
  },

  // POST /api/rooms/:roomId/messages
  create: async (c: Context<Env>) => {
    const user = c.get('user');
    const roomId = c.req.param('roomId');
    const body = await c.req.json();

    const validation = validateMessageContent(body.content);
    if (!validation.success) {
      return c.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error }
      }, 400);
    }

    const result = await messageService.create({
      roomId,
      userId: user.id,
      content: validation.data,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      data: { message: result.data }
    }, 201);
  },

  // DELETE /api/messages/:messageId
  delete: async (c: Context<Env>) => {
    const user = c.get('user');
    const messageId = c.req.param('messageId');

    const result = await messageService.delete(messageId, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 :
                     result.error.code === 'PERMISSION_DENIED' ? 403 : 500;
      return c.json({ success: false, error: result.error }, status);
    }

    return c.json({ success: true });
  },

  // POST /api/messages/:messageId/bookmarks
  toggleBookmark: async (c: Context<Env>) => {
    const user = c.get('user');
    const messageId = c.req.param('messageId');

    const result = await messageService.toggleBookmark(messageId, user.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      data: { isBookmarked: result.data.isBookmarked },
    });
  },
};
```

### 4.4 리액션 API

```typescript
// src/server/routes/reactions.routes.ts
import { Hono } from 'hono';
import { reactionsHandler } from '../handlers/reactions.handler';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const reactionsRoutes = new Hono<Env>()
  .post('/', reactionsHandler.toggle);
```

```typescript
// src/server/handlers/reactions.handler.ts
import { Context } from 'hono';
import { reactionService } from '@/services/reaction/reaction.service';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const reactionsHandler = {
  // POST /api/messages/:messageId/reactions (토글)
  toggle: async (c: Context<Env>) => {
    const user = c.get('user');
    const messageId = c.req.param('messageId');

    const result = await reactionService.toggle(messageId, user.id);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      data: {
        isReacted: result.data.isReacted,
        count: result.data.count,
      },
    });
  },
};
```

### 4.5 북마크 API

```typescript
// src/server/routes/bookmarks.routes.ts
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.middleware';
import { bookmarksHandler } from '../handlers/bookmarks.handler';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const bookmarksRoutes = new Hono<Env>()
  .use('*', requireAuth)

  .get('/', bookmarksHandler.getList)
  .delete('/:bookmarkId', bookmarksHandler.remove);
```

```typescript
// src/server/handlers/bookmarks.handler.ts
import { Context } from 'hono';
import { bookmarkService } from '@/services/bookmark/bookmark.service';

type Env = {
  Variables: {
    user: { id: string; email: string };
  };
};

export const bookmarksHandler = {
  // GET /api/bookmarks
  getList: async (c: Context<Env>) => {
    const user = c.get('user');
    const page = parseInt(c.req.query('page') ?? '1', 10);
    const limit = parseInt(c.req.query('limit') ?? '20', 10);

    const result = await bookmarkService.getList({
      userId: user.id,
      page,
      limit,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    return c.json({
      success: true,
      data: {
        bookmarks: result.data.bookmarks,
        hasMore: result.data.hasMore,
      },
    });
  },

  // DELETE /api/bookmarks/:bookmarkId
  remove: async (c: Context<Env>) => {
    const user = c.get('user');
    const bookmarkId = c.req.param('bookmarkId');

    const result = await bookmarkService.remove(bookmarkId, user.id);

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 :
                     result.error.code === 'PERMISSION_DENIED' ? 403 : 500;
      return c.json({ success: false, error: result.error }, status);
    }

    return c.json({ success: true });
  },
};
```

---

## 5. Service 레이어 예시

### 5.1 인증 서비스

```typescript
// src/services/auth/auth.service.ts
import { createServerClient } from '@/external/supabase/server';
import { userRepository } from '@/repositories/user.repository';
import { Result, success, failure } from '@/types/common/result.types';
import { User } from '@/types/domain/user.types';

interface SignupInput {
  readonly email: string;
  readonly password: string;
}

interface LoginInput {
  readonly email: string;
  readonly password: string;
}

interface AuthResult {
  readonly user: User;
  readonly accessToken: string;
}

export const authService = {
  signup: async (input: SignupInput): Promise<Result<AuthResult>> => {
    const supabase = createServerClient();

    // Supabase Auth로 회원가입
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user) {
      return failure({
        code: 'SIGNUP_FAILED',
        message: error?.message ?? '회원가입에 실패했습니다.',
      });
    }

    // profiles 테이블에 사용자 정보 생성
    const profile = await userRepository.create({
      id: data.user.id,
      email: input.email,
    });

    if (!profile.success) {
      return failure(profile.error);
    }

    return success({
      user: profile.data,
      accessToken: data.session?.access_token ?? '',
    });
  },

  login: async (input: LoginInput): Promise<Result<AuthResult>> => {
    const supabase = createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user || !data.session) {
      return failure({
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const profile = await userRepository.findById(data.user.id);

    if (!profile.success || !profile.data) {
      return failure({
        code: 'USER_NOT_FOUND',
        message: '사용자 정보를 찾을 수 없습니다.',
      });
    }

    return success({
      user: profile.data,
      accessToken: data.session.access_token,
    });
  },

  logout: async (token: string): Promise<Result<void>> => {
    const supabase = createServerClient();
    await supabase.auth.signOut();
    return success(undefined);
  },

  getSession: async (token: string): Promise<Result<User>> => {
    const supabase = createServerClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return failure({
        code: 'INVALID_SESSION',
        message: '유효하지 않은 세션입니다.',
      });
    }

    const profile = await userRepository.findById(user.id);

    if (!profile.success || !profile.data) {
      return failure({
        code: 'USER_NOT_FOUND',
        message: '사용자 정보를 찾을 수 없습니다.',
      });
    }

    return success(profile.data);
  },
};
```

### 5.2 인증 검증기

```typescript
// src/services/auth/auth.validator.ts
import { isValidEmail, isValidPassword } from '@/utils/validation.utils';

interface SignupInput {
  readonly email: string;
  readonly password: string;
}

interface ValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export const validateSignupInput = (input: unknown): ValidationResult<SignupInput> => {
  if (!input || typeof input !== 'object') {
    return { success: false, error: '잘못된 입력입니다.' };
  }

  const { email, password } = input as Record<string, unknown>;

  if (typeof email !== 'string' || !isValidEmail(email)) {
    return { success: false, error: '유효한 이메일 주소를 입력해주세요.' };
  }

  if (typeof password !== 'string' || !isValidPassword(password)) {
    return { success: false, error: '비밀번호는 8자 이상이어야 합니다.' };
  }

  return { success: true, data: { email, password } };
};

export const validateLoginInput = (input: unknown): ValidationResult<SignupInput> => {
  if (!input || typeof input !== 'object') {
    return { success: false, error: '잘못된 입력입니다.' };
  }

  const { email, password } = input as Record<string, unknown>;

  if (typeof email !== 'string' || email.trim() === '') {
    return { success: false, error: '이메일을 입력해주세요.' };
  }

  if (typeof password !== 'string' || password === '') {
    return { success: false, error: '비밀번호를 입력해주세요.' };
  }

  return { success: true, data: { email, password } };
};
```

---

## 6. Repository 레이어 예시

```typescript
// src/repositories/user.repository.ts
import { createServerClient } from '@/external/supabase/server';
import { Result, success, failure } from '@/types/common/result.types';
import { User } from '@/types/domain/user.types';
import { DbProfile } from '@/external/supabase/types';

// DB 모델 -> 도메인 모델 변환
const mapToUser = (profile: DbProfile): User => ({
  id: profile.id,
  email: profile.email,
  nickname: profile.nickname,
  createdAt: profile.created_at,
});

export const userRepository = {
  findById: async (id: string): Promise<Result<User | null>> => {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return success(null);
      }
      return failure({
        code: 'FETCH_FAILED',
        message: '사용자 조회에 실패했습니다.',
      });
    }

    return success(mapToUser(data));
  },

  create: async (input: { id: string; email: string }): Promise<Result<User>> => {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: input.id,
        email: input.email,
      })
      .select()
      .single();

    if (error) {
      return failure({
        code: 'CREATE_FAILED',
        message: '사용자 생성에 실패했습니다.',
      });
    }

    return success(mapToUser(data));
  },
};
```

---

## 7. 의존성 및 구현 순서

### 7.1 구현 순서

1. **인프라 설정** (1단계)
   - `src/app/api/[[...route]]/route.ts`
   - `src/server/index.ts`
   - `src/server/middleware/errorHandler.middleware.ts`
   - `src/server/middleware/auth.middleware.ts`

2. **Repository 레이어** (2단계)
   - `src/repositories/base.repository.ts`
   - `src/repositories/user.repository.ts`
   - `src/repositories/room.repository.ts`
   - `src/repositories/roomMember.repository.ts`
   - `src/repositories/message.repository.ts`
   - `src/repositories/reaction.repository.ts`
   - `src/repositories/bookmark.repository.ts`

3. **Service 레이어** (3단계)
   - `src/services/auth/*`
   - `src/services/room/*`
   - `src/services/message/*`
   - `src/services/reaction/*`
   - `src/services/bookmark/*`

4. **API 레이어** (4단계)
   - `src/server/handlers/*`
   - `src/server/routes/*`

### 7.2 의존성 방향

```
Routes -> Handlers -> Services -> Repositories -> External (Supabase)
           |                           |
           v                           v
     Middleware                   Domain Types
```

---

## 8. 테스트 계획

### 8.1 단위 테스트

- Validator 함수 테스트
- Service 로직 테스트 (Repository 모킹)
- Repository 테스트 (Supabase 모킹)

### 8.2 통합 테스트

- API 엔드포인트 테스트
- 인증 플로우 테스트
- CRUD 작업 테스트

### 8.3 테스트 파일 구조

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── room.service.test.ts
│   │   └── message.service.test.ts
│   └── validators/
│       ├── auth.validator.test.ts
│       └── room.validator.test.ts
└── integration/
    └── api/
        ├── auth.test.ts
        ├── rooms.test.ts
        └── messages.test.ts
```

---

## 9. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |

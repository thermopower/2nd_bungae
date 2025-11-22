# 0. 개요

## 0-1. 대상 기술 & LTS 정책

* **프론트엔드 프레임워크**
  * Next.js **App Router 기준**
  * 권장 버전: **Next.js 16.x (Active LTS)** 또는 **Next.js 15.x (Maintenance LTS)**
* **Node.js 런타임 (LTS)**
  * 권장: **Node.js 22 LTS** 또는 **Node.js 24 LTS**
  * 최소: **Node.js 20.9 이상**
  * **Node 18은 2025-04-30 EOL**이므로 신규 환경에서는 사용하지 않는다.
* **Supabase 클라이언트**
  * `@supabase/supabase-js` **v2.x (최신 안정 버전)**
  * `@supabase/ssr` (Next.js App Router + SSR/클라이언트 통합용 헬퍼)

## 0-2. 연동 수단 요약

1. **SDK 연동 (권장 기본 수단)**
   * 수단: `@supabase/supabase-js` + `@supabase/ssr`
   * 용도:
     * Next.js 앱 내부에서 인증/쿼리/폴링 등 대부분의 기능 처리
     * 특히 **클라이언트 폴링 기반 채팅 UI** 구현
2. **REST API 연동 (서버-서버/타 서비스 연계용)**
   * 수단: Supabase에서 자동 제공하는 **PostgREST API** / Auth / Storage API
   * 용도:
     * 별도 백엔드 서비스, 배치, 크론 등이 Supabase 데이터에 접근해야 할 때
3. **Webhook 연동 (Supabase → 우리 서비스 방향 이벤트)**
   * 수단: **Database Webhook** 또는 Edge Function 트리거
   * 용도:
     * 예: `messages` 테이블에 새 메시지가 추가될 때 우리 서버의 **Webhook 엔드포인트로 POST** 호출

## 0-3. Hono 미들웨어 & 보안 전략

* Supabase와의 모든 데이터 통신은 Next.js App Router의 `app/api/*` 라우트에서 실행되는 **Hono 애플리케이션이 반드시 경유**한다.
* Row Level Security(RLS)는 비활성화 상태로 운영하며, **세션 검증·권한 필터링·Rate Limit·감사 로깅은 Hono 계층에서 처리**한다.
* Supabase **Service Role Key는 Next.js 서버 환경 변수에만 저장**하며, React 클라이언트나 브라우저 번들에는 절대 포함하지 않는다.
* React 클라이언트는 `/api/*` 형태의 Hono 엔드포인트를 호출하고, Hono가 Supabase REST 혹은 SDK 호출을 대리 실행한 뒤 정제된 응답만 반환한다.
* Hono는 모든 입력을 순수 함수 조합으로 검증/정규화한 뒤 Supabase로 전달해, 비즈니스 규칙 누락 시에도 잘못된 데이터가 DB에 쓰이지 않도록 한다.

---

# 1. 공통: 환경 변수 & 인증 키 정책

Supabase 프로젝트 기반으로 반드시 준비해야 하는 값:

* **Project URL**
* **Publishable(anon) Key** – 클라이언트에서 사용할 수 있는 공개 키
* **Service Role Key** – 서버에서만 사용하는 고권한 키 (절대 클라이언트에 노출 금지)

## 1-1. `.env.local` 예시 (Next.js 프로젝트)

```bash
# 클라이언트 & 서버 공통 사용 (공개 가능)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-public-key>

# 서버 전용 (절대 NEXT_PUBLIC 접두사로 노출하지 않음)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # API/백엔드용
SUPABASE_WEBHOOK_SECRET=<random-secret-for-webhook> # Webhook 검증용
```

* `NEXT_PUBLIC_` 접두사가 붙은 값은 **브라우저에서 접근 가능**하다.
* `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_WEBHOOK_SECRET` 등은
  **반드시 서버 전용 환경 변수로만 사용**해야 한다.

---

# 2. SDK 연동 (`@supabase/supabase-js` + `@supabase/ssr`)

## 2-1. 수단 & 사용할 기능

* **수단**
  * `@supabase/supabase-js` (핵심 SDK)
  * `@supabase/ssr` (Next.js App Router용 SSR/클라이언트 헬퍼)
* **사용할 기능**
  * `messages` 테이블 조회 (예: 채팅 메시지)
  * 클라이언트에서 **폴링 기반 실시간 화면 갱신**
  * (확장 가능) 인증, 다른 테이블 CRUD, Storage 등

> ⚠️ **운영 환경에서는 React 클라이언트가 Supabase SDK를 직접 호출하지 않는다.**  
> SDK 예시는 프로토타입/스토리북/테스트 용도이며, 실제 데이터 흐름은 항상 Hono 서버가 대리 호출한다.

## 2-2. 설치 / 세팅 개요

### 2-2-1. 라이브러리 설치

```bash
npm install @supabase/supabase-js @supabase/ssr
```

> 전제: Node 20.9+ / Next 15 or 16 프로젝트

### 2-2-2. Supabase 클라이언트 팩토리

**파일: `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

* 모든 **클라이언트 컴포넌트**에서 이 함수로 Supabase 인스턴스를 생성/재사용
* URL / 키는 **환경 변수에서만 로딩** (하드코딩 X)

> 운영 배포에서는 이 팩토리를 Hono 서버 측 버전(`createClient` or `createServerClient`)으로 변형해 사용하고,  
> 브라우저 번들에는 Supabase 키를 포함하지 않는다.

### 2-2-3. 예시 테이블: `messages`

Supabase Table Editor에서 다음 스키마를 사용:

* `id`: `int8` (PK, auto increment)
* `created_at`: `timestamptz` (default: now())
* `content`: `text`
* `user_name`: `text`

테스트를 위해 몇 개의 기록을 **수동 Insert** 해 둔다.

## 2-3. 인증정보 관리 방법 (SDK 관점)

* 클라이언트 SDK에서 사용할 키:
  * **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**
    → Supabase 대시보드의 **anon/public key**와 동일
* 서버에서만 Service Role 키를 사용할 경우:
  * Route Handler, 서버 컴포넌트에서 `createClient` 변형을 만들어
    `SUPABASE_SERVICE_ROLE_KEY`를 사용

중요 원칙:

* **브라우저에서 절대 Service Role Key 사용 금지**
* 클라이언트는 항상 **RLS가 적용된 anon/publishable key**만 사용

## 2-4. 호출 방식 (클라이언트 폴링 예시)

### 2-4-1. 클라이언트 컴포넌트 예시

**파일: `app/chat-client.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ChatClient() {
  const supabase = createClient()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <p>Loading messages...</p>
  }

  return (
    <div>
      <h1>Real-time Chat (via Polling)</h1>
      <div className="chat-list">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-item">
            <strong>{msg.user_name || 'User'}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2-4-2. 페이지에 연결

**파일: `app/page.tsx`**

```tsx
import ChatClient from './chat-client'

export default function HomePage() {
  return (
    <main className="p-8">
      <ChatClient />
    </main>
  )
}
```

### 2-5. Hono 미들웨어 내 SDK 사용 예시 (Next.js App Router)

운영 환경에서는 Next.js `app/api/*` 라우트 안에서 Hono 서버가 Supabase SDK를 대신 호출한다. Hono는 세션을 검증한 뒤, 서비스 롤 키로 Supabase에 접근하고 정제된 응답을 반환한다.

**파일: `app/api/messages/route.ts`**

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { createClient } from '@supabase/supabase-js'

type Variables = {
  user: { id: string; workspaceId: string }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { global: { fetch } }
)

const app = new Hono<{ Variables: Variables }>()

function ensureSession(c: Parameters<typeof app.get>[0]) {
  const user = c.get('user')
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

app.get('/', async (c) => {
  const user = ensureSession(c)

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('workspace_id', user.workspaceId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return c.json({ error: 'FAILED_TO_FETCH_MESSAGES' }, 500)
  }

  return c.json({ messages: data })
})

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const GET = handle(app)
```

* `ensureSession`과 같은 순수 함수를 조합해 인증·권한 로직을 재사용한다.
* 해당 라우트는 Next.js가 제공하는 `/api/messages`에서 실행되며, React 클라이언트는 여기에만 요청을 보낸다.

---

# 3. REST API 연동 (PostgREST / Auth / Storage 등)

> 이 섹션은 “별도 백엔드나 서버-서버 호출” 등을 할 때 사용할 수단을 정의한다.  
> 현재 채팅 UI 전체는 SDK로 처리되며, **외부 시스템에서 Supabase 데이터를 읽거나 쓸 필요**가 있을 때 REST API를 사용한다.

## 3-1. 수단 & 사용할 기능

* **수단**
  * Supabase에서 제공하는 자동 REST API (PostgREST)
    * 베이스 URL: `https://<project-ref>.supabase.co/rest/v1`
  * 필요한 경우 Auth API, Storage API도 동일한 베이스 URL 체계
* **사용할 기능 (예시)**
  * `messages` 테이블 조회/삽입
  * 관리용 백오피스/배치에서 데이터 접근
  * 서버-서버 통신에서 Supabase를 “DB-as-API”로 사용

## 3-2. 설치 / 세팅 개요

* **추가 라이브러리 설치 필요 없음** (기본 `fetch`로 호출 가능)
* Supabase 대시보드에서:
  * `messages` 테이블 생성 (SDK에서와 동일)
  * Row Level Security(RLS)는 **비활성화 상태를 유지**하고, 텓별 접근 제어는 Hono에서 구현
  * Service Role Key를 사용하는 모든 호출은 Hono 내부 순수 함수로 래핑하여 재사용

## 3-3. 인증정보 관리 방법 (API 관점)

REST API 호출 시 헤더:

```http
apikey: <키 값>
Authorization: Bearer <키 값>
```

* **클라이언트에서의 접근**
  * 운영 환경에서는 React 클라이언트가 Supabase REST를 직접 호출하지 않고, `/api/*` 형태의 Hono 엔드포인트만 호출한다.
  * 디자인 시연/프로토타입에서만 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 노출을 허용하며, 이때도 읽기 전용 최소 권한으로 제한한다.
* **백엔드/Hono 계층 호출**
  * 모든 Supabase REST 호출은 Hono 서버가 **`SUPABASE_SERVICE_ROLE_KEY`**로 실행하며, 사전에 세션 검증/입력 정규화/감사 로깅을 수행한다.
  * 해당 키는 서버 환경 변수에만 보관하고, 로그·모니터링 시스템에도 평문으로 남기지 않는다.

## 3-4. 호출 방식 예시

### 3-4-1. Next.js Route Handler에서 서버-사이드 호출

**파일: `app/api/messages/route.js`**

```javascript
import { NextResponse } from 'next/server'

export async function GET() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: 'order=created_at.desc,limit=10',
    },
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: res.status }
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
```

### 3-4-2. 외부 서비스에서 Node.js로 호출 (예: 배치 작업)

```javascript
import fetch from 'node-fetch'

async function insertMessage(content, userName) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/messages`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ content, user_name: userName }),
  })

  if (!res.ok) {
    throw new Error(`Failed to insert: ${res.status}`)
  }

  return res.json()
}
```

---

# 4. Webhook 연동 (Supabase → 우리 서비스)

> 이 섹션은 Supabase에서 **이벤트가 발생했을 때 우리 서버로 HTTP 요청을 보내는 방식**을 정의한다.  
> 예: `messages` 테이블에 새 행이 추가되면 우리 Next.js 앱의 `/api/supabase-webhook`으로 POST.

## 4-1. 수단 & 사용할 기능

* **수단**
  * Supabase **Database Webhooks** 또는
  * Edge Functions / Trigger → 우리 서비스 HTTP Endpoint
* **사용할 기능 (예시)**
  * `messages` 테이블에 **INSERT 발생 시**
    * 우리 서비스로 이벤트 전송
    * 예: 알림 발송, 외부 시스템 동기화, 로그 적재 등

## 4-2. 설치 / 세팅 개요

### 4-2-1. Supabase 대시보드에서 Webhook 설정

1. Supabase 대시보드 접속 → 프로젝트 선택
2. **Database/Webhooks** 메뉴로 이동
3. 새 Webhook 생성:
   * **대상 테이블:** `messages`
   * **이벤트 종류:** `INSERT` (필요 시 UPDATE/DELETE 추가)
   * **Webhook URL:** `https://<our-domain>/api/supabase-webhook`
   * 추가 헤더:
     * `X-Webhook-Secret: <임의의 비밀 값>`
       (이 값은 `SUPABASE_WEBHOOK_SECRET` 환경 변수와 동일하게 맞춘다)

### 4-2-2. Next.js 측에서 Webhook 엔드포인트 구현

**파일: `app/api/supabase-webhook/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()

  console.log('Received Supabase webhook:', payload)
  // TODO: 알림 발송, 외부 API 호출, 로그 적재 등 처리

  return NextResponse.json({ ok: true })
}
```

## 4-3. 인증정보 관리 방법 (Webhook 관점)

* 인증 방법은 간단하게 **공유 비밀(Shared Secret)** 로 처리:
  * Supabase Webhook 설정에 `X-Webhook-Secret` 헤더 값을 입력
  * 우리 서버 `.env.local`에 동일 값을 `SUPABASE_WEBHOOK_SECRET`으로 저장
* 검증 로직:
  * 엔드포인트에서 `request.headers.get('x-webhook-secret')`로 값 읽기
  * 환경 변수와 일치 여부를 비교
* 필요 시:
  * 추후 HMAC 서명(signing) 방식으로 확장 가능 (payload + timestamp를 서명하고 서버에서 검증)

## 4-4. 호출 방식 (Supabase → 우리 서버)

Supabase가 내부적으로 호출하는 HTTP 요청은 다음과 유사하다.

```http
POST /api/supabase-webhook HTTP/1.1
Host: our-domain.com
Content-Type: application/json
X-Webhook-Secret: <SUPABASE_WEBHOOK_SECRET>

{
  "type": "INSERT",
  "table": "messages",
  "record": {
    "id": 123,
    "content": "hello",
    "user_name": "Alice",
    "created_at": "2025-11-17T01:23:45Z"
  },
  "old_record": null
}
```

우리 서버는 `route.ts`에서 이 JSON을 받아 적절히 처리하면 된다.

---

# 5. 정리

* **SDK 연동**
  * 수단: `@supabase/supabase-js` + `@supabase/ssr`
  * 사용 기능: 인증, DB CRUD, 폴링 기반 메시지 조회
  * 설치/세팅: npm 설치 → `.env.local` 설정 → `lib/supabase/client.ts` 생성
  * 인증 관리: 프로토타입/테스트에서는 `NEXT_PUBLIC_SUPABASE_*`를 사용하고, 운영에서는 Hono 서버 버전만 배포한다.
  * 호출: (프로토타입) 클라이언트 컴포넌트에서 `createClient()` 호출 / (운영) Hono 순수 함수가 SDK 호출을 대리한다.

* **REST API 연동**
  * 수단: Supabase REST (PostgREST) / Auth / Storage API
  * 사용 기능: 서버-서버/외부 서비스에서 `messages` 등 테이블 접근
  * 설치/세팅: 별도 라이브러리 없이 `fetch` 사용, RLS는 비활성화 상태 유지
  * 인증 관리: 모든 운영 호출은 Hono 서버의 `SUPABASE_SERVICE_ROLE_KEY`로 실행하고, 키는 서버 환경 변수에만 저장
  * 호출: `fetch(<SUPABASE_URL>/rest/v1/..., { headers: { apikey, Authorization } })`

* **Webhook 연동**
  * 수단: Database Webhook / Edge Function 트리거
  * 사용 기능: `messages` INSERT 등 이벤트 발생 시 우리 서버에 POST
  * 설치/세팅: Supabase 대시보드에서 Webhook 구성 + Next.js `app/api/supabase-webhook/route.ts`
  * 인증 관리: `X-Webhook-Secret` 헤더 + `SUPABASE_WEBHOOK_SECRET` 환경 변수로 단순 Shared Secret 검증
  * 호출: Supabase가 자동으로 설정한 URL로 JSON payload를 POST하고, Hono가 이를 파싱해 내부 서비스로 전달

* **Hono 미들웨어**
  * 수단: Next.js `app/api/*` 라우트 + `@hono/vercel` + Vercel Serverless Functions
  * 역할: 모든 React 요청을 받아 세션을 검증하고 Supabase REST/SDK 호출을 대리 실행
  * 인증 관리: `SUPABASE_SERVICE_ROLE_KEY`를 서버 전용 환경 변수로만 보관하고, 감사 로그에는 민감 정보를 남기지 않음
  * 호출: `/api/*` 엔드포인트를 통해 React → Hono → Supabase 순서로 데이터가 흐른다.

---

# 랜딩 페이지 구현 계획

## 1. 개요

서비스 소개 및 로그인/가입 진입점을 제공하는 랜딩 페이지입니다.

### 페이지 정보
- **경로**: `/`
- **인증 필요**: X (공개 페이지)
- **상태관리**: 불필요 (정적 페이지)

---

## 2. 구현할 파일 목록

```
src/app/
├── page.tsx                     # 랜딩 페이지
└── layout.tsx                   # 루트 레이아웃 (이미 존재하면 수정)

src/components/features/landing/
├── HeroSection.tsx              # 히어로 섹션
├── FeatureSection.tsx           # 기능 소개 섹션
├── CTASection.tsx               # CTA (Call to Action) 섹션
└── index.ts                     # 내보내기
```

---

## 3. 상세 구현 내용

### 3.1 랜딩 페이지 (app/page.tsx)

```typescript
// src/app/page.tsx
import { HeroSection, FeatureSection, CTASection } from '@/components/features/landing';
import { Header } from '@/components/layout/Header';

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeatureSection />
        <CTASection />
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            2025 ChatApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

### 3.2 히어로 섹션 (HeroSection.tsx)

```typescript
// src/components/features/landing/HeroSection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const HeroSection = (): JSX.Element => (
  <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
      <div className="text-center">
        {/* 메인 타이틀 */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
          실시간으로 소통하는
          <span className="block text-blue-600">새로운 채팅 경험</span>
        </h1>

        {/* 서브 타이틀 */}
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          관심사가 같은 사람들과 함께하세요. 채팅방을 만들고, 메시지를 주고받으며,
          중요한 대화는 북마크로 저장하세요.
        </p>

        {/* CTA 버튼 */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              무료로 시작하기
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              로그인
            </Button>
          </Link>
        </div>
      </div>

      {/* 데코레이션 이미지 또는 일러스트 */}
      <div className="mt-16 flex justify-center">
        <div className="relative w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
            {/* 채팅 UI 목업 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">A</div>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
                  <p className="text-sm text-gray-700">안녕하세요! 반갑습니다</p>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-blue-600 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-white">네, 안녕하세요! 좋은 하루 되세요</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">B</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
```

### 3.3 기능 소개 섹션 (FeatureSection.tsx)

```typescript
// src/components/features/landing/FeatureSection.tsx
import { ReactNode } from 'react';

interface Feature {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
}

const features: readonly Feature[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: '실시간 채팅',
    description: '빠른 폴링 기반으로 메시지가 즉시 동기화됩니다. 끊김 없는 대화를 경험하세요.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: '채팅방 개설',
    description: '관심사에 맞는 채팅방을 직접 만들어 보세요. 공개/비공개 설정이 가능합니다.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: '좋아요',
    description: '마음에 드는 메시지에 좋아요를 눌러 공감을 표현하세요.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    title: '북마크',
    description: '중요한 메시지는 북마크로 저장하고 나중에 쉽게 찾아보세요.',
  },
];

export const FeatureSection = (): JSX.Element => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 섹션 헤더 */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
          왜 ChatApp인가요?
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          간단하지만 강력한 기능으로 더 나은 소통을 경험하세요
        </p>
      </div>

      {/* 기능 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
```

### 3.4 CTA 섹션 (CTASection.tsx)

```typescript
// src/components/features/landing/CTASection.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const CTASection = (): JSX.Element => (
  <section className="py-24 bg-blue-600">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        지금 바로 시작하세요
      </h2>
      <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
        무료로 가입하고 새로운 사람들과 대화를 나눠보세요.
        복잡한 설정 없이 바로 채팅을 시작할 수 있습니다.
      </p>
      <Link href="/signup">
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          무료 회원가입
        </Button>
      </Link>
    </div>
  </section>
);
```

### 3.5 인덱스 파일

```typescript
// src/components/features/landing/index.ts
export { HeroSection } from './HeroSection';
export { FeatureSection } from './FeatureSection';
export { CTASection } from './CTASection';
```

---

## 4. 루트 레이아웃 (app/layout.tsx)

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatApp - 실시간 채팅 서비스',
  description: '관심사가 같은 사람들과 실시간으로 소통하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 5. 의존성 및 순서

### 5.1 의존성

- `@/components/ui/Button` - 버튼 컴포넌트
- `@/components/layout/Header` - 헤더 컴포넌트
- `@/contexts/AuthContext` - 인증 상태 (헤더에서 사용)

### 5.2 구현 순서

1. 루트 레이아웃 설정
2. 공통 UI 컴포넌트 구현 (Button)
3. Header 컴포넌트 구현
4. 랜딩 페이지 섹션 컴포넌트 구현
5. 페이지 조립

---

## 6. 반응형 디자인

| 화면 크기 | 레이아웃 |
|-----------|----------|
| Mobile (< 640px) | 단일 열, 세로 정렬 |
| Tablet (640px - 1024px) | 2열 그리드 |
| Desktop (> 1024px) | 4열 그리드, 넓은 여백 |

---

## 7. 테스트 계획

### 7.1 단위 테스트

- 각 섹션 컴포넌트 렌더링 테스트
- 링크 href 확인

### 7.2 E2E 테스트

- 로그인/회원가입 페이지 이동 테스트
- 반응형 레이아웃 테스트

### 7.3 테스트 파일

```
__tests__/
└── pages/
    └── landing.test.tsx
```

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-11-23 | 최초 작성 |

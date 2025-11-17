# Korean Text
코드를 생성한 후에 utf-8 기준으로 깨지는 한글이 있는지 확인해주세요. 만약 있다면 수정해주세요.
항상 한국어로 응답하세요.


코드 수정 작업을 완료한 뒤 commit을 남겨주세요. message는 최근 기록을 참고해서 적절히 작성하세요.

# SOT(Source Of Truth) Design
docs폴더의 문서를 참고하여 프로그램 구조를 파악하세요. docs/external에는 외부서비스 연동 관련 문서가 있으니 필요시 확인하여 파악하세요.

# Functional Programming Principles

모든 코드는 다음 함수형 프로그래밍 원칙을 따릅니다.

## 1. 순수 함수 (Pure Functions)
- 같은 입력에 대해 항상 같은 출력을 반환
- 외부 상태를 변경하지 않음
- 부수 효과(side effects)를 최소화
- 예측 가능하고 테스트하기 쉬운 함수 작성

**예시:**
```javascript
// ✅ 순수 함수
const add = (a, b) => a + b;
const multiply = (x, y) => x * y;

// ❌ 비순수 함수 (외부 상태 변경)
let total = 0;
const addToTotal = (n) => total += n;
```

## 2. 불변성 (Immutability)
- 데이터를 직접 변경하지 않고 새로운 데이터 생성
- const, readonly, Object.freeze 등을 활용
- 스프레드 연산자로 복사 후 수정

**예시:**
```javascript
// ✅ 불변성 유지
const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4];  // 원본 유지

const user = { name: 'John', age: 30 };
const updatedUser = { ...user, age: 31 };  // 원본 유지

// ❌ 변이 (mutation)
numbers.push(4);  // 원본 변경
user.age = 31;    // 원본 변경
```

## 3. 선언적 코드 (Declarative)
- "어떻게(how)"보다 "무엇을(what)" 할지에 집중
- for/while 루프 대신 map/filter/reduce 사용
- 조건문보다 삼항 연산자나 함수형 패턴 활용

**예시:**
```javascript
// ❌ 명령형 (imperative)
const result = [];
for (let i = 0; i < items.length; i++) {
  if (items[i].price > 100) {
    result.push(items[i].price * 0.9);
  }
}

// ✅ 선언적 (declarative)
const result = items
  .filter(item => item.price > 100)
  .map(item => item.price * 0.9);
```

## 4. 함수 합성 (Function Composition)
- 작은 순수 함수들을 조합하여 복잡한 로직 구성
- 재사용 가능한 유틸리티 함수 작성
- 파이프라인 패턴 활용

**예시:**
```javascript
// 작은 함수들
const isExpensive = item => item.price > 100;
const applyDiscount = item => ({ ...item, price: item.price * 0.9 });
const getPrice = item => item.price;

// ✅ 함수 합성
const totalDiscountedPrice = items
  .filter(isExpensive)
  .map(applyDiscount)
  .map(getPrice)
  .reduce((sum, price) => sum + price, 0);
```

## 언어별 적용 가이드

### JavaScript/TypeScript
- Array.prototype 메서드 활용 (map, filter, reduce, every, some)
- const 선호, let 최소화, var 금지
- 스프레드 연산자로 객체/배열 복사
- Optional chaining (?.), Nullish coalescing (??)

### Python
- List comprehension, generator 활용
- map(), filter(), reduce() 사용
- 불변 자료구조 선호 (tuple, frozenset)
- 함수형 라이브러리 (toolz, funcy) 활용 가능

### Java/Kotlin
- Stream API 활용 (Java 8+)
- 불변 객체 선호 (final, data class)
- Optional로 null 처리
- 함수형 라이브러리 (Vavr, Arrow) 활용 가능

## 실전 적용 예시

**데이터 변환 파이프라인:**
```javascript
// ❌ 명령형
let total = 0;
for (let i = 0; i < users.length; i++) {
  if (users[i].active && users[i].age >= 18) {
    total += users[i].purchases.reduce((sum, p) => sum + p.amount, 0);
  }
}

// ✅ 함수형
const isAdultActive = user => user.active && user.age >= 18;
const getTotalPurchases = user =>
  user.purchases.reduce((sum, p) => sum + p.amount, 0);

const total = users
  .filter(isAdultActive)
  .map(getTotalPurchases)
  .reduce((sum, amount) => sum + amount, 0);
```

**조건부 로직:**
```javascript
// ❌ 명령형
let message;
if (user.role === 'admin') {
  message = 'Welcome Admin';
} else if (user.role === 'user') {
  message = 'Welcome User';
} else {
  message = 'Welcome Guest';
}

// ✅ 함수형
const messages = {
  admin: 'Welcome Admin',
  user: 'Welcome User',
  guest: 'Welcome Guest'
};
const message = messages[user.role] || messages.guest;

// 또는
const getMessage = role => ({
  admin: 'Welcome Admin',
  user: 'Welcome User',
  guest: 'Welcome Guest'
})[role] || 'Welcome Guest';
```

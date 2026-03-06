# Moment.js 유틸리티 함수 사용 가이드

## 개요

`momentUtils.ts`는 MomentTestPage.tsx의 모든 기능을 재사용 가능한 유틸리티 함수로 분리한 모듈입니다. 어디서든 쉽게 날짜/시간 처리를 할 수 있습니다.

## 설치 및 Import

```typescript
// 개별 함수 import
import { getRelativeTime, formatTime, getCountdown } from '../utils/momentUtils';

// 또는 통합 import
import { getRelativeTime, formatTime, getCountdown } from '../utils';
```

## 사용 예제

### 1. 상대 시간 계산

```typescript
import { getRelativeTime } from '../utils/momentUtils';

const targetDate = '2024-12-25 14:30:00';
const relativeTime = getRelativeTime(targetDate);

console.log(relativeTime.daysAgo);    // "2개월 전"
console.log(relativeTime.daysDiff);   // 65
console.log(relativeTime.hoursDiff);  // 1560
```

### 2. 인간화된 시간 표시

```typescript
import { getHumanizedTime } from '../utils/momentUtils';

const humanized = getHumanizedTime('2024-10-21 15:30:00');
console.log(humanized.fromNow);      // "3시간 전"
console.log(humanized.calendar);     // "오늘 오후 3:30"
```

### 3. 기간 경계 계산

```typescript
import { getPeriodBoundaries } from '../utils/momentUtils';

const boundaries = getPeriodBoundaries();
console.log(boundaries.startOfWeek);  // "2024-10-20 00:00:00"
console.log(boundaries.endOfMonth);   // "2024-10-31 23:59:59"
```

### 4. 차이 계산

```typescript
import { calculateTimeDiff } from '../utils/momentUtils';

const diff = calculateTimeDiff('2024-12-25 14:30:00');
console.log(diff.diffInDays);        // 65
console.log(diff.diffInHours);       // 1560
console.log(diff.diffInBusinessDays); // 47 (주말 제외)
```

### 5. 포맷팅

```typescript
import { formatTime } from '../utils/momentUtils';

const formatted = formatTime('2024-10-21 15:30:45', 'YYYY년 MM월 DD일');
console.log(formatted.customFormat);  // "2024년 10월 21일"
console.log(formatted.commonFormats.korean); // "2024년 10월 21일 15시 30분"
```

### 6. 시간 정규화

```typescript
import { normalizeTime } from '../utils/momentUtils';

const normalized = normalizeTime('2024-10-21 15:30:45');
console.log(normalized.startOfDay);   // "2024-10-21 00:00:00"
console.log(normalized.endOfDay);     // "2024-10-21 23:59:59"
```

### 7. 구간 판정

```typescript
import { checkTimeRange } from '../utils/momentUtils';

const rangeCheck = checkTimeRange('2024-10-21 15:30:00');
console.log(rangeCheck.isToday);      // true
console.log(rangeCheck.isThisWeek);   // true
console.log(rangeCheck.isPast);       // false
```

### 8. 캘린더 표기

```typescript
import { getCalendarDisplay } from '../utils/momentUtils';

const calendar = getCalendarDisplay('2024-10-21 15:30:00');
console.log(calendar.calendar);       // "오늘 오후 3:30"
console.log(calendar.calendarKorean); // "오늘"
```

### 9. 카운트다운

```typescript
import { getCountdown } from '../utils/momentUtils';

const countdown = getCountdown('2024-12-25 00:00:00');
if (countdown.status === 'active') {
  console.log(`${countdown.days}일 ${countdown.hours}시간 ${countdown.minutes}분 ${countdown.seconds}초 남음`);
}
```

### 10. 타임존 변환

```typescript
import { convertTimezone } from '../utils/momentUtils';

const timezone = convertTimezone('2024-10-21 15:30:00', '+09:00');
console.log(timezone.utc);           // "2024-10-21 06:30:00"
console.log(timezone.local);         // "2024-10-21 15:30:00"
```

### 11. 영업일 계산

```typescript
import { calculateBusinessDays } from '../utils/momentUtils';

const businessDays = calculateBusinessDays(5);
console.log(businessDays.endDate);    // "2024-10-28"
console.log(businessDays.weekends);   // 2
```

## 추가 유틸리티 함수들

### 현재 시간 가져오기

```typescript
import { getCurrentMoment, getCurrentTimeString } from '../utils/momentUtils';

const now = getCurrentMoment();
const timeString = getCurrentTimeString('YYYY-MM-DD');
```

### 날짜 유효성 검사

```typescript
import { isValidDate } from '../utils/momentUtils';

console.log(isValidDate('2024-10-21'));  // true
console.log(isValidDate('invalid'));     // false
```

### 날짜 범위 필터링

```typescript
import { filterByDateRange } from '../utils/momentUtils';

const items = [
  { id: 1, createdAt: '2024-10-20' },
  { id: 2, createdAt: '2024-10-21' },
  { id: 3, createdAt: '2024-10-22' }
];

const filtered = filterByDateRange(
  items, 
  '2024-10-20', 
  '2024-10-21', 
  'createdAt'
);
```

### 만료일 계산

```typescript
import { calculateExpiration } from '../utils/momentUtils';

const expiration = calculateExpiration('2024-10-01', 30);
console.log(expiration.expirationDate);  // "2024-10-31"
console.log(expiration.daysRemaining);   // 10
console.log(expiration.status);          // "warning"
```

### 안전한 날짜 포맷팅

```typescript
import { safeFormat } from '../utils/momentUtils';

const formatted = safeFormat('invalid-date', 'YYYY-MM-DD', 'N/A');
console.log(formatted); // "N/A"
```

## React 컴포넌트에서 사용 예제

```typescript
import React, { useState, useEffect } from 'react';
import { getCountdown, getCurrentTimeString } from '../utils/momentUtils';

const CountdownComponent = ({ targetDate }: { targetDate: string }) => {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));
  const [currentTime, setCurrentTime] = useState(getCurrentTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
      setCurrentTime(getCurrentTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div>
      <p>현재 시간: {currentTime}</p>
      {countdown.status === 'active' ? (
        <p>{countdown.days}일 {countdown.hours}시간 {countdown.minutes}분 {countdown.seconds}초 남음</p>
      ) : (
        <p>이미 지났습니다</p>
      )}
    </div>
  );
};
```

## 타입 정의

모든 함수는 TypeScript 타입이 정의되어 있어 타입 안전성을 보장합니다:

```typescript
import type { 
  CountdownStatus, 
  TimeRangeCheck, 
  RelativeTime,
  BusinessDays 
} from '../utils/momentUtils';
```

## 성능 최적화 팁

1. **메모이제이션 사용**: React에서 `useMemo`를 활용하여 불필요한 재계산 방지
2. **인터벌 최적화**: 1초마다 업데이트하는 대신 1분마다 업데이트 고려
3. **캐싱**: 동일한 입력에 대한 결과를 캐시하여 성능 향상

이 유틸리티 함수들을 사용하면 MomentTestPage.tsx의 모든 기능을 어디서든 쉽게 활용할 수 있습니다.

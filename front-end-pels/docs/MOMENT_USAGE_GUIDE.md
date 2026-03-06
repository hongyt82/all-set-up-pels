# Moment.js 사용법 가이드

## 개요

이 문서는 PDF Formatter 프로젝트에서 사용하는 Moment.js 라이브러리의 활용법을 정리한 가이드입니다. 실제 프로젝트에서 사용되는 11가지 핵심 기능과 실용적인 예제를 중심으로 설명합니다.

## 목차

1. [설치 및 설정](#설치-및-설정)
2. [기본 사용법](#기본-사용법)
3. [핵심 기능별 사용법](#핵심-기능별-사용법)
4. [실제 사용 사례](#실제-사용-사례)
5. [성능 최적화](#성능-최적화)
6. [문제 해결](#문제-해결)

## 설치 및 설정

### 의존성 설치

```json
{
  "dependencies": {
    "moment": "^2.30.1"
  }
}
```

### TypeScript 설정

```typescript
// tsconfig.app.json
{
  "compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler"
  }
}
```

### Import 방식

```typescript
// 기본 import
import moment from 'moment';

// 한국어 로케일 설정
import 'moment/locale/ko';
moment.locale('ko');
```

## 기본 사용법

### 현재 시간 가져오기

```typescript
// 현재 시간
const now = moment();

// 특정 시간
const specificTime = moment('2024-12-25 14:30:00');

// Unix 타임스탬프
const fromUnix = moment.unix(1703505000);

// Date 객체에서
const fromDate = moment(new Date());
```

### 기본 포맷팅

```typescript
// 기본 포맷
moment().format(); // "2024-10-21T18:30:00+09:00"

// 커스텀 포맷
moment().format('YYYY-MM-DD HH:mm:ss'); // "2024-10-21 18:30:00"
moment().format('YYYY년 MM월 DD일'); // "2024년 10월 21일"

// ISO 문자열
moment().toISOString(); // "2024-10-21T09:30:00.000Z"
```

## 핵심 기능별 사용법

### 1. "며칠 전/후", "N분 뒤/전" - 상대 시간 계산

```typescript
const targetDate = moment('2024-12-25 14:30:00');
const now = moment();

// 상대 시간 표현
const relativeTime = {
  daysAgo: targetDate.fromNow(),        // "2개월 전"
  daysAfter: targetDate.toNow(),        // "2개월 후"
  daysDiff: targetDate.diff(now, 'days'),      // 65
  hoursDiff: targetDate.diff(now, 'hours'),    // 1560
  minutesDiff: targetDate.diff(now, 'minutes'), // 93600
  secondsDiff: targetDate.diff(now, 'seconds')  // 5616000
};

// 시간 더하기/빼기
const future = moment().add(3, 'days');    // 3일 후
const past = moment().subtract(2, 'hours'); // 2시간 전
```

### 2. "지금/방금/3시간 전" - 인간화된 상대 시간

```typescript
const targetTime = moment('2024-10-21 15:30:00');

const humanized = {
  fromNow: targetTime.fromNow(),           // "3시간 전"
  toNow: targetTime.toNow(),               // "3시간 후"
  calendar: targetTime.calendar(),         // "오늘 오후 3:30"
  fromNowShort: targetTime.fromNow(true),  // "3시간"
  toNowShort: targetTime.toNow(true)       // "3시간"
};

// 캘린더 표기 커스터마이징
const customCalendar = targetTime.calendar(null, {
  sameDay: '[오늘] LT',
  nextDay: '[내일] LT',
  nextWeek: 'dddd LT',
  lastDay: '[어제] LT',
  lastWeek: '[지난] dddd LT',
  sameElse: 'L'
});
```

### 3. "이번 주/이번 달" 경계 - 기간 시작/끝 계산

```typescript
const now = moment();

const boundaries = {
  startOfWeek: now.clone().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
  endOfWeek: now.clone().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
  startOfMonth: now.clone().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
  endOfMonth: now.clone().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
  startOfYear: now.clone().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
  endOfYear: now.clone().endOf('year').format('YYYY-MM-DD HH:mm:ss'),
  startOfDay: now.clone().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  endOfDay: now.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss')
};
```

### 4. 차이 계산(diff) - 다양한 단위별 차이 계산

```typescript
const target = moment('2024-12-25 14:30:00');
const now = moment();

const differences = {
  diffInMilliseconds: target.diff(now),
  diffInSeconds: target.diff(now, 'seconds'),
  diffInMinutes: target.diff(now, 'minutes'),
  diffInHours: target.diff(now, 'hours'),
  diffInDays: target.diff(now, 'days'),
  diffInWeeks: target.diff(now, 'weeks'),
  diffInMonths: target.diff(now, 'months'),
  diffInYears: target.diff(now, 'years')
};

// 영업일 차이 계산 (주말 제외)
const calculateBusinessDaysDiff = (start: moment.Moment, end: moment.Moment) => {
  let count = 0;
  const current = start.clone();
  
  while (current.isBefore(end, 'day')) {
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 일요일(0), 토요일(6) 제외
      count++;
    }
    current.add(1, 'day');
  }
  
  return count;
};
```

### 5. 포맷팅(표시형식 전환) - 다양한 날짜/시간 포맷

```typescript
const targetTime = moment('2024-10-21 15:30:45');

const formats = {
  customFormat: targetTime.format('YYYY-MM-DD HH:mm:ss'),
  iso: targetTime.toISOString(),
  unix: targetTime.unix(),
  timestamp: targetTime.valueOf(),
  commonFormats: {
    date: targetTime.format('YYYY-MM-DD'),           // "2024-10-21"
    time: targetTime.format('HH:mm:ss'),             // "15:30:45"
    datetime: targetTime.format('YYYY-MM-DD HH:mm:ss'), // "2024-10-21 15:30:45"
    korean: targetTime.format('YYYY년 MM월 DD일 HH시 mm분'), // "2024년 10월 21일 15시 30분"
    american: targetTime.format('MM/DD/YYYY'),       // "10/21/2024"
    european: targetTime.format('DD/MM/YYYY')        // "21/10/2024"
  }
};
```

### 6. 시작/끝 정규화 - 자정, 말일, 분/초 0으로 정규화

```typescript
const targetTime = moment('2024-10-21 15:30:45');

const normalized = {
  startOfDay: targetTime.clone().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  endOfDay: targetTime.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  startOfHour: targetTime.clone().startOf('hour').format('YYYY-MM-DD HH:mm:ss'),
  endOfHour: targetTime.clone().endOf('hour').format('YYYY-MM-DD HH:mm:ss'),
  startOfMinute: targetTime.clone().startOf('minute').format('YYYY-MM-DD HH:mm:ss'),
  endOfMinute: targetTime.clone().endOf('minute').format('YYYY-MM-DD HH:mm:ss'),
  startOfMonth: targetTime.clone().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
  endOfMonth: targetTime.clone().endOf('month').format('YYYY-MM-DD HH:mm:ss')
};
```

### 7. 포함·구간 판정 - 날짜 범위 체크

```typescript
const targetTime = moment('2024-10-21 15:30:00');
const now = moment();
const startOfWeek = now.clone().startOf('week');
const endOfWeek = now.clone().endOf('week');

const rangeChecks = {
  isToday: targetTime.isSame(now, 'day'),
  isYesterday: targetTime.isSame(now.clone().subtract(1, 'day'), 'day'),
  isTomorrow: targetTime.isSame(now.clone().add(1, 'day'), 'day'),
  isThisWeek: targetTime.isBetween(startOfWeek, endOfWeek, null, '[]'),
  isThisMonth: targetTime.isBetween(now.clone().startOf('month'), now.clone().endOf('month'), null, '[]'),
  isThisYear: targetTime.isSame(now, 'year'),
  isPast: targetTime.isBefore(now),
  isFuture: targetTime.isAfter(now),
  isSame: targetTime.isSame(now),
  isBefore: targetTime.isBefore(now),
  isAfter: targetTime.isAfter(now),
  isBetween: targetTime.isBetween(
    now.clone().subtract(1, 'day'), 
    now.clone().add(1, 'day'), 
    null, 
    '[]'
  )
};
```

### 8. 캘린더 표기 - 오늘/어제/내일 표시

```typescript
const targetTime = moment('2024-10-21 15:30:00');

const calendarDisplay = {
  calendar: targetTime.calendar(),
  calendarWithTime: targetTime.calendar(null, {
    sameDay: '[오늘] LT',
    nextDay: '[내일] LT',
    nextWeek: 'dddd LT',
    lastDay: '[어제] LT',
    lastWeek: '[지난] dddd LT',
    sameElse: 'L'
  }),
  calendarKorean: targetTime.calendar(null, {
    sameDay: '[오늘]',
    nextDay: '[내일]',
    nextWeek: 'dddd',
    lastDay: '[어제]',
    lastWeek: '[지난] dddd',
    sameElse: 'YYYY-MM-DD'
  })
};
```

### 9. D-Day / 카운트다운 - 실시간 카운트다운

```typescript
const countdown = (target: string) => {
  const targetMoment = moment(target);
  const now = moment();
  const diff = targetMoment.diff(now);
  
  if (diff <= 0) {
    return {
      status: 'expired',
      message: '이미 지났습니다',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  
  const duration = moment.duration(diff);
  return {
    status: 'active',
    message: '진행 중',
    days: Math.floor(duration.asDays()),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
    totalHours: Math.floor(duration.asHours()),
    totalMinutes: Math.floor(duration.asMinutes()),
    totalSeconds: Math.floor(duration.asSeconds())
  };
};

// 사용 예제
const countdownResult = countdown('2024-12-25 00:00:00');
console.log(`${countdownResult.days}일 ${countdownResult.hours}시간 ${countdownResult.minutes}분 ${countdownResult.seconds}초 남음`);
```

### 10. 타임존 왕복 - UTC/KST 변환

```typescript
const timezoneConversion = (target: string, offset: string) => {
  const utcMoment = moment.utc(target);
  const localMoment = moment(target);
  const offsetMoment = moment(target).utcOffset(offset);
  
  return {
    utc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
    local: localMoment.format('YYYY-MM-DD HH:mm:ss'),
    withOffset: offsetMoment.format('YYYY-MM-DD HH:mm:ss'),
    utcISO: utcMoment.toISOString(),
    localISO: localMoment.toISOString(),
    offsetISO: offsetMoment.toISOString(),
    timezoneInfo: {
      utcOffset: localMoment.utcOffset(),
      offsetString: localMoment.format('Z'),
      timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };
};

// 사용 예제
const timezoneResult = timezoneConversion('2024-10-21 15:30:00', '+09:00');
console.log('UTC:', timezoneResult.utc);        // "2024-10-21 06:30:00"
console.log('KST:', timezoneResult.local);      // "2024-10-21 15:30:00"
```

### 11. "영업일" 간단 처리 - 주말 스킵 계산

```typescript
const calculateBusinessDays = (days: number) => {
  const start = moment();
  let current = start.clone();
  let addedDays = 0;
  
  while (addedDays < days) {
    current.add(1, 'day');
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 일요일(0), 토요일(6) 제외
      addedDays++;
    }
  }
  
  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: current.format('YYYY-MM-DD'),
    totalDays: current.diff(start, 'days'),
    businessDays: days,
    weekends: current.diff(start, 'days') - days
  };
};

// 사용 예제
const businessDaysResult = calculateBusinessDays(5);
console.log(`${businessDaysResult.businessDays}영업일 후: ${businessDaysResult.endDate}`);
```

## 실제 사용 사례

### 1. 폼 데이터 날짜 검증

```typescript
const validateDateInput = (dateString: string) => {
  const date = moment(dateString, 'YYYY-MM-DD', true);
  
  if (!date.isValid()) {
    return { isValid: false, error: '올바른 날짜 형식이 아닙니다.' };
  }
  
  if (date.isBefore(moment(), 'day')) {
    return { isValid: false, error: '과거 날짜는 선택할 수 없습니다.' };
  }
  
  if (date.isAfter(moment().add(1, 'year'), 'day')) {
    return { isValid: false, error: '1년 이후의 날짜는 선택할 수 없습니다.' };
  }
  
  return { isValid: true, date: date.format('YYYY-MM-DD') };
};
```

### 2. 상대 시간 표시 컴포넌트

```typescript
const RelativeTimeDisplay = ({ timestamp }: { timestamp: string }) => {
  const [time, setTime] = useState(moment(timestamp));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment(timestamp));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timestamp]);
  
  return (
    <span title={time.format('YYYY-MM-DD HH:mm:ss')}>
      {time.fromNow()}
    </span>
  );
};
```

### 3. 날짜 범위 필터

```typescript
const filterByDateRange = (items: any[], startDate: string, endDate: string) => {
  const start = moment(startDate);
  const end = moment(endDate);
  
  return items.filter(item => {
    const itemDate = moment(item.createdAt);
    return itemDate.isBetween(start, end, null, '[]');
  });
};
```

### 4. 만료일 계산

```typescript
const calculateExpiration = (createdAt: string, durationDays: number) => {
  const created = moment(createdAt);
  const expiration = created.add(durationDays, 'days');
  
  const now = moment();
  const diff = expiration.diff(now, 'days');
  
  return {
    expirationDate: expiration.format('YYYY-MM-DD'),
    daysRemaining: Math.max(0, diff),
    isExpired: diff <= 0,
    status: diff > 7 ? 'safe' : diff > 0 ? 'warning' : 'expired'
  };
};
```

## 성능 최적화

### 1. 메모이제이션 활용

```typescript
import { useMemo } from 'react';

const useFormattedDate = (timestamp: string, format: string) => {
  return useMemo(() => {
    return moment(timestamp).format(format);
  }, [timestamp, format]);
};
```

### 2. 불필요한 재계산 방지

```typescript
const useRelativeTime = (timestamp: string) => {
  const [relativeTime, setRelativeTime] = useState(() => 
    moment(timestamp).fromNow()
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(moment(timestamp).fromNow());
    }, 60000); // 1분마다 업데이트 (1초마다는 과도함)
    
    return () => clearInterval(interval);
  }, [timestamp]);
  
  return relativeTime;
};
```

### 3. 청크 분리 (Vite 설정)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          moment: ['moment']
        }
      }
    }
  }
});
```

## 문제 해결

### 1. 타임존 문제

```typescript
// UTC로 저장하고 로컬로 표시
const saveAsUTC = (localTime: string) => {
  return moment(localTime).utc().toISOString();
};

const displayAsLocal = (utcTime: string) => {
  return moment.utc(utcTime).local().format('YYYY-MM-DD HH:mm:ss');
};
```

### 2. 로케일 설정 문제

```typescript
// 한국어 로케일 강제 설정
import 'moment/locale/ko';
moment.locale('ko');

// 특정 moment 인스턴스에만 적용
const koreanMoment = moment().locale('ko');
```

### 3. 유효하지 않은 날짜 처리

```typescript
const safeMoment = (input: any) => {
  const m = moment(input);
  return m.isValid() ? m : moment(); // 유효하지 않으면 현재 시간 반환
};
```

### 4. 성능 최적화

```typescript
// 대량 데이터 처리 시
const processLargeDateArray = (dates: string[]) => {
  return dates
    .map(date => moment(date))
    .filter(m => m.isValid())
    .sort((a, b) => a.diff(b))
    .map(m => m.format('YYYY-MM-DD'));
};
```

## 모범 사례

### 1. 일관된 포맷 사용

```typescript
// 프로젝트 전체에서 사용할 표준 포맷
export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD HH:mm:ss',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  KOREAN: 'YYYY년 MM월 DD일',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const;
```

### 2. 에러 처리

```typescript
const safeDateFormat = (date: any, format: string, fallback = '') => {
  try {
    const m = moment(date);
    return m.isValid() ? m.format(format) : fallback;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};
```

### 3. 타입 안전성

```typescript
interface DateRange {
  start: moment.Moment;
  end: moment.Moment;
}

const createDateRange = (start: string, end: string): DateRange | null => {
  const startMoment = moment(start);
  const endMoment = moment(end);
  
  if (!startMoment.isValid() || !endMoment.isValid()) {
    return null;
  }
  
  return { start: startMoment, end: endMoment };
};
```

## 참고 자료

- [Moment.js 공식 문서](https://momentjs.com/docs/)
- [Moment.js 한국어 로케일](https://momentjs.com/docs/#/i18n/changing-locale/)
- [Moment.js 포맷 참조](https://momentjs.com/docs/#/displaying/format/)
- [Vite 번들링 최적화](https://vitejs.dev/guide/build.html#chunking-strategy)

---

이 가이드는 PDF Formatter 프로젝트의 실제 사용 사례를 바탕으로 작성되었습니다. 추가적인 기능이나 사용법이 필요하시면 프로젝트의 `MomentTestPage.tsx`를 참고하시기 바랍니다.

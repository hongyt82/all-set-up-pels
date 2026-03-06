import moment from 'moment';

/**
 * Moment.js 유틸리티 함수 모음
 * MomentTestPage.tsx의 기능들을 재사용 가능한 유틸리티 함수로 분리
 */

// 한국어 로케일 설정
moment.locale('ko');

/**
 * 1) "며칠 전/후", "N분 뒤/전" - 상대 시간 계산
 */
export const getRelativeTime = (target: string | Date | moment.Moment) => {
  const targetMoment = moment(target);
  const now = moment();

  return {
    daysAgo: targetMoment.fromNow(),
    daysAfter: targetMoment.toNow(),
    daysDiff: targetMoment.diff(now, 'days'),
    hoursDiff: targetMoment.diff(now, 'hours'),
    minutesDiff: targetMoment.diff(now, 'minutes'),
    secondsDiff: targetMoment.diff(now, 'seconds'),
  };
};

/**
 * 2) "지금/방금/3시간 전" 같은 상대 시간 - 인간화된 시간
 */
export const getHumanizedTime = (target: string | Date | moment.Moment) => {
  const targetMoment = moment(target);

  return {
    fromNow: targetMoment.fromNow(),
    toNow: targetMoment.toNow(),
    calendar: targetMoment.calendar(),
    fromNowShort: targetMoment.fromNow(true), // "3시간" 형태
    toNowShort: targetMoment.toNow(true),
  };
};

/**
 * 3) "이번 주/이번 달" 경계 - 기간 시작/끝 계산
 */
export const getPeriodBoundaries = (
  baseDate?: string | Date | moment.Moment
) => {
  const now = baseDate ? moment(baseDate) : moment();

  return {
    startOfWeek: now.clone().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
    endOfWeek: now.clone().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
    startOfMonth: now.clone().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    endOfMonth: now.clone().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
    startOfYear: now.clone().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
    endOfYear: now.clone().endOf('year').format('YYYY-MM-DD HH:mm:ss'),
    startOfDay: now.clone().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    endOfDay: now.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
  };
};

/**
 * 4) 차이 계산(diff) - 다양한 단위별 차이 계산
 */
export const calculateTimeDiff = (
  target: string | Date | moment.Moment,
  baseDate?: string | Date | moment.Moment
) => {
  const targetMoment = moment(target);
  const now = baseDate ? moment(baseDate) : moment();

  return {
    diffInMilliseconds: targetMoment.diff(now),
    diffInSeconds: targetMoment.diff(now, 'seconds'),
    diffInMinutes: targetMoment.diff(now, 'minutes'),
    diffInHours: targetMoment.diff(now, 'hours'),
    diffInDays: targetMoment.diff(now, 'days'),
    diffInWeeks: targetMoment.diff(now, 'weeks'),
    diffInMonths: targetMoment.diff(now, 'months'),
    diffInYears: targetMoment.diff(now, 'years'),
    diffInBusinessDays: calculateBusinessDaysDiff(targetMoment, now),
  };
};

/**
 * 5) 포맷팅(표시형식 전환) - 다양한 날짜/시간 포맷
 */
export const formatTime = (
  target: string | Date | moment.Moment,
  customFormat?: string
) => {
  const targetMoment = moment(target);
  const format = customFormat || 'YYYY-MM-DD HH:mm:ss';

  return {
    customFormat: targetMoment.format(format),
    iso: targetMoment.toISOString(),
    unix: targetMoment.unix(),
    timestamp: targetMoment.valueOf(),
    commonFormats: {
      date: targetMoment.format('YYYY-MM-DD'),
      time: targetMoment.format('HH:mm:ss'),
      datetime: targetMoment.format('YYYY-MM-DD HH:mm:ss'),
      korean: targetMoment.format('YYYY년 MM월 DD일 HH시 mm분'),
      american: targetMoment.format('MM/DD/YYYY'),
      european: targetMoment.format('DD/MM/YYYY'),
    },
  };
};

/**
 * 6) 시작/끝 정규화(자정, 말일, 분/초 0) - 시간 정규화
 */
export const normalizeTime = (target: string | Date | moment.Moment) => {
  const targetMoment = moment(target);

  return {
    startOfDay: targetMoment
      .clone()
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss'),
    endOfDay: targetMoment.clone().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
    startOfHour: targetMoment
      .clone()
      .startOf('hour')
      .format('YYYY-MM-DD HH:mm:ss'),
    endOfHour: targetMoment.clone().endOf('hour').format('YYYY-MM-DD HH:mm:ss'),
    startOfMinute: targetMoment
      .clone()
      .startOf('minute')
      .format('YYYY-MM-DD HH:mm:ss'),
    endOfMinute: targetMoment
      .clone()
      .endOf('minute')
      .format('YYYY-MM-DD HH:mm:ss'),
    startOfMonth: targetMoment
      .clone()
      .startOf('month')
      .format('YYYY-MM-DD HH:mm:ss'),
    endOfMonth: targetMoment
      .clone()
      .endOf('month')
      .format('YYYY-MM-DD HH:mm:ss'),
  };
};

/**
 * 7) 포함·구간 판정 - 날짜 범위 체크
 */
export const checkTimeRange = (
  target: string | Date | moment.Moment,
  baseDate?: string | Date | moment.Moment
) => {
  const targetMoment = moment(target);
  const now = baseDate ? moment(baseDate) : moment();
  const startOfWeek = now.clone().startOf('week');
  const endOfWeek = now.clone().endOf('week');
  const startOfMonth = now.clone().startOf('month');
  const endOfMonth = now.clone().endOf('month');

  return {
    isToday: targetMoment.isSame(now, 'day'),
    isYesterday: targetMoment.isSame(now.clone().subtract(1, 'day'), 'day'),
    isTomorrow: targetMoment.isSame(now.clone().add(1, 'day'), 'day'),
    isThisWeek: targetMoment.isBetween(startOfWeek, endOfWeek, null, '[]'),
    isThisMonth: targetMoment.isBetween(startOfMonth, endOfMonth, null, '[]'),
    isThisYear: targetMoment.isSame(now, 'year'),
    isPast: targetMoment.isBefore(now),
    isFuture: targetMoment.isAfter(now),
    isSame: targetMoment.isSame(now),
    isBefore: targetMoment.isBefore(now),
    isAfter: targetMoment.isAfter(now),
    isBetween: targetMoment.isBetween(
      now.clone().subtract(1, 'day'),
      now.clone().add(1, 'day'),
      null,
      '[]'
    ),
  };
};

/**
 * 8) 캘린더 표기(오늘/어제/내일) - 캘린더 표시
 */
export const getCalendarDisplay = (target: string | Date | moment.Moment) => {
  const targetMoment = moment(target);

  return {
    calendar: targetMoment.calendar(),
    calendarWithTime: targetMoment.calendar(null, {
      sameDay: '[오늘] LT',
      nextDay: '[내일] LT',
      nextWeek: 'dddd LT',
      lastDay: '[어제] LT',
      lastWeek: '[지난] dddd LT',
      sameElse: 'L',
    }),
    calendarKorean: targetMoment.calendar(null, {
      sameDay: '[오늘]',
      nextDay: '[내일]',
      nextWeek: 'dddd',
      lastDay: '[어제]',
      lastWeek: '[지난] dddd',
      sameElse: 'YYYY-MM-DD',
    }),
  };
};

/**
 * 9) D-Day / 카운트다운 - 실시간 카운트다운
 */
export const getCountdown = (
  target: string | Date | moment.Moment,
  baseDate?: string | Date | moment.Moment
) => {
  const targetMoment = moment(target);
  const now = baseDate ? moment(baseDate) : moment();
  const diff = targetMoment.diff(now);

  if (diff <= 0) {
    return {
      status: 'expired' as const,
      message: '이미 지났습니다',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
    };
  }

  const duration = moment.duration(diff);
  return {
    status: 'active' as const,
    message: '진행 중',
    days: Math.floor(duration.asDays()),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
    totalHours: Math.floor(duration.asHours()),
    totalMinutes: Math.floor(duration.asMinutes()),
    totalSeconds: Math.floor(duration.asSeconds()),
  };
};

/**
 * 10) 타임존 왕복(서버 UTC 저장, UI KST 표시) - 타임존 변환
 */
export const convertTimezone = (
  target: string | Date | moment.Moment,
  offset: string = '+09:00'
) => {
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
      timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
};

/**
 * 11) "영업일" 간단 처리(주말 스킵) - 영업일 계산
 */
export const calculateBusinessDaysDiff = (
  start: moment.Moment,
  end: moment.Moment
) => {
  let count = 0;
  const current = start.clone();

  while (current.isBefore(end, 'day')) {
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 일요일(0), 토요일(6) 제외
      count++;
    }
    current.add(1, 'day');
  }

  return count;
};

export const calculateBusinessDays = (
  days: number,
  startDate?: string | Date | moment.Moment
) => {
  const start = startDate ? moment(startDate) : moment();
  const current = start.clone();
  let addedDays = 0;

  while (addedDays < days) {
    current.add(1, 'day');
    const dayOfWeek = current.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: current.format('YYYY-MM-DD'),
    totalDays: current.diff(start, 'days'),
    businessDays: days,
    weekends: current.diff(start, 'days') - days,
  };
};

/**
 * 추가 유틸리티 함수들
 */

/**
 * 현재 시간을 moment 객체로 반환
 */
export const getCurrentMoment = () => moment();

/**
 * 현재 시간을 문자열로 반환
 */
export const getCurrentTimeString = (
  format: string = 'YYYY-MM-DD HH:mm:ss'
) => {
  return moment().format(format);
};

/**
 * 날짜 유효성 검사
 */
export const isValidDate = (date: any) => {
  return moment(date).isValid();
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (
  start: string | Date | moment.Moment,
  end: string | Date | moment.Moment
) => {
  return moment(end).diff(moment(start), 'days');
};

/**
 * 날짜 범위 필터링
 */
export const filterByDateRange = <T>(
  items: T[],
  startDate: string | Date | moment.Moment,
  endDate: string | Date | moment.Moment,
  dateField: keyof T
) => {
  const start = moment(startDate);
  const end = moment(endDate);

  return items.filter(item => {
    const itemDate = moment(item[dateField] as any);
    return itemDate.isBetween(start, end, null, '[]');
  });
};

/**
 * 만료일 계산
 */
export const calculateExpiration = (
  createdAt: string | Date | moment.Moment,
  durationDays: number
) => {
  const created = moment(createdAt);
  const expiration = created.add(durationDays, 'days');

  const now = moment();
  const diff = expiration.diff(now, 'days');

  return {
    expirationDate: expiration.format('YYYY-MM-DD'),
    daysRemaining: Math.max(0, diff),
    isExpired: diff <= 0,
    status: diff > 7 ? 'safe' : diff > 0 ? 'warning' : ('expired' as const),
  };
};

/**
 * 안전한 날짜 포맷팅 (에러 처리 포함)
 */
export const safeFormat = (
  date: any,
  format: string = 'YYYY-MM-DD HH:mm:ss',
  fallback: string = ''
) => {
  try {
    const m = moment(date);
    return m.isValid() ? m.format(format) : fallback;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

/**
 * 타입 정의
 */
export type CountdownStatus = 'active' | 'expired';
export type ExpirationStatus = 'safe' | 'warning' | 'expired';
export type TimeRangeCheck = ReturnType<typeof checkTimeRange>;
export type RelativeTime = ReturnType<typeof getRelativeTime>;
export type HumanizedTime = ReturnType<typeof getHumanizedTime>;
export type PeriodBoundaries = ReturnType<typeof getPeriodBoundaries>;
export type TimeDiff = ReturnType<typeof calculateTimeDiff>;
export type TimeFormat = ReturnType<typeof formatTime>;
export type TimeNormalize = ReturnType<typeof normalizeTime>;
export type CalendarDisplay = ReturnType<typeof getCalendarDisplay>;
export type Countdown = ReturnType<typeof getCountdown>;
export type TimezoneConversion = ReturnType<typeof convertTimezone>;
export type BusinessDays = ReturnType<typeof calculateBusinessDays>;
export type Expiration = ReturnType<typeof calculateExpiration>;

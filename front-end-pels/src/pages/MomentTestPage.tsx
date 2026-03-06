import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

/**
 * Moment.js 기능 테스트 페이지
 * 다양한 날짜/시간 처리 기능들을 테스트할 수 있는 페이지
 */
const MomentTestPage: React.FC = () => {
  // 현재 시간 상태
  const [currentTime, setCurrentTime] = useState(moment());

  // 입력값 상태
  const [targetDate, setTargetDate] = useState('2024-12-25');
  const [targetTime, setTargetTime] = useState('14:30');
  const [customFormat, setCustomFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const [timezoneOffset, setTimezoneOffset] = useState('+09:00');
  const [businessDays, setBusinessDays] = useState('5');

  // 결과 상태
  const [results, setResults] = useState<Record<string, any>>({});

  // 한국어 로케일 설정
  useEffect(() => {
    moment.locale('ko');
  }, []);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1) "며칠 전/후", "N분 뒤/전"
  const relativeTime = (target: string) => {
    const targetMoment = moment(target);
    return {
      daysAgo: targetMoment.fromNow(),
      daysAfter: targetMoment.toNow(),
      daysDiff: targetMoment.diff(moment(), 'days'),
      hoursDiff: targetMoment.diff(moment(), 'hours'),
      minutesDiff: targetMoment.diff(moment(), 'minutes'),
      secondsDiff: targetMoment.diff(moment(), 'seconds'),
    };
  };

  // 2) "지금/방금/3시간 전" 같은 상대 시간
  const humanizeTime = (target: string) => {
    const targetMoment = moment(target);
    return {
      fromNow: targetMoment.fromNow(),
      toNow: targetMoment.toNow(),
      calendar: targetMoment.calendar(),
      fromNowShort: targetMoment.fromNow(true), // "3시간" 형태
      toNowShort: targetMoment.toNow(true),
    };
  };

  // 3) "이번 주/이번 달" 경계
  const periodBoundaries = () => {
    const now = moment();
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

  // 4) 차이 계산(diff)
  const calculateDiff = (target: string) => {
    const targetMoment = moment(target);
    const now = moment();
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

  // 5) 포맷팅(표시형식 전환)
  const formatTime = (target: string, format: string) => {
    const targetMoment = moment(target);
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

  // 6) 시작/끝 정규화(자정, 말일, 분/초 0)
  const normalizeTime = (target: string) => {
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
      endOfHour: targetMoment
        .clone()
        .endOf('hour')
        .format('YYYY-MM-DD HH:mm:ss'),
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

  // 7) 포함·구간 판정
  const timeRangeCheck = (target: string) => {
    const targetMoment = moment(target);
    const now = moment();
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

  // 8) 캘린더 표기(오늘/어제/내일)
  const calendarDisplay = (target: string) => {
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

  // 9) D-Day / 카운트다운
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
        seconds: 0,
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
      totalSeconds: Math.floor(duration.asSeconds()),
    };
  };

  // 10) 타임존 왕복(서버 UTC 저장, UI KST 표시)
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
        timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  };

  // 11) "영업일" 간단 처리(주말 스킵)
  const calculateBusinessDaysDiff = (
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

  const calculateBusinessDays = (days: number) => {
    const start = moment();
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

  // 모든 테스트 실행
  const runAllTests = () => {
    const targetDateTime = `${targetDate} ${targetTime}`;
    const newResults: Record<string, any> = {};

    // 1) 상대 시간
    newResults.relativeTime = relativeTime(targetDateTime);

    // 2) 인간화된 시간
    newResults.humanizeTime = humanizeTime(targetDateTime);

    // 3) 기간 경계
    newResults.periodBoundaries = periodBoundaries();

    // 4) 차이 계산
    newResults.calculateDiff = calculateDiff(targetDateTime);

    // 5) 포맷팅
    newResults.formatTime = formatTime(targetDateTime, customFormat);

    // 6) 시간 정규화
    newResults.normalizeTime = normalizeTime(targetDateTime);

    // 7) 구간 판정
    newResults.timeRangeCheck = timeRangeCheck(targetDateTime);

    // 8) 캘린더 표기
    newResults.calendarDisplay = calendarDisplay(targetDateTime);

    // 9) 카운트다운
    newResults.countdown = countdown(targetDateTime);

    // 10) 타임존 변환
    newResults.timezoneConversion = timezoneConversion(
      targetDateTime,
      timezoneOffset
    );

    // 11) 영업일 계산
    newResults.businessDays = calculateBusinessDays(parseInt(businessDays));

    setResults(newResults);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Moment.js 기능 테스트 페이지</h1>
        <p className="text-muted-foreground">
          다양한 날짜/시간 처리 기능들을 테스트할 수 있습니다.
        </p>
        <div className="text-lg font-mono bg-gray-100 p-2 rounded">
          현재 시간: {currentTime.format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </div>

      {/* 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>입력값 설정</CardTitle>
          <CardDescription>
            테스트할 날짜/시간과 옵션을 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetDate">대상 날짜</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetTime">대상 시간</Label>
              <Input
                id="targetTime"
                type="time"
                value={targetTime}
                onChange={e => setTargetTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customFormat">커스텀 포맷</Label>
              <Input
                id="customFormat"
                value={customFormat}
                onChange={e => setCustomFormat(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm:ss"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezoneOffset">타임존 오프셋</Label>
              <Input
                id="timezoneOffset"
                value={timezoneOffset}
                onChange={e => setTimezoneOffset(e.target.value)}
                placeholder="+09:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDays">영업일 수</Label>
              <Input
                id="businessDays"
                type="number"
                value={businessDays}
                onChange={e => setBusinessDays(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
          <Button onClick={runAllTests} className="w-full">
            모든 테스트 실행
          </Button>
        </CardContent>
      </Card>

      {/* 결과 섹션 */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">테스트 결과</h2>

          {/* 1) 상대 시간 */}
          {results.relativeTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  "며칠 전/후", "N분 뒤/전"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>상대 시간 (fromNow):</strong>{' '}
                    {results.relativeTime.daysAgo}
                  </div>
                  <div>
                    <strong>상대 시간 (toNow):</strong>{' '}
                    {results.relativeTime.daysAfter}
                  </div>
                  <div>
                    <strong>일 차이:</strong> {results.relativeTime.daysDiff}일
                  </div>
                  <div>
                    <strong>시간 차이:</strong> {results.relativeTime.hoursDiff}
                    시간
                  </div>
                  <div>
                    <strong>분 차이:</strong> {results.relativeTime.minutesDiff}
                    분
                  </div>
                  <div>
                    <strong>초 차이:</strong> {results.relativeTime.secondsDiff}
                    초
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2) 인간화된 시간 */}
          {results.humanizeTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  "지금/방금/3시간 전" 같은 상대 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>fromNow:</strong> {results.humanizeTime.fromNow}
                  </div>
                  <div>
                    <strong>toNow:</strong> {results.humanizeTime.toNow}
                  </div>
                  <div>
                    <strong>calendar:</strong> {results.humanizeTime.calendar}
                  </div>
                  <div>
                    <strong>fromNow (짧게):</strong>{' '}
                    {results.humanizeTime.fromNowShort}
                  </div>
                  <div>
                    <strong>toNow (짧게):</strong>{' '}
                    {results.humanizeTime.toNowShort}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3) 기간 경계 */}
          {results.periodBoundaries && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  "이번 주/이번 달" 경계
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>주 시작:</strong>{' '}
                    {results.periodBoundaries.startOfWeek}
                  </div>
                  <div>
                    <strong>주 끝:</strong> {results.periodBoundaries.endOfWeek}
                  </div>
                  <div>
                    <strong>월 시작:</strong>{' '}
                    {results.periodBoundaries.startOfMonth}
                  </div>
                  <div>
                    <strong>월 끝:</strong>{' '}
                    {results.periodBoundaries.endOfMonth}
                  </div>
                  <div>
                    <strong>년 시작:</strong>{' '}
                    {results.periodBoundaries.startOfYear}
                  </div>
                  <div>
                    <strong>년 끝:</strong> {results.periodBoundaries.endOfYear}
                  </div>
                  <div>
                    <strong>일 시작:</strong>{' '}
                    {results.periodBoundaries.startOfDay}
                  </div>
                  <div>
                    <strong>일 끝:</strong> {results.periodBoundaries.endOfDay}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4) 차이 계산 */}
          {results.calculateDiff && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  차이 계산(diff)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>밀리초 차이:</strong>{' '}
                    {results.calculateDiff.diffInMilliseconds}
                  </div>
                  <div>
                    <strong>초 차이:</strong>{' '}
                    {results.calculateDiff.diffInSeconds}
                  </div>
                  <div>
                    <strong>분 차이:</strong>{' '}
                    {results.calculateDiff.diffInMinutes}
                  </div>
                  <div>
                    <strong>시간 차이:</strong>{' '}
                    {results.calculateDiff.diffInHours}
                  </div>
                  <div>
                    <strong>일 차이:</strong> {results.calculateDiff.diffInDays}
                  </div>
                  <div>
                    <strong>주 차이:</strong>{' '}
                    {results.calculateDiff.diffInWeeks}
                  </div>
                  <div>
                    <strong>월 차이:</strong>{' '}
                    {results.calculateDiff.diffInMonths}
                  </div>
                  <div>
                    <strong>년 차이:</strong>{' '}
                    {results.calculateDiff.diffInYears}
                  </div>
                  <div>
                    <strong>영업일 차이:</strong>{' '}
                    {results.calculateDiff.diffInBusinessDays}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5) 포맷팅 */}
          {results.formatTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  포맷팅(표시형식 전환)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>커스텀 포맷:</strong>{' '}
                    {results.formatTime.customFormat}
                  </div>
                  <div>
                    <strong>ISO:</strong> {results.formatTime.iso}
                  </div>
                  <div>
                    <strong>Unix:</strong> {results.formatTime.unix}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {results.formatTime.timestamp}
                  </div>
                  <div className="mt-4">
                    <strong>일반 포맷들:</strong>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div>
                        <strong>날짜:</strong>{' '}
                        {results.formatTime.commonFormats.date}
                      </div>
                      <div>
                        <strong>시간:</strong>{' '}
                        {results.formatTime.commonFormats.time}
                      </div>
                      <div>
                        <strong>날짜시간:</strong>{' '}
                        {results.formatTime.commonFormats.datetime}
                      </div>
                      <div>
                        <strong>한국식:</strong>{' '}
                        {results.formatTime.commonFormats.korean}
                      </div>
                      <div>
                        <strong>미국식:</strong>{' '}
                        {results.formatTime.commonFormats.american}
                      </div>
                      <div>
                        <strong>유럽식:</strong>{' '}
                        {results.formatTime.commonFormats.european}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6) 시간 정규화 */}
          {results.normalizeTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">6</Badge>
                  시작/끝 정규화(자정, 말일, 분/초 0)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>일 시작:</strong> {results.normalizeTime.startOfDay}
                  </div>
                  <div>
                    <strong>일 끝:</strong> {results.normalizeTime.endOfDay}
                  </div>
                  <div>
                    <strong>시간 시작:</strong>{' '}
                    {results.normalizeTime.startOfHour}
                  </div>
                  <div>
                    <strong>시간 끝:</strong> {results.normalizeTime.endOfHour}
                  </div>
                  <div>
                    <strong>분 시작:</strong>{' '}
                    {results.normalizeTime.startOfMinute}
                  </div>
                  <div>
                    <strong>분 끝:</strong> {results.normalizeTime.endOfMinute}
                  </div>
                  <div>
                    <strong>월 시작:</strong>{' '}
                    {results.normalizeTime.startOfMonth}
                  </div>
                  <div>
                    <strong>월 끝:</strong> {results.normalizeTime.endOfMonth}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7) 구간 판정 */}
          {results.timeRangeCheck && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">7</Badge>
                  포함·구간 판정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>오늘인가:</strong>{' '}
                    {results.timeRangeCheck.isToday ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>어제인가:</strong>{' '}
                    {results.timeRangeCheck.isYesterday ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>내일인가:</strong>{' '}
                    {results.timeRangeCheck.isTomorrow ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>이번 주인가:</strong>{' '}
                    {results.timeRangeCheck.isThisWeek ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>이번 달인가:</strong>{' '}
                    {results.timeRangeCheck.isThisMonth ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>이번 년인가:</strong>{' '}
                    {results.timeRangeCheck.isThisYear ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>과거인가:</strong>{' '}
                    {results.timeRangeCheck.isPast ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>미래인가:</strong>{' '}
                    {results.timeRangeCheck.isFuture ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>같은가:</strong>{' '}
                    {results.timeRangeCheck.isSame ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>이전인가:</strong>{' '}
                    {results.timeRangeCheck.isBefore ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>이후인가:</strong>{' '}
                    {results.timeRangeCheck.isAfter ? '예' : '아니오'}
                  </div>
                  <div>
                    <strong>구간 내인가:</strong>{' '}
                    {results.timeRangeCheck.isBetween ? '예' : '아니오'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 8) 캘린더 표기 */}
          {results.calendarDisplay && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">8</Badge>
                  캘린더 표기(오늘/어제/내일)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>기본 캘린더:</strong>{' '}
                    {results.calendarDisplay.calendar}
                  </div>
                  <div>
                    <strong>시간 포함 캘린더:</strong>{' '}
                    {results.calendarDisplay.calendarWithTime}
                  </div>
                  <div>
                    <strong>한국어 캘린더:</strong>{' '}
                    {results.calendarDisplay.calendarKorean}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 9) 카운트다운 */}
          {results.countdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">9</Badge>
                  D-Day / 카운트다운
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>상태:</strong> {results.countdown.status}
                  </div>
                  <div>
                    <strong>메시지:</strong> {results.countdown.message}
                  </div>
                  {results.countdown.status === 'active' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <strong>일:</strong> {results.countdown.days}
                      </div>
                      <div>
                        <strong>시간:</strong> {results.countdown.hours}
                      </div>
                      <div>
                        <strong>분:</strong> {results.countdown.minutes}
                      </div>
                      <div>
                        <strong>초:</strong> {results.countdown.seconds}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <strong>총 시간:</strong>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <div>
                        <strong>총 시간:</strong> {results.countdown.totalHours}
                        시간
                      </div>
                      <div>
                        <strong>총 분:</strong> {results.countdown.totalMinutes}
                        분
                      </div>
                      <div>
                        <strong>총 초:</strong> {results.countdown.totalSeconds}
                        초
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 10) 타임존 변환 */}
          {results.timezoneConversion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">10</Badge>
                  타임존 왕복(서버 UTC 저장, UI KST 표시)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>UTC:</strong> {results.timezoneConversion.utc}
                  </div>
                  <div>
                    <strong>로컬:</strong> {results.timezoneConversion.local}
                  </div>
                  <div>
                    <strong>오프셋 적용:</strong>{' '}
                    {results.timezoneConversion.withOffset}
                  </div>
                  <div>
                    <strong>UTC ISO:</strong>{' '}
                    {results.timezoneConversion.utcISO}
                  </div>
                  <div>
                    <strong>로컬 ISO:</strong>{' '}
                    {results.timezoneConversion.localISO}
                  </div>
                  <div>
                    <strong>오프셋 ISO:</strong>{' '}
                    {results.timezoneConversion.offsetISO}
                  </div>
                  <div className="mt-4">
                    <strong>타임존 정보:</strong>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <div>
                        <strong>UTC 오프셋:</strong>{' '}
                        {results.timezoneConversion.timezoneInfo.utcOffset}
                      </div>
                      <div>
                        <strong>오프셋 문자열:</strong>{' '}
                        {results.timezoneConversion.timezoneInfo.offsetString}
                      </div>
                      <div>
                        <strong>타임존명:</strong>{' '}
                        {results.timezoneConversion.timezoneInfo.timezoneName}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 11) 영업일 계산 */}
          {results.businessDays && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">11</Badge>
                  "영업일" 간단 처리(주말 스킵)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <strong>시작일:</strong> {results.businessDays.startDate}
                  </div>
                  <div>
                    <strong>종료일:</strong> {results.businessDays.endDate}
                  </div>
                  <div>
                    <strong>총 일수:</strong> {results.businessDays.totalDays}일
                  </div>
                  <div>
                    <strong>영업일:</strong> {results.businessDays.businessDays}
                    일
                  </div>
                  <div>
                    <strong>주말:</strong> {results.businessDays.weekends}일
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MomentTestPage;

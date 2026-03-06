import _ from 'lodash';

/**
 * Lodash 유틸리티 함수 모음
 * LodashTestPage.tsx의 기능들을 재사용 가능한 유틸리티 함수로 분리
 */

/**
 * 0) 안전한 문자열화
 */
export const safeStringify = (value: any) => {
  try {
    return _.isString(value) ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * 1) 문자열 분해 (limit 지원)
 */
export const splitString = (
  text: string,
  separator: string = ' ',
  limit?: number
) => {
  return _.split(text, separator, limit);
};

/**
 * 2) 포함 여부 (대소문자 무시)
 */
export const includesIgnoreCase = (text: string, search: string) => {
  return _.includes(_.toLower(text), _.toLower(search));
};

/**
 * 3) 단건 치환 (첫 매치만)
 */
export const replaceFirst = (text: string, search: string, replace: string) => {
  return _.replace(text, search, replace);
};

/**
 * 4) 전체 치환 (문자열 패턴, 대소문자 옵션)
 */
export const replaceAll = (
  text: string,
  search: string,
  replace: string,
  ignoreCase: boolean = false
) => {
  const flags = ignoreCase ? 'gi' : 'g';
  const regex = new RegExp(_.escapeRegExp(search), flags);
  return _.replace(text, regex, replace);
};

/**
 * 5) 전체 치환 (정규식 패턴 직접 입력)
 */
export const replaceRegex = (
  text: string,
  pattern: string,
  replace: string
) => {
  const regex = new RegExp(pattern, 'g');
  return _.replace(text, regex, replace);
};

/**
 * 6) 특정 문자열(들) 삭제
 */
export const removeStrings = (text: string, toRemove: string[]) => {
  return _.reduce(
    toRemove,
    (result, str) => {
      return _.replace(result, new RegExp(_.escapeRegExp(str), 'g'), '');
    },
    text
  );
};

/**
 * 7) 공백 정규화: 앞뒤 trim + 내부 다중 공백 1칸
 */
export const normalizeWhitespace = (text: string) => {
  return _.replace(_.trim(text), /\s+/g, ' ');
};

/**
 * 8) 케이스/표기 변환
 */
export const caseConversions = (text: string) => {
  return {
    camelCase: _.camelCase(text),
    kebabCase: _.kebabCase(text),
    snakeCase: _.snakeCase(text),
    startCase: _.startCase(text),
    upperCase: _.upperCase(text),
    lowerCase: _.lowerCase(text),
    capitalize: _.capitalize(text),
    upperFirst: _.upperFirst(text),
    lowerFirst: _.lowerFirst(text),
  };
};

/**
 * 9) 악센트/전각 제거(라틴 위주) → 슬러그 전처리 등
 */
export const removeAccents = (text: string) => {
  return _.deburr(text);
};

/**
 * 10) HTML 엔티티 이스케이프/역변환
 */
export const htmlEscape = (text: string) => {
  return _.escape(text);
};

export const htmlUnescape = (text: string) => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};

/**
 * 11) 패딩 & 트렁케이트
 */
export const paddingAndTruncate = (text: string, length: number = 20) => {
  return {
    padStart: _.padStart(text, length, '0'),
    padEnd: _.padEnd(text, length, '-'),
    pad: _.pad(text, length),
    truncate: _.truncate(text, { length, omission: '...' }),
  };
};

/**
 * 12) 단어 토큰 (영문/숫자 위주)
 */
export const wordTokens = (text: string) => {
  return _.words(text, /[a-zA-Z0-9가-힣]+/g);
};

/**
 * 13) 금액/숫자 문자열 정제 → number (천단위 콤마/원/공백 제거)
 */
export const cleanAmount = (text: string) => {
  const cleaned = _.replace(text, /[,\s원]/g, '');
  const number = _.toNumber(cleaned);
  return {
    original: text,
    cleaned: cleaned,
    number: number,
    formatted: _.isNaN(number) ? 'Invalid' : number.toLocaleString(),
  };
};

/**
 * 14) 이메일/휴대폰 마스킹 (간단 버전)
 */
export const maskEmail = (email: string) => {
  const [local, domain] = _.split(email, '@');
  if (local.length <= 2) return email;
  return _.padEnd(local.substring(0, 2), local.length, '*') + '@' + domain;
};

export const maskPhone = (phone: string) => {
  const cleaned = _.replace(phone, /[^\d]/g, '');
  if (cleaned.length !== 11) return phone;
  return cleaned.substring(0, 3) + '-****-' + cleaned.substring(7);
};

/**
 * 15) 안전 비교: 공백/대소문자 무시
 */
export const safeCompare = (text1: string, text2: string) => {
  const normalize = (str: string) => _.toLower(_.trim(str));
  return _.isEqual(normalize(text1), normalize(text2));
};

/**
 * 16) HTML 검색 하이라이트 (간단)
 */
export const highlightSearch = (text: string, search: string) => {
  if (!search) return text;
  const regex = new RegExp(`(${_.escapeRegExp(search)})`, 'gi');
  return _.replace(text, regex, '<mark>$1</mark>');
};

/**
 * 17) 체이닝 예시: 정규화→검색키 생성
 */
export const createSearchKey = (text: string) => {
  return _.chain(text)
    .trim()
    .toLower()
    .deburr()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .value();
};

/**
 * 추가 유틸리티 함수들
 */

/**
 * 문자열 유효성 검사
 */
export const isValidString = (value: any): value is string => {
  return _.isString(value) && !_.isEmpty(value);
};

/**
 * 안전한 문자열 접근
 */
export const safeGetString = (value: any, fallback: string = ''): string => {
  return _.isString(value) ? value : fallback;
};

/**
 * 문자열 길이 제한
 */
export const limitString = (
  text: string,
  maxLength: number,
  suffix: string = '...'
) => {
  if (text.length <= maxLength) return text;
  return _.truncate(text, { length: maxLength, omission: suffix });
};

/**
 * 문자열 배열 정리 (빈 문자열 제거, 중복 제거)
 */
export const cleanStringArray = (arr: string[]) => {
  return _.chain(arr)
    .filter(str => !_.isEmpty(str))
    .uniq()
    .value();
};

/**
 * 문자열 검색 (부분 일치)
 */
export const searchInStrings = (
  items: string[],
  query: string,
  caseSensitive: boolean = false
) => {
  const searchQuery = caseSensitive ? query : _.toLower(query);

  return items.filter(item => {
    const searchItem = caseSensitive ? item : _.toLower(item);
    return _.includes(searchItem, searchQuery);
  });
};

/**
 * 문자열 그룹화 (첫 글자별)
 */
export const groupByFirstLetter = (strings: string[]) => {
  return _.groupBy(strings, str => _.toUpper(_.first(str) || ''));
};

/**
 * 문자열 통계
 */
export const getStringStats = (text: string) => {
  const words = _.words(text);
  const chars = text.length;
  const charsNoSpaces = _.replace(text, /\s/g, '').length;
  const lines = _.split(text, '\n').length;

  return {
    words: words.length,
    characters: chars,
    charactersNoSpaces: charsNoSpaces,
    lines: lines,
    averageWordLength:
      words.length > 0 ? _.round(charsNoSpaces / words.length, 2) : 0,
  };
};

/**
 * 문자열 변환 체이닝
 */
export const transformString = (
  text: string,
  transformations: Array<(str: string) => string>
) => {
  return _.reduce(
    transformations,
    (result, transform) => transform(result),
    text
  );
};

/**
 * 정규식 이스케이프
 */
export const escapeRegex = (text: string) => {
  return _.escapeRegExp(text);
};

/**
 * 문자열 비교 (다양한 옵션)
 */
export const compareStrings = (
  str1: string,
  str2: string,
  options: {
    caseSensitive?: boolean;
    trim?: boolean;
    normalize?: boolean;
  } = {}
) => {
  const { caseSensitive = false, trim = false, normalize = false } = options;

  let s1 = str1;
  let s2 = str2;

  if (trim) {
    s1 = _.trim(s1);
    s2 = _.trim(s2);
  }

  if (!caseSensitive) {
    s1 = _.toLower(s1);
    s2 = _.toLower(s2);
  }

  if (normalize) {
    s1 = _.deburr(s1);
    s2 = _.deburr(s2);
  }

  return _.isEqual(s1, s2);
};

/**
 * 문자열 템플릿 처리
 */
export const processTemplate = (
  template: string,
  data: Record<string, any>
) => {
  return _.template(template)(data);
};

/**
 * 문자열 압축 (공백 제거)
 */
export const compressString = (text: string) => {
  return _.replace(text, /\s+/g, '');
};

/**
 * 문자열 확장 (단어 사이 공백 추가)
 */
export const expandString = (text: string) => {
  return _.replace(text, /([a-z])([A-Z])/g, '$1 $2');
};

// ============================================================================
// API 데이터 처리 함수들
// ============================================================================

/**
 * Object를 Array로 변환
 */
export const objectToArray = <T>(obj: Record<string, T>): T[] => {
  return _.values(obj);
};

/**
 * Array를 Object로 변환 (지정된 키 기준)
 */
export const arrayToObject = <T>(
  arr: T[],
  keyField: keyof T
): Record<string, T> => {
  return _.keyBy(arr, keyField);
};

/**
 * 객체에서 특정 필드만 추출
 */
export const extractFields = <T extends Record<string, any>>(
  data: T[],
  fields: (keyof T)[]
): Partial<T>[] => {
  return _.map(data, item => _.pick(item, fields));
};

/**
 * 중첩된 객체에서 특정 필드 추출 및 변환
 */
export const extractAndTransform = <T extends Record<string, any>>(
  data: T[],
  transformFn: (item: T) => any
): any[] => {
  return _.map(data, transformFn);
};

/**
 * 데이터 깊은 복사
 */
export const deepClone = <T>(data: T): T => {
  return _.cloneDeep(data);
};

/**
 * 데이터 그룹핑 및 집계
 */
export const groupAndAggregate = <T extends Record<string, any>>(
  data: T[],
  groupField: keyof T,
  aggregateFn?: (group: T[]) => any
) => {
  const grouped = _.groupBy(data, groupField);

  if (!aggregateFn) {
    return grouped;
  }

  return _.mapValues(grouped, aggregateFn);
};

/**
 * 중복 제거 (지정된 필드 기준)
 */
export const removeDuplicates = <T extends Record<string, any>>(
  data: T[],
  keyField: keyof T
): T[] => {
  return _.uniqBy(data, keyField);
};

/**
 * 데이터 정렬 (단일 필드)
 */
export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortField: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return _.orderBy(data, [sortField], [order]);
};

/**
 * 데이터 정렬 (복수 필드)
 */
export const sortDataMultiple = <T extends Record<string, any>>(
  data: T[],
  sortFields: (keyof T)[],
  orders: ('asc' | 'desc')[] = ['asc']
): T[] => {
  return _.orderBy(data, sortFields, orders);
};

/**
 * 조건부 데이터 필터링
 */
export const filterData = <T>(
  data: T[],
  predicate: (item: T) => boolean
): T[] => {
  return _.filter(data, predicate);
};

/**
 * 조건부 데이터 가공
 */
export const processData = <T extends Record<string, any>>(
  data: T[],
  processFn: (item: T) => T
): T[] => {
  return _.map(data, processFn);
};

/**
 * API 요청 바디 생성
 */
export const createApiRequestBody = <T extends Record<string, any>>(
  data: T[],
  fields?: (keyof T)[],
  metadata?: Record<string, any>
) => {
  const processedData = fields ? extractFields(data, fields) : data;

  return {
    data: processedData,
    metadata: {
      totalCount: data.length,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
};

/**
 * 데이터 통계 생성
 */
export const generateStatistics = <T extends Record<string, any>>(
  data: T[],
  numericFields: (keyof T)[]
) => {
  const stats: Record<string, any> = {
    totalCount: data.length,
    fieldStats: {},
  };

  numericFields.forEach(field => {
    const values = _.map(data, field).filter(_.isNumber);
    if (values.length > 0) {
      stats.fieldStats[field as string] = {
        min: _.min(values),
        max: _.max(values),
        average: _.round(_.mean(values), 2),
        sum: _.sum(values),
      };
    }
  });

  return stats;
};

/**
 * 데이터 검색 및 찾기
 */
export const findData = <T extends Record<string, any>>(
  data: T[],
  searchCriteria: Partial<T>
): T | undefined => {
  return _.find(data, searchCriteria) as T | undefined;
};

/**
 * 데이터 존재 여부 확인
 */
export const hasData = <T extends Record<string, any>>(
  data: T[],
  searchCriteria: Partial<T>
): boolean => {
  return !!_.find(data, searchCriteria);
};

/**
 * 데이터 카운트
 */
export const countData = <T extends Record<string, any>>(
  data: T[],
  searchCriteria?: Partial<T>
): number => {
  if (!searchCriteria) {
    return data.length;
  }
  return _.filter(data, searchCriteria).length;
};

/**
 * 데이터 병합 (객체 배열)
 */
export const mergeData = <T extends Record<string, any>>(
  baseData: T[],
  mergeData: T[],
  keyField: keyof T
): T[] => {
  const baseMap = _.keyBy(baseData, keyField);
  const mergeMap = _.keyBy(mergeData, keyField);

  const merged = _.merge(baseMap, mergeMap);
  return _.values(merged);
};

/**
 * 데이터 분할 (페이지네이션)
 */
export const paginateData = <T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: _.slice(data, startIndex, endIndex),
    pagination: {
      currentPage: page,
      pageSize,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
      hasNextPage: endIndex < data.length,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * 타입 정의
 */
export type CaseConversions = ReturnType<typeof caseConversions>;
export type PaddingAndTruncate = ReturnType<typeof paddingAndTruncate>;
export type CleanAmount = ReturnType<typeof cleanAmount>;
export type StringStats = ReturnType<typeof getStringStats>;
export type CompareOptions = Parameters<typeof compareStrings>[2];

// API 데이터 처리 타입들
export type ApiRequestBody<T> = {
  data: T[];
  metadata: {
    totalCount: number;
    timestamp: string;
    [key: string]: any;
  };
};

export type PaginationResult<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type Statistics = {
  totalCount: number;
  fieldStats: Record<
    string,
    {
      min: number | undefined;
      max: number | undefined;
      average: number;
      sum: number;
    }
  >;
};

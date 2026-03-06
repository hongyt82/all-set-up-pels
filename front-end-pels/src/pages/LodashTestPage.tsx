import _ from 'lodash';
import React, { useState } from 'react';
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
import { Textarea } from '../components/ui/textarea';

/**
 * Lodash 기능 테스트 페이지
 * 다양한 Lodash 유틸리티 함수들의 사용법을 테스트할 수 있는 페이지
 */
const LodashTestPage: React.FC = () => {
  // 입력값 상태
  const [inputText, setInputText] = useState(
    'Hello World! This is a test string with  spaces   and   special   characters.'
  );
  const [searchText, setSearchText] = useState('world');
  const [replaceText, setReplaceText] = useState('Lodash');
  const [pattern, setPattern] = useState('\\s+');
  const [email, setEmail] = useState('test@example.com');
  const [phone, setPhone] = useState('010-1234-5678');
  const [amount, setAmount] = useState('1,234,567원');
  const [htmlText, setHtmlText] = useState(
    '<p>This is a <strong>test</strong> HTML string</p>'
  );

  // 결과 상태
  const [results, setResults] = useState<Record<string, any>>({});

  // 0) 안전한 문자열화
  const safeStringify = (value: any) => {
    try {
      return _.isString(value) ? value : JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  // 1) 문자열 분해 (limit 지원)
  const splitString = (
    text: string,
    separator: string = ' ',
    limit?: number
  ) => {
    return _.split(text, separator, limit);
  };

  // 2) 포함 여부 (대소문자 무시)
  const includesIgnoreCase = (text: string, search: string) => {
    return _.includes(_.toLower(text), _.toLower(search));
  };

  // 3) 단건 치환 (첫 매치만)
  const replaceFirst = (text: string, search: string, replace: string) => {
    return _.replace(text, search, replace);
  };

  // 4) 전체 치환 (문자열 패턴, 대소문자 옵션)
  const replaceAll = (
    text: string,
    search: string,
    replace: string,
    ignoreCase: boolean = false
  ) => {
    const flags = ignoreCase ? 'gi' : 'g';
    const regex = new RegExp(_.escapeRegExp(search), flags);
    return _.replace(text, regex, replace);
  };

  // 5) 전체 치환 (정규식 패턴 직접 입력)
  const replaceRegex = (text: string, pattern: string, replace: string) => {
    const regex = new RegExp(pattern, 'g');
    return _.replace(text, regex, replace);
  };

  // 6) 특정 문자열(들) 삭제
  const removeStrings = (text: string, toRemove: string[]) => {
    return _.reduce(
      toRemove,
      (result, str) => {
        return _.replace(result, new RegExp(_.escapeRegExp(str), 'g'), '');
      },
      text
    );
  };

  // 7) 공백 정규화: 앞뒤 trim + 내부 다중 공백 1칸
  const normalizeWhitespace = (text: string) => {
    return _.replace(_.trim(text), /\s+/g, ' ');
  };

  // 8) 케이스/표기 변환
  const caseConversions = (text: string) => {
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

  // 9) 악센트/전각 제거(라틴 위주) → 슬러그 전처리 등
  const removeAccents = (text: string) => {
    return _.deburr(text);
  };

  // 10) HTML 엔티티 이스케이프/역변환
  const htmlEscape = (text: string) => {
    return _.escape(text);
  };

  const htmlUnescape = (text: string) => {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  };

  // 11) 패딩 & 트렁케이트
  const paddingAndTruncate = (text: string, length: number = 20) => {
    return {
      padStart: _.padStart(text, length, '0'),
      padEnd: _.padEnd(text, length, '-'),
      pad: _.pad(text, length),
      truncate: _.truncate(text, { length, omission: '...' }),
    };
  };

  // 12) 단어 토큰 (영문/숫자 위주)
  const wordTokens = (text: string) => {
    return _.words(text, /[a-zA-Z0-9가-힣]+/g);
  };

  // 13) 금액/숫자 문자열 정제 → number (천단위 콤마/원/공백 제거)
  const cleanAmount = (text: string) => {
    const cleaned = _.replace(text, /[,\s원]/g, '');
    const number = _.toNumber(cleaned);
    return {
      original: text,
      cleaned: cleaned,
      number: number,
      formatted: _.isNaN(number) ? 'Invalid' : number.toLocaleString(),
    };
  };

  // 14) 이메일/휴대폰 마스킹 (간단 버전)
  const maskEmail = (email: string) => {
    const [local, domain] = _.split(email, '@');
    if (local.length <= 2) return email;
    return _.padEnd(local.substring(0, 2), local.length, '*') + '@' + domain;
  };

  const maskPhone = (phone: string) => {
    const cleaned = _.replace(phone, /[^\d]/g, '');
    if (cleaned.length !== 11) return phone;
    return cleaned.substring(0, 3) + '-****-' + cleaned.substring(7);
  };

  // 15) 안전 비교: 공백/대소문자 무시
  const safeCompare = (text1: string, text2: string) => {
    const normalize = (str: string) => _.toLower(_.trim(str));
    return _.isEqual(normalize(text1), normalize(text2));
  };

  // 16) HTML 검색 하이라이트 (간단)
  const highlightSearch = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${_.escapeRegExp(search)})`, 'gi');
    return _.replace(text, regex, '<mark>$1</mark>');
  };

  // 17) 체이닝 예시: 정규화→검색키 생성
  const createSearchKey = (text: string) => {
    return _.chain(text)
      .trim()
      .toLower()
      .deburr()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .value();
  };

  // 모든 테스트 실행
  const runAllTests = () => {
    const newResults: Record<string, any> = {};

    // 0) 안전한 문자열화
    newResults.safeStringify = {
      string: safeStringify('Hello'),
      number: safeStringify(123),
      object: safeStringify({ test: 'value' }),
      null: safeStringify(null),
      undefined: safeStringify(undefined),
    };

    // 1) 문자열 분해
    newResults.splitString = {
      basic: splitString(inputText),
      withLimit: splitString(inputText, ' ', 3),
      customSeparator: splitString(inputText, 'i'),
    };

    // 2) 포함 여부
    newResults.includesIgnoreCase = {
      search: searchText,
      result: includesIgnoreCase(inputText, searchText),
      caseSensitive: _.includes(inputText, searchText),
    };

    // 3) 단건 치환
    newResults.replaceFirst = {
      original: inputText,
      result: replaceFirst(inputText, 'World', replaceText),
    };

    // 4) 전체 치환
    newResults.replaceAll = {
      caseSensitive: replaceAll(inputText, 'i', 'I', false),
      ignoreCase: replaceAll(inputText, 'i', 'I', true),
    };

    // 5) 정규식 치환
    newResults.replaceRegex = {
      pattern: pattern,
      result: replaceRegex(inputText, pattern, ' '),
    };

    // 6) 문자열 삭제
    newResults.removeStrings = {
      original: inputText,
      result: removeStrings(inputText, ['World', 'test']),
    };

    // 7) 공백 정규화
    newResults.normalizeWhitespace = {
      original: inputText,
      result: normalizeWhitespace(inputText),
    };

    // 8) 케이스 변환
    newResults.caseConversions = caseConversions(inputText);

    // 9) 악센트 제거
    newResults.removeAccents = {
      original: 'café naïve résumé',
      result: removeAccents('café naïve résumé'),
    };

    // 10) HTML 이스케이프
    newResults.htmlEscape = {
      original: htmlText,
      escaped: htmlEscape(htmlText),
      unescaped: htmlUnescape(htmlEscape(htmlText)),
    };

    // 11) 패딩 & 트렁케이트
    newResults.paddingAndTruncate = paddingAndTruncate(inputText, 30);

    // 12) 단어 토큰
    newResults.wordTokens = wordTokens(inputText);

    // 13) 금액 정제
    newResults.cleanAmount = cleanAmount(amount);

    // 14) 마스킹
    newResults.masking = {
      email: {
        original: email,
        masked: maskEmail(email),
      },
      phone: {
        original: phone,
        masked: maskPhone(phone),
      },
    };

    // 15) 안전 비교
    newResults.safeCompare = {
      text1: 'Hello World',
      text2: '  hello world  ',
      result: safeCompare('Hello World', '  hello world  '),
    };

    // 16) 하이라이트
    newResults.highlightSearch = {
      original: inputText,
      search: searchText,
      result: highlightSearch(inputText, searchText),
    };

    // 17) 체이닝
    newResults.createSearchKey = {
      original: inputText,
      result: createSearchKey(inputText),
    };

    setResults(newResults);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Lodash 기능 테스트 페이지</h1>
        <p className="text-muted-foreground">
          다양한 Lodash 유틸리티 함수들의 사용법을 테스트할 수 있습니다.
        </p>
      </div>

      {/* 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>입력값 설정</CardTitle>
          <CardDescription>
            테스트할 문자열과 옵션을 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inputText">기본 텍스트</Label>
              <Textarea
                id="inputText"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="테스트할 문자열을 입력하세요"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="searchText">검색 텍스트</Label>
              <Input
                id="searchText"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="검색할 문자열"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replaceText">치환 텍스트</Label>
              <Input
                id="replaceText"
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                placeholder="치환할 문자열"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">정규식 패턴</Label>
              <Input
                id="pattern"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="\\s+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일 (마스킹 테스트)</Label>
              <Input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">휴대폰 (마스킹 테스트)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">금액 (정제 테스트)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1,234,567원"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="htmlText">HTML 텍스트</Label>
              <Input
                id="htmlText"
                value={htmlText}
                onChange={e => setHtmlText(e.target.value)}
                placeholder="<p>HTML string</p>"
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

          {/* 0) 안전한 문자열화 */}
          {results.safeStringify && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">0</Badge>
                  안전한 문자열화
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>문자열:</strong> {results.safeStringify.string}
                  </div>
                  <div>
                    <strong>숫자:</strong> {results.safeStringify.number}
                  </div>
                  <div>
                    <strong>객체:</strong> {results.safeStringify.object}
                  </div>
                  <div>
                    <strong>null:</strong> {results.safeStringify.null}
                  </div>
                  <div>
                    <strong>undefined:</strong>{' '}
                    {results.safeStringify.undefined}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 1) 문자열 분해 */}
          {results.splitString && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  문자열 분해 (limit 지원)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>기본 분해:</strong>{' '}
                    {JSON.stringify(results.splitString.basic)}
                  </div>
                  <div>
                    <strong>Limit 3:</strong>{' '}
                    {JSON.stringify(results.splitString.withLimit)}
                  </div>
                  <div>
                    <strong>Custom separator:</strong>{' '}
                    {JSON.stringify(results.splitString.customSeparator)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2) 포함 여부 */}
          {results.includesIgnoreCase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  포함 여부 (대소문자 무시)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>검색어:</strong> {results.includesIgnoreCase.search}
                  </div>
                  <div>
                    <strong>대소문자 무시:</strong>{' '}
                    {results.includesIgnoreCase.result ? '찾음' : '없음'}
                  </div>
                  <div>
                    <strong>대소문자 구분:</strong>{' '}
                    {results.includesIgnoreCase.caseSensitive ? '찾음' : '없음'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3) 단건 치환 */}
          {results.replaceFirst && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  단건 치환 (첫 매치만)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.replaceFirst.original}
                  </div>
                  <div>
                    <strong>결과:</strong> {results.replaceFirst.result}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4) 전체 치환 */}
          {results.replaceAll && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  전체 치환 (문자열 패턴, 대소문자 옵션)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>대소문자 구분:</strong>{' '}
                    {results.replaceAll.caseSensitive}
                  </div>
                  <div>
                    <strong>대소문자 무시:</strong>{' '}
                    {results.replaceAll.ignoreCase}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5) 정규식 치환 */}
          {results.replaceRegex && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  전체 치환 (정규식 패턴 직접 입력)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>패턴:</strong> {results.replaceRegex.pattern}
                  </div>
                  <div>
                    <strong>결과:</strong> {results.replaceRegex.result}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 6) 문자열 삭제 */}
          {results.removeStrings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">6</Badge>
                  특정 문자열(들) 삭제
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.removeStrings.original}
                  </div>
                  <div>
                    <strong>결과:</strong> {results.removeStrings.result}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7) 공백 정규화 */}
          {results.normalizeWhitespace && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">7</Badge>
                  공백 정규화: 앞뒤 trim + 내부 다중 공백 1칸
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> "
                    {results.normalizeWhitespace.original}"
                  </div>
                  <div>
                    <strong>결과:</strong> "{results.normalizeWhitespace.result}
                    "
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 8) 케이스 변환 */}
          {results.caseConversions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">8</Badge>
                  케이스/표기 변환
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(results.caseConversions).map(
                    ([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {safeStringify(value)}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 9) 악센트 제거 */}
          {results.removeAccents && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">9</Badge>
                  악센트/전각 제거(라틴 위주) → 슬러그 전처리 등
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.removeAccents.original}
                  </div>
                  <div>
                    <strong>결과:</strong> {results.removeAccents.result}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 10) HTML 이스케이프 */}
          {results.htmlEscape && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">10</Badge>
                  HTML 엔티티 이스케이프/역변환
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.htmlEscape.original}
                  </div>
                  <div>
                    <strong>이스케이프:</strong> {results.htmlEscape.escaped}
                  </div>
                  <div>
                    <strong>역변환:</strong> {results.htmlEscape.unescaped}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 11) 패딩 & 트렁케이트 */}
          {results.paddingAndTruncate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">11</Badge>
                  패딩 & 트렁케이트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>padStart:</strong>{' '}
                    {results.paddingAndTruncate.padStart}
                  </div>
                  <div>
                    <strong>padEnd:</strong> {results.paddingAndTruncate.padEnd}
                  </div>
                  <div>
                    <strong>pad:</strong> {results.paddingAndTruncate.pad}
                  </div>
                  <div>
                    <strong>truncate:</strong>{' '}
                    {results.paddingAndTruncate.truncate}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 12) 단어 토큰 */}
          {results.wordTokens && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">12</Badge>
                  단어 토큰 (영문/숫자 위주)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <strong>토큰:</strong> {JSON.stringify(results.wordTokens)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 13) 금액 정제 */}
          {results.cleanAmount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">13</Badge>
                  금액/숫자 문자열 정제 → number (천단위 콤마/원/공백 제거)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.cleanAmount.original}
                  </div>
                  <div>
                    <strong>정제:</strong> {results.cleanAmount.cleaned}
                  </div>
                  <div>
                    <strong>숫자:</strong> {results.cleanAmount.number}
                  </div>
                  <div>
                    <strong>포맷팅:</strong> {results.cleanAmount.formatted}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 14) 마스킹 */}
          {results.masking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">14</Badge>
                  이메일/휴대폰 마스킹 (간단 버전)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>이메일 원본:</strong>{' '}
                    {results.masking.email.original}
                  </div>
                  <div>
                    <strong>이메일 마스킹:</strong>{' '}
                    {results.masking.email.masked}
                  </div>
                  <div>
                    <strong>휴대폰 원본:</strong>{' '}
                    {results.masking.phone.original}
                  </div>
                  <div>
                    <strong>휴대폰 마스킹:</strong>{' '}
                    {results.masking.phone.masked}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 15) 안전 비교 */}
          {results.safeCompare && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">15</Badge>
                  안전 비교: 공백/대소문자 무시
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>텍스트1:</strong> "{results.safeCompare.text1}"
                  </div>
                  <div>
                    <strong>텍스트2:</strong> "{results.safeCompare.text2}"
                  </div>
                  <div>
                    <strong>비교 결과:</strong>{' '}
                    {results.safeCompare.result ? '일치' : '불일치'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 16) 하이라이트 */}
          {results.highlightSearch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">16</Badge>
                  HTML 검색 하이라이트 (간단)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.highlightSearch.original}
                  </div>
                  <div>
                    <strong>검색어:</strong> {results.highlightSearch.search}
                  </div>
                  <div>
                    <strong>하이라이트:</strong>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: results.highlightSearch.result,
                      }}
                      className="mt-1 p-2 bg-gray-100 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 17) 체이닝 */}
          {results.createSearchKey && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">17</Badge>
                  체이닝 예시: 정규화→검색키 생성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>원본:</strong> {results.createSearchKey.original}
                  </div>
                  <div>
                    <strong>검색키:</strong> {results.createSearchKey.result}
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

export default LodashTestPage;

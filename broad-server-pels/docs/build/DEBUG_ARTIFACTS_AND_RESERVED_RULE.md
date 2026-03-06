# 디버그 아티팩트 & reservedStrings 누락 방지 룰

이 문서는 다음 2가지를 프로젝트에 적용한 내용과 사용법을 정리합니다.

1. **디버그용 아티팩트**(난독화 없이 + sourcemap) 생성
2. **reservedStrings 누락 방지 룰**(빌드 전에 자동 검증 → 누락 시 빌드 실패)

---

## 1. 생성되는 산출물

`cd server && npm run build` 실행 시 `dist/`에 아래 파일이 생성됩니다.

| 파일 | 용도 |
|------|------|
| `dist/index.js` | **배포/운영용** (번들 + 난독화 적용) |
| `dist/index.debug.js` | **디버그용** (난독화 없음, sourcemap 포함) |
| `dist/index.debug.js.map` | 디버그용 sourcemap |

> `dist/index.js`는 배포용 단일 파일이며, `dist/index.debug.js`는 운영 장애 분석/로컬 재현용 아티팩트입니다.

---

## 2. 디버그 아티팩트 사용법

### 2.1 실행

```bash
cd server
NODE_ENV=production node dist/index.debug.js
```

### 2.2 sourcemap 기반 스택트레이스(권장)

Node 18+에서 sourcemap을 적극 활용하려면:

```bash
cd server
NODE_ENV=production node --enable-source-maps dist/index.debug.js
```

- 오류 발생 시 스택트레이스가 **src 기준**으로 더 읽기 쉽게 출력됩니다.

---

## 3. reservedStrings 누락 방지 룰

### 3.1 source of truth

- `server/build/reservedStrings.json`

난독화 시 런타임에서 **절대 변경되면 안 되는 문자열**(프로토콜 type, event, JSON 키, .env 파일명 등)은 이 JSON 파일에 관리합니다.

### 3.2 자동 검증 동작

`npm run build` 실행 시, 빌드가 시작되기 전에 다음 검증이 수행됩니다.

- 스캔 대상: `server/src/**`, `server/config/**`
- 추출 대상(핵심만):
  - `switch(type) { case '...' }` 의 **type 문자열**
  - `data.type === '...'` 형태의 **비교 문자열**
  - `value.event === '...'` 형태의 **event 문자열**
  - `.env`, `.env.production`, `.env.dev` 등 **env 파일명**
  - `production/development/dev` 등 **NODE_ENV 값**
  - 프로토콜 핵심 키(`type`, `roomId`, `value`, `event`, `user`, `targetClientId`)는 안전을 위해 앵커로 포함

검증 실패 시 예:

```
[build] Missing reservedStrings entries:
- myNewMessageType
- payload

Add them to: build/reservedStrings.json
```

즉, 누락이 있으면 **빌드가 실패**해서, 배포물(dist)이 깨진 상태로 만들어지는 것을 사전에 차단합니다.

### 3.3 수동 실행 (필요 시)

```bash
cd server
npm run check:reserved
```

실제 실행 스크립트: `server/build/check_reserved_strings.cjs`

---

## 4. 개발자가 기능 추가/수정할 때의 최소 루틴

1. 프로토콜에 새 문자열이 들어가면 `build/reservedStrings.json` 업데이트
2. `npm run build` (누락이면 여기서 바로 실패)
3. `NODE_ENV=production node dist/index.js` + health 확인
4. 필요 시 `dist/index.debug.js`로 로컬 재현 및 스택트레이스 확인

---

## 5. 관련 문서

- [BUILD.md](BUILD.md) — 빌드 및 스모크 테스트
- [OBFUSCATION_BUNDLE_NOTES.md](OBFUSCATION_BUNDLE_NOTES.md) — 소스 수정/추가 구현 시 유의사항


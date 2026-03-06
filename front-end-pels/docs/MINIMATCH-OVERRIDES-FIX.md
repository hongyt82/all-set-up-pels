# minimatch 보안 취약점 수정 내역

## 개요

npm audit에서 보고되던 **minimatch** 관련 High 심각도 취약점 18건을 **package.json overrides**로 해결한 내용을 정리한 문서입니다.

---

## 취약점 정보

| 항목 | 내용 |
|------|------|
| **패키지** | minimatch (transitive dependency) |
| **취약점** | ReDoS (Regular Expression Denial of Service) |
| **CVE / Advisory** | GHSA-3ppc-4f35-3m26 |
| **해결 버전** | minimatch **≥ 10.2.1** |
| **영향** | ESLint, typescript-eslint, glob, @babel/cli 등 devDependencies를 통해 간접 의존되던 구버전 minimatch |

---

## 적용한 수정 사항

### 1. `package.json` — overrides 추가

**위치:** `front-end-pers/package.json` (최상위, `devDependencies`와 동일 레벨)

**추가된 내용:**

```json
"overrides": {
  "minimatch": ">=10.2.1"
}
```

- 프로젝트 전체(직접·간접 의존성)에서 사용되는 **minimatch** 버전을 **10.2.1 이상**으로 고정합니다.
- npm이 lock 파일 생성 시 이 조건에 맞는 버전을 사용하도록 합니다.

### 2. lock 파일 갱신

- **`npm install`** 실행으로 overrides가 반영되었고, **package-lock.json**이 갱신되었습니다.
- 설치 결과: `added 1 package, removed 22 packages, changed 1 package` (minimatch 관련 정리)

### 3. 검증

- **`npm audit`** 실행 결과: **0 vulnerabilities**
- 기존 18건 High 심각도 minimatch 취약점이 모두 제거된 상태로 확인되었습니다.

---

## 수정 일자 및 범위

- **수정 일:** 2025-02-20
- **수정 파일**
  - `front-end-pers/package.json` — `overrides` 섹션 추가
  - `front-end-pers/package-lock.json` — overrides 반영으로 자동 갱신

---

## 참고 사항

- **minimatch 10.x**는 major 버전 변경이므로, 일부 호출 방식이 바뀔 수 있습니다.  
  현재 overrides는 **devDependencies** 쪽(ESLint·빌드 도구 등)에서만 사용되는 ReDoS 수정 목적이며, `npm run lint`, `npm run build` 등으로 동작을 확인하는 것을 권장합니다.
- **package-lock.json** 변경분은 재현 가능한 설치를 위해 **커밋하는 것을 권장**합니다.

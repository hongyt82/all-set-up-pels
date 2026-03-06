# all-set-up-pels

PELS 관련 프로젝트를 담는 루트입니다. 부모 POM 없이 **각 모듈별 .iml** 로 IntelliJ에서 묶는 구조입니다.

- Maven 빌드 출력: **PELS/target**

## 구조

```
all-set-up-pels/
├── .idea/
│   ├── modules.xml       # 루트 + broad-server-pels, front-end-pels 모듈 등록 (PELS는 루트 .iml에서 참조)
│   └── misc.xml          # PELS/pom.xml Maven 프로젝트 등록
├── all-set-up-pels.iml   # 루트 aggregator (PELS 웹 루트 참조, 하위 모듈 참조)
├── PELS/                 # Maven 웹 프로젝트 (Spring MVC + MyBatis, WAR)
│   ├── PELS.iml
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java
│       │   ├── resources
│       │   └── webapp/   # WEB-INF, JSP, 정적 리소스
│       └── test/
├── broad-server-pels/    # 중계 서버 모듈 (Node WebSocket)
│   ├── broad-server-pels.iml
│   ├── package.json
│   ├── src/
│   └── builder/
└── front-end-pels/       # 프론트엔드 모듈 (Vite + React, TypeScript)
    ├── front-end-pels.iml
    ├── package.json
    ├── vite.config.ts
    └── src/
```

## 모듈 설명

| 모듈                    | 설명                                                       |
|-------------------------|------------------------------------------------------------|
| **PELS**                | PELS 웹 앱 (Maven, Tomcat 배포). 독립 `pom.xml` 보유.      |
| **broad-server-pels**   | 중계 서버 모듈. Node 기반 WebSocket. Maven과 무관.         |
| **front-end-pels**      | PELS 프론트엔드 모듈. Vite + React (TypeScript).           |

## 빌드

- **PELS**: `cd PELS && mvn clean package` (또는 IntelliJ Maven 도구에서 PELS 모듈만 실행)
- **broad-server-pels**: `cd broad-server-pels && npm install` (필요 시), `npm run build`
- **front-end-pels**: `cd front-end-pels && npm install` (필요 시), `npm run build` (또는 `npm run build:prod`)

## 실행

- PELS: Tomcat 9에 WAR 배포. VM 옵션 `-DstartMode=local` 권장.
- IntelliJ **Run → Edit Configurations**의 **Tomcat PELS**로 기동 가능. Application server에 Tomcat 한 번 등록 필요.

## IDE (IntelliJ)

- **File → Open**으로 `all-set-up-pels` 폴더를 열면 루트와 PELS·broad-server-pels·front-end-pels 모듈이 함께 로드됩니다.
- **PELS (Maven)**
  - 루트 `.idea/misc.xml`에 `PELS/pom.xml`이 Maven 프로젝트로 등록되어 있어, 프로젝트를 **외부에서 받은 뒤 처음 열 때** IntelliJ가 해당 pom을 인식하고 Maven 임포트를 시도할 수 있습니다.
  - Maven 의존성이 안 잡혀 있으면: **PELS/pom.xml** 우클릭 → **Maven** → **Reload Project** 한 번 실행하면 됩니다.
  - 수동으로 Maven 프로젝트 추가: **Maven** 도구창에서 **+** → `PELS/pom.xml` 선택 → **Open**.
- **broad-server-pels**, **front-end-pels**: .iml + package.json 기준 Node/프론트엔드 프로젝트.

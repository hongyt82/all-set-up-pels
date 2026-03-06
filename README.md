# all-set-up-pers

PERS 관련 프로젝트를 담는 루트입니다. 부모 POM 없이 **각 모듈별 .iml** 로 IntelliJ에서 묶는 구조입니다.

- 상세 설명: [docs/Pers-target-Maven-build.md](Pers/docs/Pers-target-Maven-build.md) (Pers/target, Maven 빌드 출력)

## 구조

```
all-set-up-pers/
├── .idea/
│   └── modules.xml       # 루트 + 각 모듈 .iml 등록
├── all-set-up-pers.iml   # 루트 aggregator (하위 모듈만 참조)
├── Pers/                 # Maven 웹 프로젝트 (Spring MVC + MyBatis, WAR)
│   ├── Pers.iml
│   ├── pom.xml
│   ├── src/
│   └── WebContent/
├── broad-server-pers/     # 중계 서버 모듈 (Node 기반)
│   ├── broad-server-pers.iml
│   └── package.json
└── front-end-pers/       # 프론트엔드 모듈 (React 기반)
    ├── front-end-pers.iml
    └── package.json
```

## 모듈 설명

| 모듈                    | 설명                                            |
|-----------------------|-----------------------------------------------|
| **Pers**              | PERS 웹 앱 (Maven, Tomcat 배포). 독립 `pom.xml` 보유. |
| **broad-server-pers** | 중계 서버 모듈. Node 기반. Maven과 무관.                 |
| **front-end-pers**    | PERS 프론트엔드 모듈. Node 기반.                       |

## 빌드

- **Pers**: `cd Pers && mvn clean package` (또는 IntelliJ Maven 도구에서 Pers 모듈만 실행)
- **broad-server-pers**: `cd sync-server-pers && npm install` (필요 시), 이후 스크립트/프레임워크에 따라 `npm run build` 등
- **front-end-pers**: `cd front-end-pers && npm install` (필요 시), 이후 프레임워크에 따라 `npm run build` 등

## 실행

- Pers: Tomcat 9에 WAR 배포. VM 옵션 `-DstartMode=local` 권장.
- IntelliJ **Run → Edit Configurations**의 **Tomcat Pers**로 기동 가능. Application server에 Tomcat 한 번 등록 필요.

## IDE (IntelliJ)

- **File → Open**으로 `all-set-up-pers` 폴더를 열면 루트와 Pers·sync-server-pers·front-end-pers 모듈이 함께 로드됩니다.
- **Pers (Maven)**  
  - 루트 `.idea/misc.xml`에 `Pers/pom.xml`이 Maven 프로젝트로 등록되어 있어, 프로젝트를 **외부에서 받은 뒤 처음 열 때** IntelliJ가 해당 pom을 인식하고 Maven 임포트를 시도할 수 있습니다.  
  - Maven 의존성이 안 잡혀 있으면: **Pers/pom.xml** 우클릭 → **Maven** → **Reload Project** 한 번 실행하면 됩니다.  
  - 수동으로 Maven 프로젝트 추가: **Maven** 도구창에서 **+** → `Pers/pom.xml` 선택 → **Open**.
- **broad-server-pers**, **front-end-pers**: .iml + package.json 기준 Node/프론트엔드 프로젝트.

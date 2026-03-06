

````
API 는 Axios (구 Ajax 같은 유형) 라이브러리를 사용한다.

APITestPage.tsx 를 추가하였으며 해당 페이지에서 어떻게 사용하는지 전면 예시가 있다.
HomePage.tsx 화면 맨하단에 진입 버튼 만들어 놓았다. 

-------------------------------------------------------------
 
실제 Axios 라이브러리와 연관되어 있는 상위 구현체 

1. lib/
하단경로에 repository 폴더 BaseRepository.ts , UserRepository.ts
apiClient.ts, fileService.ts http.ts requestBuilder.ts  

2. common/ 
PDF 업로드 / 다운로드관련 공통 현재의 사항의 메인 수행 요청부는 fileService.ts 와 연관이 있다. 
FileUpload.tsx , FileUpload.tsx  

현재 API 가 지향하는 Root URL 설정 관련 

1. 상위 경로에 존재하는 .env , .env.dev , .env.localdev , .env.production

현재 각 타겟별 .env 파일내에 VITE_PROXY_DOT_DO 속성이 있음 현재의 사항을 true (API Main URL 이 .do 로 끝나는 URL 형태의 대응) 로 변경하면
그 값을 바라보고 config.ts 파일에서 getEffectiveApiBaseUrl 현재 함수를 통해 .do 로 끝나는 부분제외 공통 상위 경로 예를들면
파라미터 제외하고 .do 부분제외 상위경로가 [http://10.10.10.100/docs]/request.do , [http://10.10.10.100/docs]/request_1.do
현재와 같을때 공통 상위의 경로를 반환한다. 각 .env 파일안에 VITE_API_LEGACY_URL 를 반환함 그니까 현재의 속성에다가는 
사용하는 공통 상위 경로를 기재함 http://10.10.10.100/docs 현재의 부분 서브패스도 공통 부분이 없다면 http://10.10.10.100/ 현재와 같이 될 것임
추가로 현재 VITE_PROXY_DOT_DO 속성은 CORS 설정을 하는 부분과도 연관이 있다. CORS 설정에 대한 부분은 vite.config.ts 쪽에 설정이 되어 있다.
    

getProxyDotDoEnabled => .do 로 끝나는 레거시 모드 사용할건지 true / 내부에서 테스트용일때는 false
getEffectiveApiBaseUrl => getProxyDotDoEnabled 가 true 면 각 타겟별 .env 파일내에 VITE_API_LEGACY_URL 에 기재한 부분 리턴됨
false 면 각 타겟별 .env 파일내에 VITE_API_URL 에 기재한 부분 리턴됨

````

````
package.json 에서 각 Target 별로 돌려서 
실행분기별로 소스로직에 대한 처리가 필요할때 
필요한 사항들 
config.ts 파일내에 하기의 사항 사용 
일일이 만들어서 하지말고 해당 사항들 가져다 사용

해당 위치에 소스내부에 주석 달아놨으니까 확인하고 사용
- APP_MODE
- getCurrentOrigin
- getExternalPublicUrl
- getProxyDotDoEnabled
- getApiBaseUrl
- getLegacyApiBaseUrl
- getEffectiveApiBaseUrl

````
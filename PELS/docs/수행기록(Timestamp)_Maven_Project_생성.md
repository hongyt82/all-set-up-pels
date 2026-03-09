# 수행기록(Timestamp) Maven Project 생성

###### 기존 Java Dynamic Web Project를 Maven Project로 생성한다.

---

## 📋 목차
##### 1. 소스코드 이동
##### 2. pom.xml 만들기
##### 3. 소스 {경로} 수정
##### 4. Maven project로 인식시키기
##### 5. IntelliJ 프로젝트 설정 확인
##### 6. IntelliJ Maven 빌드 캐시 초기화

---
---

### 1. 소스코드 이동
#### Maven 표준
- src/main/java : 자바 소스
- src/main/resources : properties, xml 등 리소스
- src/main/webapp : JSP, html, css, js, WEB-INF/
- src/test/java : 테스트
- src/test/resources : 테스트 리소스

#### 소스코드 이동
- src -> src/main/java
- WebContent/META-INF -> src/main/webapp/META-INF
- WebContent/mpps -> 삭제
- WebContent/resources -> src/main/webapp/resources
- WebContent/oz80 -> 삭제
- WebContent/aa.html -> src/main/webapp/aa.html
- WebContent/index.jsp -> src/main/webapp/index.jsp
- WebContent/WEB-INF/classes/api-config.yml : src/main/resources/api-config.yml
- WebContent/WEB-INF/classes : 삭제
- WebContent/WEB-INF/config -> src/main/resources/config
- WebContent/WEB-INF/jsp -> src/main/webapp/WEB-INF/jsp
- WebContent/WEB-INF/lib -> pom.xml에 dependency 설정 후 삭제, 로컬 라이브러리는 그대로 유지
- WebContent/WEB-INF/sqlmap -> src/main/resources/sqlmap
- WebContent/WEB-INF/mpps_exam.xml -> 삭제
- WebContent/WEB-INF/web.xml -> src/main/webapp/WEB-INF/web.xml

---

### 2. pom.xml 만들기
#### 프로젝트 기본 설정

```xml
<modelVersion>4.0.0</modelVersion>

<groupId>com.khnp</groupId>
<artifactId>PELS</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>war</packaging>
<name>PELS</name>
<description>수행기록(Timestamp) 웹 애플리케이션 (Spring MVC + MyBatis)</description>

<properties>
	<maven.compiler.source>1.8</maven.compiler.source>
	<maven.compiler.target>1.8</maven.compiler.target>
	<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	<spring.version>5.2.0.RELEASE</spring.version>
	<spring.security.version>3.1.1.RELEASE</spring.security.version>
	<mybatis.version>3.5.2</mybatis.version>
	<mybatis.spring.version>2.0.2</mybatis.spring.version>
	<jackson.version>2.20.1</jackson.version>
</properties>
```

#### dependency 설정
Webcontent/WEB-INF/lib/ 하위 라이브러리를 maven dependency로 치환
```xml
<dependencies>
	<!-- Servlet / JSP -->
	<dependency>
		<groupId>javax.servlet</groupId>
		<artifactId>javax.servlet-api</artifactId>
		<version>4.0.1</version>
		<scope>provided</scope>
	</dependency>
	<dependency>
		<groupId>javax.servlet</groupId>
		<artifactId>jstl</artifactId>
		<version>1.2</version>
	</dependency>

	..........

	<!-- wisenut search (로컬 라이브러리) -->
	<dependency>
		<groupId>kr.co.wisenut</groupId>
		<artifactId>wisenut30</artifactId>
		<version>1.4.2</version>
		<scope>system</scope>
		<systemPath>${project.basedir}/src/main/webapp/WEB-INF/lib/wisenut30.jar</systemPath>
	</dependency>
</dependencies>
```

#### build 경로 수정
```xml
<build>
<!--	<sourceDirectory>src</sourceDirectory>-->
	<sourceDirectory>src/main/java</sourceDirectory>
	<plugins>
		<plugin>
			<groupId>org.apache.maven.plugins</groupId>
			<artifactId>maven-war-plugin</artifactId>
			<version>3.3.2</version>
			<configuration>
				<!--<warSourceDirectory>src</warSourceDirectory>-->
				<warSourceDirectory>src/main/webapp</warSourceDirectory>
				<failOnMissingWebXml>false</failOnMissingWebXml>
			</configuration>
		</plugin>
		<plugin>
			<groupId>org.apache.maven.plugins</groupId>
			<artifactId>maven-dependency-plugin</artifactId>
			<version>3.2.0</version>
		</plugin>
	</plugins>
</build>
```

---

### 3. 소스 {경로} 수정
#### web.xml - LogbackConfigListener listener 제거
기동시 오류 방지, logback.xml로 충분
```xml
<!--<listener>-->
<!--  <listener-class>ch.qos.logback.ext.spring.web.LogbackConfigListener</listener-class>-->
<!--</listener>-->
```

#### web.xml - logbackConfigLocation 경로 수정
```xml
<context-param>
  <param-name>logbackConfigLocation</param-name>
<!--  <param-value>/WEB-INF/config/logback.xml</param-value>-->
  <param-value>classpath:config/logback.xml</param-value>
</context-param>
```

#### web.xml - contextConfigLocation 경로 수정
```xml
<context-param>
  <param-name>contextConfigLocation</param-name>
<!--  <param-value>/WEB-INF/config/applicationContext.xml</param-value>-->
  <param-value>classpath:config/applicationContext.xml</param-value>
</context-param>
```

#### web.xml - dispatcher-servlet contextConfigLocation 경로 수정
```xml
<servlet>
  <servlet-name>dispatcher</servlet-name>
  <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  <init-param>
    <param-name>contextConfigLocation</param-name>
<!--    <param-value>/WEB-INF/config/dispatcher-servlet.xml</param-value>-->
    <param-value>classpath:config/dispatcher-servlet.xml</param-value>
  </init-param>
  <load-on-startup>1</load-on-startup>
  <async-supported>true</async-supported>
</servlet>
```

#### applicationContext.xml - 중복 선언 제거
- <context:annotation-config /> dispatcher-servlet.xml에 중복 선언 삭제
- porperty location 변경

/WEB-INF/config/props... -> classpath:config/props...

- mapperLocations 변경

/WEB-INF/sqlmap... -> classpath:sqlmap...

- configLocation 변경

/WEB-INF/config/mybatis-context.xml -> classpath:config/mybatis-context.xml

---

### 4. Maven project로 인식시키기
##### (1) pom.xml 열기
##### (2) 상단에 뜨는 “Add as Maven Project” 누르기 또는 View > Tool Windows > Maven
##### (3) Maven 창에서 Reload All Maven Projects 클릭

---

### 5. IntelliJ 프로젝트 설정 확인
##### (1) Project Structure > Modules > Sources 탭
- 언어수준: 8 - 람다, 타입 어노테이션 등
- src/main/java = Sources
- src/main/resources = Resources
- src/test/java = Test Sources
- src/test/resources = Test Resources

##### (2) Project Structure > Modules > Dependencies 탭
- Module SDK: 프로젝트 SDK 1.8

##### (3) Project Structure > Facet > Web Facet 추가
- 웹 모듈 배포 설명자: {WORKSPACE}\PELS\src\main\webapp\WEB-INF\web.xml
- 웹 리소스 디렉토리 설정: {WORKSPACE}\PELS\src\main\webapp

##### (4) Project Structure > Artifact > 추가
- 웹 애플리케이션: Exploded 추가
- 웹 애플리케이션: Archive 추가

---

### 6. IntelliJ Maven 빌드 캐시 초기화

#### File > Invalidate Caches / 재시작
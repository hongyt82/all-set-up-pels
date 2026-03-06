package com.khnp.pels.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring 설정 클래스
 */
@Configuration
public class JacksonConfig {

    /**
     * 반환 객체(ObjectMapper)를 Spring IoC 컨테이너에 등록
     * @return
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

}

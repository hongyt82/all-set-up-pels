package com.khnp.pels.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.DispatcherServlet;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring Web 설정 클래스
 * @author KwangYong
 * @since 2006-04-12
 */
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    /**
     * CORS(Cross-Origin Resource Sharing) 허용
     * - 모든 Origin, 모든 HTTP Method, 모든 Header 허용
     * @param registry CorsRegistry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("*")
                .allowedHeaders("*");
    }
}

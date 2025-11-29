package com.ventadeautos.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@Order(1)
public class EndpointLogger implements CommandLineRunner {

    private final ApplicationContext applicationContext;

    public EndpointLogger(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(String... args) {
        log.info("=========================================");
        log.info("ENDPOINTS REGISTRADOS:");
        log.info("=========================================");
        
        RequestMappingHandlerMapping mapping = applicationContext.getBean(RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = mapping.getHandlerMethods();
        
        handlerMethods.forEach((info, method) -> {
            String patterns = info.getPatternValues().stream()
                .collect(Collectors.joining(", "));
            String methods = info.getMethodsCondition().getMethods().stream()
                .map(Enum::name)
                .collect(Collectors.joining(", "));
            
            log.info("{} {} -> {}.{}()", 
                methods.isEmpty() ? "ALL" : methods,
                patterns,
                method.getBeanType().getSimpleName(),
                method.getMethod().getName());
        });
        
        log.info("=========================================");
        log.info("Total de endpoints: {}", handlerMethods.size());
        log.info("=========================================");
    }
}


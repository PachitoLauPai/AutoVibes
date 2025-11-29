package com.ventadeautos.backend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@Slf4j
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        log.info("=========================================");
        log.info("Iniciando aplicación Backend AutoVibes");
        log.info("=========================================");
        try {
            SpringApplication app = new SpringApplication(BackendApplication.class);
            Environment env = app.run(args).getEnvironment();
            log.info("=========================================");
            log.info("Aplicación iniciada correctamente");
            log.info("Puerto: {}", env.getProperty("server.port", "8080"));
            log.info("Base de datos: {}", env.getProperty("spring.datasource.url", "No configurado"));
            log.info("=========================================");
        } catch (Exception e) {
            log.error("=========================================");
            log.error("ERROR AL INICIAR LA APLICACIÓN");
            log.error("=========================================");
            log.error("Tipo de error: {}", e.getClass().getSimpleName());
            log.error("Mensaje: {}", e.getMessage());
            log.error("Stack trace completo:", e);
            if (e.getCause() != null) {
                log.error("Causa raíz: {} - {}", e.getCause().getClass().getSimpleName(), e.getCause().getMessage());
            }
            log.error("=========================================");
            System.exit(1);
        }
    }
}
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
            
            log.info("Creando contexto de Spring...");
            Environment env = app.run(args).getEnvironment();

            log.info("=========================================");
            log.info("Puerto: {}", env.getProperty("server.port", "8080"));
            log.info("Base de datos: {}", env.getProperty("spring.datasource.url", "No configurado"));
            log.info("Usuario BD: {}", env.getProperty("spring.datasource.username", "No configurado"));
            log.info("URL de la aplicación: http://localhost:{}", env.getProperty("server.port", "8080"));
            log.info("=========================================");

        } catch (Exception e) {
            // Esta excepción es parte del mecanismo de reinicio automático de Spring Boot DevTools
            // No es un error real, simplemente reinicia la aplicación en modo desarrollo
            if (e.getClass().getName().contains("SilentExitException")) {
                // Relanzar la excepción para que DevTools pueda manejar el reinicio correctamente
                throw e;
            }
            
            log.error("=========================================");
            log.error("ERROR AL INICIAR LA APLICACIÓN");
            log.error("=========================================");
            log.error("Tipo de error: {}", e.getClass().getSimpleName());
            log.error("Mensaje: {}", e.getMessage());
            log.error("Stack trace completo:", e);

            if (e.getCause() != null) {
                log.error("");
                log.error("Causa raíz: {} - {}", e.getCause().getClass().getSimpleName(), e.getCause().getMessage());
                if (e.getCause().getCause() != null) {
                    log.error("Causa secundaria: {} - {}", 
                        e.getCause().getCause().getClass().getSimpleName(), 
                        e.getCause().getCause().getMessage());
                }
            }

            log.error("=========================================");
        }
    }
}

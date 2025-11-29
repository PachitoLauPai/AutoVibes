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
        
        // Verificar argumentos de línea de comandos
        if (args.length > 0) {
            log.info("Argumentos recibidos: {}", String.join(", ", args));
        }
        
        try {
            SpringApplication app = new SpringApplication(BackendApplication.class);
            
            log.info("Creando contexto de Spring...");
            Environment env = app.run(args).getEnvironment();
            
            log.info("=========================================");
            log.info("✓ Aplicación iniciada correctamente");
            log.info("=========================================");
            log.info("Puerto: {}", env.getProperty("server.port", "8080"));
            log.info("Base de datos: {}", env.getProperty("spring.datasource.url", "No configurado"));
            log.info("Usuario BD: {}", env.getProperty("spring.datasource.username", "No configurado"));
            log.info("URL de la aplicación: http://localhost:{}", env.getProperty("server.port", "8080"));
            log.info("=========================================");
            
        } catch (org.springframework.boot.web.server.PortInUseException e) {
            log.error("=========================================");
            log.error("ERROR: Puerto ya en uso");
            log.error("=========================================");
            log.error("El puerto {} está siendo utilizado por otra aplicación.", e.getLocalizedMessage());
            log.error("Solución: Cierra la aplicación que está usando el puerto o cambia el puerto en application.properties");
            log.error("=========================================");
            System.exit(1);
        } catch (org.springframework.jdbc.CannotGetJdbcConnectionException e) {
            log.error("=========================================");
            log.error("ERROR: No se puede conectar a la base de datos");
            log.error("=========================================");
            log.error("Mensaje: {}", e.getMessage());
            log.error("Causa: {}", e.getCause() != null ? e.getCause().getMessage() : "Desconocida");
            log.error("");
            log.error("Soluciones posibles:");
            log.error("1. Verifica que MySQL esté corriendo");
            log.error("2. Verifica las credenciales en application.properties");
            log.error("3. Verifica que la base de datos 'ventadeautos' exista o pueda ser creada");
            log.error("4. Verifica que el puerto 3306 esté disponible");
            log.error("=========================================");
            System.exit(1);
        } catch (Exception e) {
            // Verificar si es SilentExitException de DevTools (reinicio automático)
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
            log.error("");
            log.error("Stack trace completo:");
            e.printStackTrace();
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
            System.exit(1);
        }
    }
}
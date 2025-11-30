package com.ventadeautos.backend.exception;

import com.ventadeautos.backend.dto.ErrorResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.hibernate.LazyInitializationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Recurso no encontrado: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "NOT_FOUND",
            HttpStatus.NOT_FOUND.value()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(BadRequestException ex) {
        log.error("Solicitud inválida: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "BAD_REQUEST",
            HttpStatus.BAD_REQUEST.value()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(ConflictException ex) {
        log.error("Conflicto: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "CONFLICT",
            HttpStatus.CONFLICT.value()
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        log.error("Error de validación: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error de validación");
        response.put("errores", errors);
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Error en tiempo de ejecución: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(
            ex.getMessage(),
            "INTERNAL_SERVER_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<Map<String, Object>> handleLazyInitializationException(LazyInitializationException ex) {
        log.error("LazyInitializationException: Error al acceder a relación lazy fuera de transacción", ex);
        log.error("Stack trace completo:", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error al cargar datos relacionados. Verifique la configuración de transacciones.");
        response.put("error", "LAZY_INITIALIZATION_ERROR");
        response.put("detalle", ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotWritableException(HttpMessageNotWritableException ex) {
        log.error("HttpMessageNotWritableException: Error al serializar respuesta JSON", ex);
        Throwable rootCause = ex.getRootCause();
        if (rootCause != null) {
            log.error("Causa raíz: {}", rootCause.getMessage());
        } else {
            log.error("Causa raíz: Desconocida");
        }
        log.error("Stack trace completo:", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error al serializar la respuesta JSON");
        response.put("error", "JSON_SERIALIZATION_ERROR");
        response.put("detalle", ex.getMessage());
        if (rootCause != null) {
            response.put("causaRaiz", rootCause.getMessage());
        }
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(JsonProcessingException.class)
    public ResponseEntity<Map<String, Object>> handleJsonProcessingException(JsonProcessingException ex) {
        log.error("JsonProcessingException: Error al procesar JSON", ex);
        log.error("Stack trace completo:", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error al procesar JSON");
        response.put("error", "JSON_PROCESSING_ERROR");
        response.put("detalle", ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn("NoResourceFoundException: Recurso no encontrado - {}", ex.getMessage());
        log.warn("URL solicitada: {}", ex.getResourcePath());
        log.warn("HTTP Method: {}", ex.getHttpMethod());
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Endpoint no encontrado");
        response.put("error", "NOT_FOUND");
        response.put("detalle", "El recurso solicitado no existe. Verifique la URL.");
        response.put("recurso", ex.getResourcePath());
        response.put("metodo", ex.getHttpMethod() != null ? ex.getHttpMethod().name() : "Desconocido");
        response.put("sugerencia", "Asegúrese de usar la URL correcta: /api/concesionarios (con 'c', no 's')");
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Exception: Error inesperado - Tipo: {}, Mensaje: {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);
        log.error("Stack trace completo:", ex);
        if (ex.getCause() != null) {
            log.error("Causa: {} - {}", ex.getCause().getClass().getSimpleName(), ex.getCause().getMessage());
        }
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Error interno del servidor");
        response.put("error", "INTERNAL_SERVER_ERROR");
        response.put("tipo", ex.getClass().getSimpleName());
        response.put("detalle", ex.getMessage());
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", java.time.LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


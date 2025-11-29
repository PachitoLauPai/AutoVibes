package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.model.Concesionario;
import com.ventadeautos.backend.service.ConcesionarioService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/concesionarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ConcesionarioController {
    
    private final ConcesionarioService concesionarioService;
    
    @PostConstruct
    public void init() {
        log.info("=========================================");
        log.info("ConcesionarioController inicializado");
        log.info("Endpoint base: /api/concesionarios");
        log.info("=========================================");
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        log.info("Controller: GET /api/concesionarios/test - Endpoint de prueba");
        return ResponseEntity.ok(Map.of(
            "mensaje", "ConcesionarioController está funcionando",
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
    
    @GetMapping
    public ResponseEntity<?> obtenerTodosLosConcesionarios() {
        log.info("Controller: GET /api/concesionarios - Iniciando solicitud");
        try {
            log.debug("Controller: Llamando al servicio para obtener concesionarios activos");
            List<Concesionario> concesionarios = concesionarioService.obtenerConcesionariosActivos();
            log.info("Controller: Concesionarios encontrados: {}", concesionarios.size());
            log.debug("Controller: Retornando respuesta exitosa con {} concesionarios", concesionarios.size());
            return ResponseEntity.ok(concesionarios);
        } catch (Exception e) {
            log.error("Controller: Error al obtener concesionarios - Tipo: {}, Mensaje: {}", 
                e.getClass().getSimpleName(), e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "mensaje", "Error al obtener concesionarios", 
                "error", e.getClass().getSimpleName(),
                "detalle", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/todos")
    public ResponseEntity<?> obtenerTodosLosConcesionariosIncluyendoInactivos() {
        log.info("Obteniendo todos los concesionarios (incluyendo inactivos)");
        try {
            List<Concesionario> concesionarios = concesionarioService.obtenerTodosLosConcesionarios();
            return ResponseEntity.ok(concesionarios);
        } catch (Exception e) {
            log.error("Error al obtener todos los concesionarios: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error al obtener concesionarios: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Concesionario> obtenerConcesionarioPorId(@PathVariable Long id) {
        log.info("Obteniendo concesionario con ID: {}", id);
        return concesionarioService.obtenerConcesionarioPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crearConcesionario(@RequestBody Map<String, Object> request) {
        log.info("Creando nuevo concesionario: {}", request.get("nombre"));
        try {
            String nombre = (String) request.get("nombre");
            String direccion = (String) request.get("direccion");
            String telefono = (String) request.get("telefono");
            String email = (String) request.get("email");
            
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "El nombre del concesionario es requerido"));
            }
            
            Concesionario concesionario = concesionarioService.crearConcesionario(nombre, direccion, telefono, email);
            return ResponseEntity.ok(concesionario);
            
        } catch (RuntimeException e) {
            log.error("Error al crear concesionario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarConcesionario(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        log.info("Actualizando concesionario con ID: {}", id);
        try {
            String nombre = (String) request.get("nombre");
            String direccion = (String) request.get("direccion");
            String telefono = (String) request.get("telefono");
            String email = (String) request.get("email");
            Boolean activo = request.get("activo") != null ? (Boolean) request.get("activo") : null;
            
            Concesionario concesionario = concesionarioService.actualizarConcesionario(id, nombre, direccion, telefono, email, activo);
            return ResponseEntity.ok(concesionario);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar concesionario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarConcesionario(@PathVariable Long id) {
        log.info("Eliminando concesionario con ID: {}", id);
        try {
            concesionarioService.eliminarConcesionario(id);
            return ResponseEntity.ok().body(Map.of("mensaje", "Concesionario eliminado correctamente"));
        } catch (RuntimeException e) {
            log.error("Error al eliminar concesionario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarConcesionario(@PathVariable Long id) {
        log.info("Desactivando concesionario con ID: {}", id);
        try {
            Concesionario concesionario = concesionarioService.desactivarConcesionario(id);
            return ResponseEntity.ok(concesionario);
        } catch (RuntimeException e) {
            log.error("Error al desactivar concesionario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}


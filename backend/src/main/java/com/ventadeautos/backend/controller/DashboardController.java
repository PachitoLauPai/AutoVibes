package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.service.AutoService;
import com.ventadeautos.backend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final AutoService autoService;
    private final ContactService contactService;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Contar autos disponibles (en catálogo)
            long totalAutosDisponibles = autoService.obtenerAutosDisponibles().size();
            long totalAutos = autoService.obtenerTodos().size();
            
            // Contar contactos nuevos (no leídos)
            long contactosNoLeidos = contactService.contarNoLeidos();
            long totalContactos = contactService.obtenerTodosLosContactos().size();
            
            // Contar contactos de hoy
            long contactosHoy = 0;
            try {
                contactosHoy = contactService.obtenerContactosHoy();
            } catch (Exception e) {
                // Si hay error, usar 0
                contactosHoy = 0;
            }
            
            stats.put("totalAutosEnCatalogo", totalAutosDisponibles);
            stats.put("totalAutos", totalAutos);
            stats.put("contactosNuevos", contactosNoLeidos);
            stats.put("totalContactos", totalContactos);
            stats.put("contactosHoy", contactosHoy);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener estadísticas");
            error.put("mensaje", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}


// AutoController.java
package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.AutoRequest;
import com.ventadeautos.backend.model.Auto;
import com.ventadeautos.backend.service.AutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/autos")
@RequiredArgsConstructor
public class AutoController {
    
    private final AutoService autoService;
    
    @GetMapping
    public List<Auto> obtenerAutos(@RequestParam(required = false) Boolean disponibles) {
        if (disponibles != null && disponibles) {
            return autoService.obtenerAutosDisponibles();
        }
        return autoService.obtenerTodos();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Auto> obtenerAuto(@PathVariable Long id) {
        Optional<Auto> auto = autoService.obtenerPorId(id);
        return auto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Auto crearAuto(@RequestBody AutoRequest request) {
        return autoService.crearAuto(request);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Auto> actualizarAuto(@PathVariable Long id, @RequestBody AutoRequest request) {
        Optional<Auto> auto = autoService.actualizarAuto(id, request);
        return auto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarAuto(@PathVariable Long id) {
        if (autoService.eliminarAuto(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<Auto>> obtenerAutosDisponibles() {
        List<Auto> autosDisponibles = autoService.obtenerAutosDisponibles();
        return ResponseEntity.ok(autosDisponibles);
    }
}
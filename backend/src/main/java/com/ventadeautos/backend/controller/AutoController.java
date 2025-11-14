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
    
    // ✅ ENDPOINT ÚNICO INTELIGENTE
    @GetMapping
    public List<Auto> obtenerAutos(@RequestParam(required = false) Boolean disponibles,
                                   @RequestParam(required = false) Boolean admin) {
        // Si es admin, mostrar TODOS los autos
        if (admin != null && admin) {
            return autoService.obtenerTodos();
        }
        
        // Si se piden disponibles, mostrar solo autos visibles para clientes
        if (disponibles != null && disponibles) {
            return autoService.obtenerAutosDisponibles();
        }
        
        // Por defecto, mostrar todos (pero en el frontend diferenciaremos)
        return autoService.obtenerTodos();
    }
    
    // ✅ ENDPOINT ESPECÍFICO PARA CLIENTES
    @GetMapping("/disponibles")
    public ResponseEntity<List<Auto>> obtenerAutosDisponibles() {
        List<Auto> autosDisponibles = autoService.obtenerAutosDisponibles();
        return ResponseEntity.ok(autosDisponibles);
    }
    
    // ✅ ENDPOINT PARA ADMIN - AUTOS CON VENTAS PENDIENTES
    @GetMapping("/con-ventas-pendientes")
    public ResponseEntity<List<Auto>> obtenerAutosConVentasPendientes() {
        List<Auto> autos = autoService.obtenerAutosConVentasPendientes();
        return ResponseEntity.ok(autos);
    }
    
    // ✅ VERIFICAR SI UN AUTO ES VISIBLE
    @GetMapping("/{id}/visible")
    public ResponseEntity<Boolean> esAutoVisible(@PathVariable Long id) {
        boolean esVisible = autoService.esAutoVisibleParaClientes(id);
        return ResponseEntity.ok(esVisible);
    }
    
    // Los demás métodos se mantienen igual...
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
}
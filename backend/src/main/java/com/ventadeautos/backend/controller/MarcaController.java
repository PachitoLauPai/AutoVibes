package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.model.Marca;
import com.ventadeautos.backend.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MarcaController {
    
    private final MarcaService marcaService;
    
    @GetMapping
    public ResponseEntity<List<Marca>> obtenerTodasLasMarcas() {
        List<Marca> marcas = marcaService.obtenerMarcasActivas();
        return ResponseEntity.ok(marcas);
    }
    
    @GetMapping("/todas")
    public ResponseEntity<List<Marca>> obtenerTodasLasMarcasIncluyendoInactivas() {
        List<Marca> marcas = marcaService.obtenerTodasLasMarcas();
        return ResponseEntity.ok(marcas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Marca> obtenerMarcaPorId(@PathVariable Long id) {
        return marcaService.obtenerMarcaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crearMarca(@RequestBody Map<String, String> request) {
        try {
            String nombre = request.get("nombre");
            String descripcion = request.get("descripcion");
            
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre de la marca es requerido");
            }
            
            Marca marca = marcaService.crearMarca(nombre, descripcion);
            return ResponseEntity.ok(marca);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMarca(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String nombre = (String) request.get("nombre");
            String descripcion = (String) request.get("descripcion");
            Boolean activa = (Boolean) request.get("activa");
            
            Marca marca = marcaService.actualizarMarca(id, nombre, descripcion, activa);
            return ResponseEntity.ok(marca);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMarca(@PathVariable Long id) {
        try {
            marcaService.eliminarMarca(id);
            return ResponseEntity.ok().body(Map.of("mensaje", "Marca eliminada correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarMarca(@PathVariable Long id) {
        try {
            Marca marca = marcaService.desactivarMarca(id);
            return ResponseEntity.ok(marca);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
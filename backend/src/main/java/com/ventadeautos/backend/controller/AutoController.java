package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.AutoRequest;
import com.ventadeautos.backend.model.*;
import com.ventadeautos.backend.service.AutoService;
import com.ventadeautos.backend.service.CategoriaAutoService;
import com.ventadeautos.backend.service.CombustibleService;
import com.ventadeautos.backend.service.CondicionAutoService;
import com.ventadeautos.backend.service.MarcaService;
import com.ventadeautos.backend.service.TransmisionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/autos")
@RequiredArgsConstructor
public class AutoController {
    
    private final AutoService autoService;
    private final MarcaService marcaService;
    private final CategoriaAutoService categoriaAutoService;
    private final CondicionAutoService condicionAutoService;
    private final CombustibleService combustibleService;
    private final TransmisionService transmisionService;
    
    // =============================================
    // ENDPOINTS PRINCIPALES Y CRUD

    
    @GetMapping
    public List<Auto> obtenerAutos(@RequestParam(required = false) Boolean disponibles,
                                   @RequestParam(required = false) Boolean admin) {
        
        if (admin != null && admin) {
            return autoService.obtenerTodos();
        }
        
        // Si se piden disponibles, mostrar solo autos visibles para clientes
        if (disponibles != null && disponibles) {
            return autoService.obtenerAutosDisponibles();
        }
        
        // Por defecto, mostrar todos los autos
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
    
    // =============================================
    // ENDPOINTS DE DISPONIBILIDAD
    // =============================================
    
    @GetMapping("/disponibles")
    public ResponseEntity<List<Auto>> obtenerAutosDisponibles() {
        List<Auto> autosDisponibles = autoService.obtenerAutosDisponibles();
        return ResponseEntity.ok(autosDisponibles);
    }
    
    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<Boolean> verificarDisponibilidad(@PathVariable Long id) {
        Optional<Auto> auto = autoService.obtenerPorIdBasico(id);
        if (auto.isPresent()) {
            return ResponseEntity.ok(auto.get().getDisponible());
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/{id}/visible")
    public ResponseEntity<Boolean> esAutoVisible(@PathVariable Long id) {
        boolean esVisible = autoService.esAutoVisibleParaClientes(id);
        return ResponseEntity.ok(esVisible);
    }
    
    // =============================================
    // ENDPOINTS DE FILTRADO INDIVIDUAL
    // =============================================
    
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorCategoria(@PathVariable Long categoriaId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorCategoria(categoriaId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/condicion/{condicionId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorCondicion(@PathVariable Long condicionId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorCondicion(condicionId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/marca/{marcaId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorMarca(@PathVariable Long marcaId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorMarca(marcaId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/combustible/{combustibleId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorCombustible(@PathVariable Long combustibleId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorCombustible(combustibleId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/transmision/{transmisionId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorTransmision(@PathVariable Long transmisionId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorTransmision(transmisionId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // =============================================
    // ENDPOINTS DE FILTRADO COMBINADO
    // =============================================
    
    @GetMapping("/categoria/{categoriaId}/condicion/{condicionId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorCategoriaYCondicion(
            @PathVariable Long categoriaId, 
            @PathVariable Long condicionId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorCategoriaYCondicion(categoriaId, condicionId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/marca/{marcaId}/categoria/{categoriaId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorMarcaYCategoria(
            @PathVariable Long marcaId, 
            @PathVariable Long categoriaId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorMarcaYCategoria(marcaId, categoriaId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/marca/{marcaId}/condicion/{condicionId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorMarcaYCondicion(
            @PathVariable Long marcaId, 
            @PathVariable Long condicionId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorMarcaYCondicion(marcaId, condicionId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/categoria/{categoriaId}/combustible/{combustibleId}")
    public ResponseEntity<List<Auto>> obtenerAutosPorCategoriaYCombustible(
            @PathVariable Long categoriaId, 
            @PathVariable Long combustibleId) {
        try {
            List<Auto> autos = autoService.obtenerAutosPorCategoriaYCombustible(categoriaId, combustibleId);
            return ResponseEntity.ok(autos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // =============================================
    // ENDPOINTS DE METADATOS Y OPCIONES
    // =============================================
    
    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaAuto>> obtenerTodasLasCategorias() {
        try {
            List<CategoriaAuto> categorias = categoriaAutoService.obtenerActivas();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/condiciones")
    public ResponseEntity<List<CondicionAuto>> obtenerTodasLasCondiciones() {
        try {
            List<CondicionAuto> condiciones = condicionAutoService.obtenerActivas();
            return ResponseEntity.ok(condiciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/combustibles")
    public ResponseEntity<List<Combustible>> obtenerTodosLosCombustibles() {
        try {
            List<Combustible> combustibles = combustibleService.obtenerActivos();
            return ResponseEntity.ok(combustibles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/transmisiones")
    public ResponseEntity<List<Transmision>> obtenerTodasLasTransmisiones() {
        try {
            List<Transmision> transmisiones = transmisionService.obtenerActivas();
            return ResponseEntity.ok(transmisiones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/marcas")
    public ResponseEntity<List<Marca>> obtenerTodasLasMarcas() {
        try {
            List<Marca> marcas = marcaService.obtenerMarcasActivas();
            return ResponseEntity.ok(marcas);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/opciones")
    public ResponseEntity<Map<String, Object>> obtenerTodasLasOpciones() {
        try {
            Map<String, Object> opciones = new HashMap<>();
            opciones.put("marcas", marcaService.obtenerMarcasActivas());
            opciones.put("categorias", categoriaAutoService.obtenerActivas());
            opciones.put("condiciones", condicionAutoService.obtenerActivas());
            opciones.put("combustibles", combustibleService.obtenerActivos());
            opciones.put("transmisiones", transmisionService.obtenerActivas());
            
            return ResponseEntity.ok(opciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // =============================================
    // ENDPOINTS ESPECÍFICOS PARA ADMIN
    // =============================================
    
    @GetMapping("/admin/no-disponibles")
    public ResponseEntity<List<Auto>> obtenerAutosNoDisponibles() {
        List<Auto> autos = autoService.obtenerAutosNoDisponibles();
        return ResponseEntity.ok(autos);
    }
    
    @PutMapping("/admin/{id}/disponibilidad")
    public ResponseEntity<?> cambiarDisponibilidadAuto(
            @PathVariable Long id,
            @RequestParam Boolean disponible) {
        
        try {
            Auto autoActualizado = autoService.cambiarDisponibilidadAuto(id, disponible);
            return ResponseEntity.ok(autoActualizado);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

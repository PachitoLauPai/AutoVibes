package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.AutoRequest;
import com.ventadeautos.backend.exception.ResourceNotFoundException;
import com.ventadeautos.backend.model.*;
import com.ventadeautos.backend.repository.AutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoService {
    
    private final AutoRepository autoRepository;
    private final MarcaService marcaService;
    private final CategoriaAutoService categoriaAutoService;
    private final CondicionAutoService condicionAutoService;
    private final CombustibleService combustibleService;
    private final TransmisionService transmisionService;
    
    // ✅ Mantener métodos simples para listas
    public List<Auto> obtenerTodos() {
        return autoRepository.findAllWithRelations();
    }
    
    public List<Auto> obtenerAutosDisponibles() {
        return autoRepository.findAutosDisponiblesSinVentasPendientes();
    }
    
    // ✅ Para obtener un auto específico, cargar con marca
    public Optional<Auto> obtenerPorId(Long id) {
        return autoRepository.findByIdWithMarca((Long)id);
    }
    
    // ✅ Método alternativo si solo necesitas el auto básico
    public Optional<Auto> obtenerPorIdBasico(Long id) {
        return autoRepository.findById((Long)id);
    }
    
    public List<Auto> obtenerAutosConVentasPendientes() {
        return autoRepository.findAutosConVentasPendientes();
    }
    
    // ✅ ACTUALIZADO: Ahora reciben IDs en lugar de enums
    public List<Auto> obtenerAutosPorCategoria(Long categoriaId) {
        return autoRepository.findByCategoriaIdAndDisponibleTrue(categoriaId);
    }

    // ✅ ACTUALIZADO: Ahora recibe ID en lugar de enum
    public List<Auto> obtenerAutosPorCondicion(Long condicionId) {
        return autoRepository.findByCondicionIdAndDisponibleTrue(condicionId);
    }

    // ✅ ACTUALIZADO: Ahora reciben IDs en lugar de enums
    public List<Auto> obtenerAutosPorCategoriaYCondicion(Long categoriaId, Long condicionId) {
        return autoRepository.findByCategoriaIdAndCondicionIdAndDisponibleTrue(categoriaId, condicionId);
    }

    public List<Auto> obtenerAutosPorMarca(Long marcaId) {
        return autoRepository.findByMarcaIdAndDisponibleTrue(marcaId);
    }

    // ✅ ACTUALIZADO: Ahora recibe IDs en lugar de enum
    public List<Auto> obtenerAutosPorMarcaYCategoria(Long marcaId, Long categoriaId) {
        return autoRepository.findByMarcaIdAndCategoriaIdAndDisponibleTrue(marcaId, categoriaId);
    }

    // ✅ NUEVO: Obtener autos por combustible
    public List<Auto> obtenerAutosPorCombustible(Long combustibleId) {
        return autoRepository.findByCombustibleIdAndDisponibleTrue(combustibleId);
    }

    // ✅ NUEVO: Obtener autos por transmisión
    public List<Auto> obtenerAutosPorTransmision(Long transmisionId) {
        return autoRepository.findByTransmisionIdAndDisponibleTrue(transmisionId);
    }

    // ✅ NUEVO: Obtener autos por marca y condición
    public List<Auto> obtenerAutosPorMarcaYCondicion(Long marcaId, Long condicionId) {
        return autoRepository.findByMarcaIdAndCondicionIdAndDisponibleTrue(marcaId, condicionId);
    }

    // ✅ NUEVO: Obtener autos por categoría y combustible
    public List<Auto> obtenerAutosPorCategoriaYCombustible(Long categoriaId, Long combustibleId) {
        return autoRepository.findByCategoriaIdAndCombustibleIdAndDisponibleTrue(categoriaId, combustibleId);
    }

    // ✅ NUEVO: Búsqueda con múltiples filtros
    public List<Auto> buscarAutosConFiltros(Long marcaId, Long categoriaId, Long condicionId, 
                                        Long combustibleId, Long transmisionId) {
        return autoRepository.findByFiltros(marcaId, categoriaId, condicionId, combustibleId, transmisionId);
    }
    
    public boolean esAutoVisibleParaClientes(Long autoId) {
        Optional<Auto> auto = autoRepository.findById(autoId);
        if (auto.isEmpty() || !auto.get().getDisponible()) {
            return false;
        }
        
        List<Auto> autosConVentasPendientes = autoRepository.findAutosConVentasPendientes();
        return autosConVentasPendientes.stream()
                .noneMatch(a -> a.getId().equals(autoId));
    }
    
    public Auto crearAuto(AutoRequest request) {
        Marca marca = marcaService.obtenerMarcaPorId(request.getMarcaId())
            .orElseThrow(() -> new ResourceNotFoundException("Marca", request.getMarcaId()));
        
        // ✅ CORREGIDO: Usar IDs consistentemente
        CategoriaAuto categoria = categoriaAutoService.obtenerPorId(request.getCategoriaId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoría", request.getCategoriaId()));
    
        CondicionAuto condicion = condicionAutoService.obtenerPorId(request.getCondicionId())
            .orElseThrow(() -> new ResourceNotFoundException("Condición", request.getCondicionId()));

        Auto auto = new Auto();
        auto.setMarca(marca);
        auto.setCategoria(categoria);
        auto.setCondicion(condicion);
        auto.setModelo(request.getModelo());
        auto.setAnio(request.getAnio());
        auto.setPrecio(request.getPrecio());
        auto.setColor(request.getColor());
        auto.setKilometraje(request.getKilometraje() != null ? request.getKilometraje() : 0);
        auto.setDescripcion(request.getDescripcion());
        auto.setDisponible(true);
        
        // Relaciones opcionales
        if (request.getCombustibleId() != null) {
            Combustible combustible = combustibleService.obtenerPorId(request.getCombustibleId())
                .orElseThrow(() -> new ResourceNotFoundException("Combustible", request.getCombustibleId()));
            auto.setCombustible(combustible);
        }
        
        if (request.getTransmisionId() != null) {
            Transmision transmision = transmisionService.obtenerPorId(request.getTransmisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transmisión", request.getTransmisionId()));
            auto.setTransmision(transmision);
        }
        
        if (request.getImagenes() != null) {
            auto.setImagenes(request.getImagenes());
        }
        
        // ✅ Stock - se actualiza solo si se proporciona
        if (request.getStock() != null) {
            auto.setStock(request.getStock());
        } else {
            auto.setStock(0); // Default a 0 si no se proporciona
        }
        
        return autoRepository.save(auto);
    }
    
    public Optional<Auto> actualizarAuto(Long id, AutoRequest request) {
    return autoRepository.findById(id).map(auto -> {
        if (request.getMarcaId() != null) {
            Marca marca = marcaService.obtenerMarcaPorId(request.getMarcaId())
                .orElseThrow(() -> new ResourceNotFoundException("Marca", request.getMarcaId()));
            auto.setMarca(marca);
        }
        
        if (request.getCategoriaId() != null) {
            CategoriaAuto categoria = categoriaAutoService.obtenerPorId(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", request.getCategoriaId()));
            auto.setCategoria(categoria);
        }
        
        if (request.getCondicionId() != null) {
            CondicionAuto condicion = condicionAutoService.obtenerPorId(request.getCondicionId())
                .orElseThrow(() -> new ResourceNotFoundException("Condición", request.getCondicionId()));
            auto.setCondicion(condicion);
        }
        
        if (request.getCombustibleId() != null) {
            Combustible combustible = combustibleService.obtenerPorId(request.getCombustibleId())
                .orElseThrow(() -> new ResourceNotFoundException("Combustible", request.getCombustibleId()));
            auto.setCombustible(combustible);
        }
        
        if (request.getTransmisionId() != null) {
            Transmision transmision = transmisionService.obtenerPorId(request.getTransmisionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transmisión", request.getTransmisionId()));
            auto.setTransmision(transmision);
        }
        
        // ✅ VALIDACIONES AGREGADAS - Solo actualizar si no es null
        if (request.getModelo() != null && !request.getModelo().isEmpty()) {
            auto.setModelo(request.getModelo());
        }
        
        if (request.getAnio() != null) {  // ✅ ESTA ES LA CLAVE
            auto.setAnio(request.getAnio());
        }
        
        if (request.getPrecio() != null) {
            auto.setPrecio(request.getPrecio());
        }
        
        if (request.getColor() != null && !request.getColor().isEmpty()) {
            auto.setColor(request.getColor());
        }
        
        if (request.getKilometraje() != null) {
            auto.setKilometraje(request.getKilometraje());
        }
        
        if (request.getDescripcion() != null && !request.getDescripcion().isEmpty()) {
            auto.setDescripcion(request.getDescripcion());
        }
        
        if (request.getDisponible() != null) {
            auto.setDisponible(request.getDisponible());
        }
        
        if (request.getImagenes() != null) {
            auto.setImagenes(request.getImagenes());
        }
        
        // ✅ Stock - se actualiza solo si se proporciona
        if (request.getStock() != null) {
            auto.setStock(request.getStock());
        }
        
        return autoRepository.save(auto);
    });
}
    
    public boolean eliminarAuto(Long id) {
        if (autoRepository.existsById(id)) {
            autoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ✅ NUEVO: Método para cambiar disponibilidad manualmente
    public Auto cambiarDisponibilidadAuto(Long autoId, Boolean disponible) {
        Auto auto = autoRepository.findById(autoId)
                .orElseThrow(() -> new ResourceNotFoundException("Auto", autoId));
        
        auto.setDisponible(disponible);
        Auto autoActualizado = autoRepository.save(auto);
        
        log.info("Cambio manual de disponibilidad - Auto ID: {}, Nueva disponibilidad: {}", 
                autoId, disponible);
        
        return autoActualizado;
    }



    public List<Auto> obtenerAutosNoDisponibles() {
    return autoRepository.findByDisponibleFalse();
}
}
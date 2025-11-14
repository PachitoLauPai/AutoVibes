package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.AutoRequest;
import com.ventadeautos.backend.model.Auto;
import com.ventadeautos.backend.model.Combustible;
import com.ventadeautos.backend.model.Transmision;
import com.ventadeautos.backend.repository.AutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AutoService {
    
    private final AutoRepository autoRepository;
    
    // ✅ Para ADMIN - TODOS los autos
    public List<Auto> obtenerTodos() {
        return autoRepository.findAll();
    }
    
    // ✅ Para CLIENTES - Solo autos disponibles SIN ventas pendientes
    public List<Auto> obtenerAutosDisponibles() {
        return autoRepository.findAutosDisponiblesSinVentasPendientes();
    }
    
    // ✅ Para ADMIN - Autos con ventas pendientes
    public List<Auto> obtenerAutosConVentasPendientes() {
        return autoRepository.findAutosConVentasPendientes();
    }
    
    public Optional<Auto> obtenerPorId(Long id) {
        return autoRepository.findById(id);
    }
    
    // ✅ Verificar si un auto es visible para clientes
    public boolean esAutoVisibleParaClientes(Long autoId) {
        Optional<Auto> auto = autoRepository.findById(autoId);
        if (auto.isEmpty() || !auto.get().getDisponible()) { // ✅ CORREGIDO: usar getDisponible()
            return false;
        }
        
        // Verificar si tiene ventas pendientes
        List<Auto> autosConVentasPendientes = autoRepository.findAutosConVentasPendientes();
        return autosConVentasPendientes.stream()
                .noneMatch(a -> a.getId().equals(autoId));
    }
    
    public Auto crearAuto(AutoRequest request) {
        Auto auto = new Auto();
        auto.setMarca(request.getMarca());
        auto.setModelo(request.getModelo());
        auto.setAnio(request.getAnio());
        auto.setPrecio(request.getPrecio());
        auto.setColor(request.getColor());
        auto.setKilometraje(request.getKilometraje());
        auto.setDescripcion(request.getDescripcion());
        auto.setDisponible(true); // ✅ Por defecto disponible
        
        if (request.getImagenes() != null) {
            auto.setImagenes(request.getImagenes());
        }
        
        if (request.getCombustible() != null) {
            auto.setCombustible(Combustible.valueOf(request.getCombustible().toUpperCase()));
        }
        if (request.getTransmision() != null) {
            auto.setTransmision(Transmision.valueOf(request.getTransmision().toUpperCase()));
        }
        
        return autoRepository.save(auto);
    }
    
    public Optional<Auto> actualizarAuto(Long id, AutoRequest request) {
        return autoRepository.findById(id).map(auto -> {
            auto.setMarca(request.getMarca());
            auto.setModelo(request.getModelo());
            auto.setAnio(request.getAnio());
            auto.setPrecio(request.getPrecio());
            auto.setColor(request.getColor());
            auto.setKilometraje(request.getKilometraje());
            auto.setDescripcion(request.getDescripcion());
            
            if (request.getImagenes() != null) {
                auto.setImagenes(request.getImagenes());
            }
            
            if (request.getCombustible() != null) {
                auto.setCombustible(Combustible.valueOf(request.getCombustible().toUpperCase()));
            }
            if (request.getTransmision() != null) {
                auto.setTransmision(Transmision.valueOf(request.getTransmision().toUpperCase()));
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
}
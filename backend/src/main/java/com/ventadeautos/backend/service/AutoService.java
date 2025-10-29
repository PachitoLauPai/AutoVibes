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
    
    public List<Auto> obtenerTodos() {
        return autoRepository.findAll();
    }
    
    public List<Auto> obtenerAutosDisponibles() {
        // ✅ SOLUCIÓN SIMPLIFICADA - Solo autos marcados como disponibles
        return autoRepository.findByDisponibleTrue();
    }
    
    public Optional<Auto> obtenerPorId(Long id) {
        return autoRepository.findById(id);
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
        
        // ✅ NUEVO: Asignar imágenes si vienen en el request
        if (request.getImagenes() != null) {
            auto.setImagenes(request.getImagenes());
        }
        
        // Convertir strings a enums
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
            
            // ✅ NUEVO: Actualizar imágenes
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
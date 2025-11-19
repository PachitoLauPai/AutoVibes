package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Transmision;
import com.ventadeautos.backend.repository.TransmisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransmisionService {
    private final TransmisionRepository transmisionRepository;
    
    public List<Transmision> obtenerTodas() {
        return transmisionRepository.findAll();
    }
    
    public List<Transmision> obtenerActivas() {
        return transmisionRepository.findByActivaTrue();
    }
    
    public Optional<Transmision> obtenerPorId(Long id) {
        return transmisionRepository.findById(id);
    }
    
    public Optional<Transmision> obtenerPorNombre(String nombre) {
        return transmisionRepository.findByNombre(nombre);
    }
    
    public Transmision crear(String nombre, String descripcion) {
        if (transmisionRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La transmisión '" + nombre + "' ya existe");
        }
        
        Transmision transmision = new Transmision();
        transmision.setNombre(nombre);
        transmision.setDescripcion(descripcion);
        transmision.setActiva(true);
        
        return transmisionRepository.save(transmision);
    }
    
    public Transmision actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        Transmision transmision = transmisionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transmisión no encontrada"));
        
        if (!transmision.getNombre().equals(nombre) && transmisionRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La transmisión '" + nombre + "' ya existe");
        }
        
        transmision.setNombre(nombre);
        transmision.setDescripcion(descripcion);
        if (activa != null) transmision.setActiva(activa);
        
        return transmisionRepository.save(transmision);
    }
    
    public void eliminar(Long id) {
        Transmision transmision = transmisionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transmisión no encontrada"));
        
        if (!transmision.getAutos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la transmisión porque tiene autos asociados");
        }
        
        transmisionRepository.delete(transmision);
    }
}
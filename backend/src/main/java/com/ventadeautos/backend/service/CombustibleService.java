package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Combustible;
import com.ventadeautos.backend.repository.CombustibleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CombustibleService {
    private final CombustibleRepository combustibleRepository;
    
    public List<Combustible> obtenerTodos() {
        return combustibleRepository.findAll();
    }
    
    public List<Combustible> obtenerActivos() {
        return combustibleRepository.findByActivaTrue();
    }
    
    public Optional<Combustible> obtenerPorId(Long id) {
        return combustibleRepository.findById((Long)id);
    }
    
    public Optional<Combustible> obtenerPorNombre(String nombre) {
        return combustibleRepository.findByNombre(nombre);
    }
    
    public Combustible crear(String nombre, String descripcion) {
        if (combustibleRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El combustible '" + nombre + "' ya existe");
        }
        
        Combustible combustible = new Combustible();
        combustible.setNombre(nombre);
        combustible.setDescripcion(descripcion);
        combustible.setActiva(true);
        
        return combustibleRepository.save(combustible);
    }
    
    public Combustible actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        Combustible combustible = combustibleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Combustible no encontrado"));
        
        if (!combustible.getNombre().equals(nombre) && combustibleRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El combustible '" + nombre + "' ya existe");
        }
        
        combustible.setNombre(nombre);
        combustible.setDescripcion(descripcion);
        if (activa != null) combustible.setActiva(activa);
        
        return combustibleRepository.save(combustible);
    }
    
    public void eliminar(Long id) {
        Combustible combustible = combustibleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Combustible no encontrado"));
        
        if (!combustible.getAutos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar el combustible porque tiene autos asociados");
        }
        
        combustibleRepository.delete(combustible);
    }
}
package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.CondicionAuto;
import com.ventadeautos.backend.repository.CondicionAutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CondicionAutoService {
    private final CondicionAutoRepository condicionAutoRepository;
    
    public List<CondicionAuto> obtenerTodas() {
        return condicionAutoRepository.findAll();
    }
    
    public List<CondicionAuto> obtenerActivas() {
        return condicionAutoRepository.findByActivaTrue();
    }
    
    public Optional<CondicionAuto> obtenerPorId(Long id) {
        return condicionAutoRepository.findById(id);
    }
    
    public Optional<CondicionAuto> obtenerPorNombre(String nombre) {
        return condicionAutoRepository.findByNombre(nombre);
    }
    
    public CondicionAuto crear(String nombre, String descripcion) {
        if (condicionAutoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La condición '" + nombre + "' ya existe");
        }
        
        CondicionAuto condicion = new CondicionAuto();
        condicion.setNombre(nombre);
        condicion.setDescripcion(descripcion);
        condicion.setActiva(true);
        
        return condicionAutoRepository.save(condicion);
    }
    
    public CondicionAuto actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        CondicionAuto condicion = condicionAutoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Condición no encontrada"));
        
        if (!condicion.getNombre().equals(nombre) && condicionAutoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La condición '" + nombre + "' ya existe");
        }
        
        condicion.setNombre(nombre);
        condicion.setDescripcion(descripcion);
        if (activa != null) condicion.setActiva(activa);
        
        return condicionAutoRepository.save(condicion);
    }
    
    public void eliminar(Long id) {
        CondicionAuto condicion = condicionAutoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Condición no encontrada"));
        
        if (!condicion.getAutos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la condición porque tiene autos asociados");
        }
        
        condicionAutoRepository.delete(condicion);
    }
}
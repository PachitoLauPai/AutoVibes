package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.CategoriaAuto;
import com.ventadeautos.backend.repository.CategoriaAutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoriaAutoService {
    private final CategoriaAutoRepository categoriaAutoRepository;
    
    public List<CategoriaAuto> obtenerTodas() {
        return categoriaAutoRepository.findAll();
    }
    
    public List<CategoriaAuto> obtenerActivas() {
        return categoriaAutoRepository.findByActivaTrue();
    }
    
    public Optional<CategoriaAuto> obtenerPorId(Long id) {
        return categoriaAutoRepository.findById((Long)id);
    }
    
    public Optional<CategoriaAuto> obtenerPorNombre(String nombre) {
        return categoriaAutoRepository.findByNombre(nombre);
    }
    
    public CategoriaAuto crear(String nombre, String descripcion) {
        if (categoriaAutoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La categoría '" + nombre + "' ya existe");
        }
        
        CategoriaAuto categoria = new CategoriaAuto();
        categoria.setNombre(nombre);
        categoria.setDescripcion(descripcion);
        categoria.setActiva(true);
        
        return categoriaAutoRepository.save(categoria);
    }
    
    public CategoriaAuto actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        CategoriaAuto categoria = categoriaAutoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        if (!categoria.getNombre().equals(nombre) && categoriaAutoRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La categoría '" + nombre + "' ya existe");
        }
        
        categoria.setNombre(nombre);
        categoria.setDescripcion(descripcion);
        if (activa != null) categoria.setActiva(activa);
        
        return categoriaAutoRepository.save(categoria);
    }
    
    public void eliminar(Long id) {
        CategoriaAuto categoria = categoriaAutoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        if (!categoria.getAutos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la categoría porque tiene autos asociados");
        }
        
        categoriaAutoRepository.delete(categoria);
    }
}
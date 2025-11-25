package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Rol;
import com.ventadeautos.backend.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RolService {
    private final RolRepository rolRepository;
    
    public List<Rol> obtenerTodos() {
        return rolRepository.findAll();
    }
    
    public List<Rol> obtenerActivos() {
        return rolRepository.findByActivaTrue();
    }
    
    public Optional<Rol> obtenerPorId(Long id) {
        return rolRepository.findById(id);
    }
    
    public Optional<Rol> obtenerPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre);
    }
    
    public Rol crear(String nombre, String descripcion) {
        if (rolRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El rol '" + nombre + "' ya existe");
        }
        
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setDescripcion(descripcion);
        rol.setActiva(true);
        
        return rolRepository.save(rol);
    }
    
    public Rol actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        
        if (!rol.getNombre().equals(nombre) && rolRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El rol '" + nombre + "' ya existe");
        }
        
        rol.setNombre(nombre);
        rol.setDescripcion(descripcion);
        if (activa != null) rol.setActiva(activa);
        
        return rolRepository.save(rol);
    }
    
    public void eliminar(Long id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
        
        if (!rol.getUsuarios().isEmpty()) {
            throw new RuntimeException("No se puede eliminar el rol porque tiene usuarios asociados");
        }
        
        rolRepository.delete(rol);
    }
}
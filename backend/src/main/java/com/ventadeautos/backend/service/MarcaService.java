package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.Marca;
import com.ventadeautos.backend.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MarcaService {
    
    private final MarcaRepository marcaRepository;
    
    public List<Marca> obtenerTodasLasMarcas() {
        return marcaRepository.findAll();
    }
    
    public List<Marca> obtenerMarcasActivas() {
        return marcaRepository.findByActivaTrue();
    }
    
    public Optional<Marca> obtenerMarcaPorId(Long id) {
        return marcaRepository.findById(id);
    }
    
    public Optional<Marca> obtenerMarcaPorNombre(String nombre) {
        return marcaRepository.findByNombreIgnoreCase(nombre);
    }
    
    public Marca crearMarca(String nombre, String descripcion) {
        // Verificar si ya existe
        if (marcaRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La marca '" + nombre + "' ya existe");
        }
        
        Marca marca = new Marca();
        marca.setNombre(nombre);
        marca.setDescripcion(descripcion);
        marca.setActiva(true);
        
        return marcaRepository.save(marca);
    }
    
    public Marca actualizarMarca(Long id, String nombre, String descripcion, Boolean activa) {
        Marca marca = marcaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        
        // Verificar si el nuevo nombre ya existe (excluyendo la actual)
        if (!marca.getNombre().equals(nombre) && marcaRepository.existsByNombre(nombre)) {
            throw new RuntimeException("La marca '" + nombre + "' ya existe");
        }
        
        marca.setNombre(nombre);
        marca.setDescripcion(descripcion);
        if (activa != null) {
            marca.setActiva(activa);
        }
        
        return marcaRepository.save(marca);
    }
    
    public void eliminarMarca(Long id) {
        Marca marca = marcaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        
        // Verificar si tiene autos asociados
        if (marca.getAutos() != null && !marca.getAutos().isEmpty()) {
            throw new RuntimeException("No se puede eliminar la marca porque tiene autos asociados");
        }
        
        marcaRepository.delete(marca);
    }
    
    public Marca desactivarMarca(Long id) {
        Marca marca = marcaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Marca no encontrada"));
        
        marca.setActiva(false);
        return marcaRepository.save(marca);
    }
}
package com.ventadeautos.backend.service;

import com.ventadeautos.backend.model.EstadoVenta;
import com.ventadeautos.backend.repository.EstadoVentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EstadoVentaService {
    private final EstadoVentaRepository estadoVentaRepository;
    
    public List<EstadoVenta> obtenerTodos() {
        return estadoVentaRepository.findAll();
    }
    
    public List<EstadoVenta> obtenerActivos() {
        return estadoVentaRepository.findByActivaTrue();
    }
    
    public Optional<EstadoVenta> obtenerPorId(Long id) {
        return estadoVentaRepository.findById((Long)id);
    }
    
    public Optional<EstadoVenta> obtenerPorNombre(String nombre) {
        return estadoVentaRepository.findByNombre(nombre);
    }
    
    public EstadoVenta crear(String nombre, String descripcion) {
        if (estadoVentaRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El estado de venta '" + nombre + "' ya existe");
        }
        
        EstadoVenta estado = new EstadoVenta();
        estado.setNombre(nombre);
        estado.setDescripcion(descripcion);
        estado.setActiva(true);
        
        return estadoVentaRepository.save(estado);
    }
    
    public EstadoVenta actualizar(Long id, String nombre, String descripcion, Boolean activa) {
        EstadoVenta estado = estadoVentaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Estado de venta no encontrado"));
        
        if (!estado.getNombre().equals(nombre) && estadoVentaRepository.existsByNombre(nombre)) {
            throw new RuntimeException("El estado de venta '" + nombre + "' ya existe");
        }
        
        estado.setNombre(nombre);
        estado.setDescripcion(descripcion);
        if (activa != null) estado.setActiva(activa);
        
        return estadoVentaRepository.save(estado);
    }
    
    public void eliminar(Long id) {
        EstadoVenta estado = estadoVentaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Estado de venta no encontrado"));
        
        if (!estado.getVentas().isEmpty()) {
            throw new RuntimeException("No se puede eliminar el estado de venta porque tiene ventas asociadas");
        }
        
        estadoVentaRepository.delete(estado);
    }
}
package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
    
    // Buscar por nombre exacto
    Optional<Marca> findByNombre(String nombre);
    
    // Buscar por nombre (case insensitive)
    Optional<Marca> findByNombreIgnoreCase(String nombre);
    
    // Obtener marcas activas
    List<Marca> findByActivaTrue();
    
    // Buscar marcas que contengan un texto
    List<Marca> findByNombreContainingIgnoreCase(String nombre);
    
    // Verificar si existe una marca por nombre
    boolean existsByNombre(String nombre);
}
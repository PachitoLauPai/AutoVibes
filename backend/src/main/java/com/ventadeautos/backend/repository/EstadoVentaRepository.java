package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.EstadoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EstadoVentaRepository extends JpaRepository<EstadoVenta, Long> {
    Optional<EstadoVenta> findByNombre(String nombre);
    List<EstadoVenta> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Auto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AutoRepository extends JpaRepository<Auto, Long> {
    List<Auto> findByDisponibleTrue();
    List<Auto> findByMarcaContainingIgnoreCase(String marca);
    List<Auto> findByModeloContainingIgnoreCase(String modelo);
}
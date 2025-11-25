package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Combustible;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CombustibleRepository extends JpaRepository<Combustible, Long> {
    Optional<Combustible> findByNombre(String nombre);
    List<Combustible> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
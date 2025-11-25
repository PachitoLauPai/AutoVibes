package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.CategoriaAuto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoriaAutoRepository extends JpaRepository<CategoriaAuto, Long> {
    Optional<CategoriaAuto> findByNombre(String nombre);
    List<CategoriaAuto> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Transmision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransmisionRepository extends JpaRepository<Transmision, Long> {
    Optional<Transmision> findByNombre(String nombre);
    List<Transmision> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
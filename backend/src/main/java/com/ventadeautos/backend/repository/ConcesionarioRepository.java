package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Concesionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcesionarioRepository extends JpaRepository<Concesionario, Long> {
    List<Concesionario> findByActivoTrue();
    Optional<Concesionario> findByNombre(String nombre);
}


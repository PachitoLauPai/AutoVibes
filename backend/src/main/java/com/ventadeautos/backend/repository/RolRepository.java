package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(String nombre);
    List<Rol> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
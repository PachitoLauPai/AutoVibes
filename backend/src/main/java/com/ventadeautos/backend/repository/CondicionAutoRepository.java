package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.CondicionAuto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CondicionAutoRepository extends JpaRepository<CondicionAuto, Long> {
    Optional<CondicionAuto> findByNombre(String nombre);
    List<CondicionAuto> findByActivaTrue();
    boolean existsByNombre(String nombre);
}
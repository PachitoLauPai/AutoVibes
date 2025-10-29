package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByDni(String dni);
    Optional<Cliente> findByUsuarioId(Long usuarioId);
    boolean existsByDni(String dni);
    boolean existsByUsuarioId(Long usuarioId);
}
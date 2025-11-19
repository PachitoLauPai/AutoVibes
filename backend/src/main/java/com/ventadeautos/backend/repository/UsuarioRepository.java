package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);

    // ✅ MÉTODOS EXISTENTES (ya los tienes)
    List<Usuario> findAll();

    // ✅ NUEVOS MÉTODOS PARA GESTIÓN DE USUARIOS
    
    // Buscar usuarios por estado activo/inactivo
    List<Usuario> findByActivo(Boolean activo);
    
    // Buscar usuarios por nombre de rol
    List<Usuario> findByRolNombre(String rolNombre);
    
    // Contar usuarios por estado
    long countByActivo(Boolean activo);
    
    // Contar usuarios por rol
    long countByRolNombre(String rolNombre);
    
    // Actualizar estado de usuario (más eficiente que cargar y guardar)
    @Modifying
    @Query("UPDATE Usuario u SET u.activo = :activo WHERE u.id = :id")
    int updateActivo(@Param("id") Long id, @Param("activo") Boolean activo);
    
    // Buscar usuarios que contengan un texto en nombre o email
    @Query("SELECT u FROM Usuario u WHERE u.nombre LIKE %:texto% OR u.email LIKE %:texto%")
    List<Usuario> buscarPorNombreOEmail(@Param("texto") String texto);
    
    // Verificar si existe un usuario con el mismo email excluyendo un ID
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email AND u.id != :excludeId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("excludeId") Long excludeId);
}
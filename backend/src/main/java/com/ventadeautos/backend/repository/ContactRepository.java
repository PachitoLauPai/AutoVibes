package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    // Obtener contactos no leídos con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.leido = false ORDER BY c.fechaCreacion DESC")
    List<Contact> findByLeidoFalse();
    
    // Obtener contactos por auto
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.auto.id = :autoId ORDER BY c.fechaCreacion DESC")
    List<Contact> findByAutoId(Long autoId);
    
    // Obtener contactos no respondidos con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.respondido = false ORDER BY c.fechaCreacion DESC")
    List<Contact> findByRespondidoFalse();
    
    // Obtener todos los contactos ordenados por fecha descendente con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto ORDER BY c.fechaCreacion DESC")
    List<Contact> findAllOrderByFechaDesc();
    
    // Buscar por email con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.email = :email ORDER BY c.fechaCreacion DESC")
    List<Contact> findByEmail(String email);
    
    // Obtener contactos por estado con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.estado = :estado ORDER BY c.fechaCreacion DESC")
    List<Contact> findByEstado(String estado);
    
    // Obtener contacto por ID con auto cargado
    @Query("SELECT c FROM Contact c LEFT JOIN FETCH c.auto WHERE c.id = :id")
    Optional<Contact> findById(Long id);
    
    // Contar contactos no leídos
    long countByLeidoFalse();
    
    // Contar contactos entre fechas
    long countByFechaCreacionBetween(java.time.LocalDateTime inicio, java.time.LocalDateTime fin);
}

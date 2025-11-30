package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    // Obtener contactos no leídos
    List<Contact> findByLeidoFalse();
    
    // Obtener contactos por auto
    @Query("SELECT c FROM Contact c WHERE c.auto.id = :autoId ORDER BY c.fechaCreacion DESC")
    List<Contact> findByAutoId(Long autoId);
    
    // Obtener contactos no respondidos
    List<Contact> findByRespondidoFalse();
    
    // Obtener todos los contactos ordenados por fecha descendente
    @Query("SELECT c FROM Contact c ORDER BY c.fechaCreacion DESC")
    List<Contact> findAllOrderByFechaDesc();
    
    // Buscar por email
    List<Contact> findByEmail(String email);
    
    // Contar contactos no leídos
    long countByLeidoFalse();
}

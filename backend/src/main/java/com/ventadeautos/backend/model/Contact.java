package com.ventadeautos.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Data
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column
    private String dni;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String telefono;
    
    @Column(nullable = false)
    private String asunto;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;
    
    // Relación opcional con Auto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auto_id")
    private Auto auto;
    
    @Column(nullable = false)
    private Boolean leido = false;
    
    @Column(nullable = false)
    private Boolean respondido = false;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        if (leido == null) {
            leido = false;
        }
        if (respondido == null) {
            respondido = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (respondido && fechaRespuesta == null) {
            fechaRespuesta = LocalDateTime.now();
        }
    }
}

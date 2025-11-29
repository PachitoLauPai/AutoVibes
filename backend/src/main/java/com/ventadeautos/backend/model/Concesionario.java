package com.ventadeautos.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "concesionarios")
@Data
@ToString(exclude = {"autos"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Concesionario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    private String direccion;
    private String telefono;
    private String email;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    // Relación con Auto - LAZY para evitar cargar todos los autos
    @OneToMany(mappedBy = "concesionario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Auto> autos = new ArrayList<>();
    
    // Auditoría básica
    @Column(name = "fecha_creacion")
    @JsonIgnore  // Ignorar en la serialización JSON para evitar problemas
    private java.time.LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) {
            fechaCreacion = java.time.LocalDateTime.now();
        }
    }
}


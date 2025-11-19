package com.ventadeautos.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marcas")
@Data
@ToString(exclude = {"autos"})
public class Marca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String nombre;
    
    private String descripcion;
    
    @Column(name = "activa", nullable = false)
    private Boolean activa = true;
    
    // Relación con Auto (opcional, pero útil)
    @OneToMany(mappedBy = "marca", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Auto> autos = new ArrayList<>();
    
    // Auditoría básica
    @Column(name = "fecha_creacion")
    private java.time.LocalDateTime fechaCreacion = java.time.LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = java.time.LocalDateTime.now();
    }
}
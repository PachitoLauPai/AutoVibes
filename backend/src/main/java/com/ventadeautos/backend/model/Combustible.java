package com.ventadeautos.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "combustibles")
@Data
public class Combustible {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String nombre;
    
    private String descripcion;
    private Boolean activa = true;
    
    @OneToMany(mappedBy = "combustible", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Auto> autos = new ArrayList<>();
}
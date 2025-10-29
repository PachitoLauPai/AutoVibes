package com.ventadeautos.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "autos")
@Data
public class Auto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String marca;
    
    @Column(nullable = false)
    private String modelo;
    
    @Column(nullable = false)
    private Integer anio;
    
    @Column(nullable = false)
    private BigDecimal precio;
    
    private String color;
    private Integer kilometraje;
    
    @Enumerated(EnumType.STRING)
    private Combustible combustible;
    
    @Enumerated(EnumType.STRING)
    private Transmision transmision;
    
    private String descripcion;
    private Boolean disponible = true;

      // Agregar campo para múltiples imágenes
    @ElementCollection
    @CollectionTable(name = "auto_imagenes", joinColumns = @JoinColumn(name = "auto_id"))
    @Column(name = "url_imagen")
    private List<String> imagenes = new ArrayList<>();


}
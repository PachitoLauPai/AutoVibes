package com.ventadeautos.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "autos")
@Data
@ToString(exclude = {"marca", "combustible", "transmision", "categoria", "condicion", "ventas"})
public class Auto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ✅ Relación ManyToOne con Marca
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marca_id", nullable = false)
    private Marca marca;
    
    @Column(nullable = false)
    private String modelo;
    
    @Column(nullable = false)
    private Integer anio;
    
    @Column(nullable = false)
    private BigDecimal precio;
    
    private String color;
    private Integer kilometraje;
    
    // ✅ Relación ManyToOne
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "combustible_id")
    private Combustible combustible;
    
    // ✅ Relación ManyToOne
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transmision_id")
    private Transmision transmision;
    
    // ✅ Relación ManyToOne
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaAuto categoria;
    
    // ✅ Relación ManyToOne
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "condicion_id", nullable = false)
    private CondicionAuto condicion;


    private String descripcion;
    private Boolean disponible = true;

    @ElementCollection
    @CollectionTable(name = "auto_imagenes", joinColumns = @JoinColumn(name = "auto_id"))
    @Column(name = "url_imagen")
    private List<String> imagenes = new ArrayList<>();

    // ✅ NUEVO: Relación con ventas - CON JsonIgnore
    @OneToMany(mappedBy = "auto", fetch = FetchType.LAZY)
    @JsonIgnore // ✅ EVITA RECURSIÓN INFINITA
    private List<Venta> ventas = new ArrayList<>();

    // ✅ MÉTODO PARA CALCULAR CONDICIÓN AUTOMÁTICAMENTE
    @PrePersist
    @PreUpdate
    public void calcularCondicion() {
        if (this.kilometraje == null) {
            this.kilometraje = 0;
        }
    }
}
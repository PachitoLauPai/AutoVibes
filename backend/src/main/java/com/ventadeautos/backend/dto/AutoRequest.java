package com.ventadeautos.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AutoRequest {
    private Long marcaId;
    private String modelo;
    private Integer anio;
    private BigDecimal precio;
    private String color;
    private Integer kilometraje;
    private Integer stock;  
    
    // ✅ CAMBIADO: Ahora son IDs
    private Long combustibleId;
    private Long transmisionId;
    private Long categoriaId;
    private Long condicionId;
    
    private String descripcion;
    private Boolean disponible;
    private List<String> imagenes;
}

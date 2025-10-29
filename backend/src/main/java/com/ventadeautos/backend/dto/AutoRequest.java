package com.ventadeautos.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AutoRequest {
    private String marca;
    private String modelo;
    private Integer anio;
    private BigDecimal precio;
    private String color;
    private Integer kilometraje;
    private String combustible;
    private String transmision;
    private String descripcion;
    
    // ✅ NUEVO: Lista de URLs de imágenes
    private List<String> imagenes;
}
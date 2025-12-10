package com.ventadeautos.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VentaResponse {
    private Long id;
    

    private String clienteNombre;
    private String clienteDni;
    private String clienteEmail;
    private String clienteTelefono;
    
    // Información del auto
    private Long autoId;
    
    // ✅ Información de la marca
    private String autoMarca;      // Nombre de la marca
    private Long marcaId;          // ID de la marca
    
    // Información básica del auto
    private String autoModelo;
    private Integer autoAnio;
    private BigDecimal autoPrecio;
    
    // ✅ Información adicional del auto
    private String autoColor;
    private Integer autoKilometraje;
    private String autoCombustible;
    private String autoTransmision;
    private String autoCategoria;
    private String autoCondicion;
    
    // ✅ NUEVO: Imágenes del auto
    private List<String> autoImagenes;
    
    // Información de la venta
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaActualizacion;
}

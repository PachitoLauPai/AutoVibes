package com.ventadeautos.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VentaResponse {
    private Long id;
    private String clienteNombre;
    private String clienteApellidos;
    private String clienteDni;
    private String clienteTelefono;
    private String clienteDireccion;
    private Long autoId;
    private String autoMarca;
    private String autoModelo;
    private Integer autoAnio;
    private BigDecimal autoPrecio;
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaActualizacion;
}
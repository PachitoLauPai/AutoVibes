package com.ventadeautos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String mensaje;
    private String error;
    private int status;
    private LocalDateTime timestamp;
    
    public ErrorResponse(String mensaje, String error, int status) {
        this.mensaje = mensaje;
        this.error = error;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }
}


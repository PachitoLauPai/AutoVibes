package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.dto.EstadoVentaUpdate;
import com.ventadeautos.backend.dto.VentaResponse;
import com.ventadeautos.backend.model.EstadoVenta;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Venta;
import com.ventadeautos.backend.service.AuthenticationService;
import com.ventadeautos.backend.service.EstadoVentaService;
import com.ventadeautos.backend.service.VentaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class VentaController {
    
    private final VentaService ventaService;
    private final EstadoVentaService estadoVentaService;
    private final AuthenticationService authenticationService;
    
    @PostMapping("/contactar")
    public ResponseEntity<?> crearSolicitudContacto(@RequestBody ContactRequest contactRequest, 
                                                HttpServletRequest request) {
        log.debug("POST recibido en /api/ventas/contactar - Auto ID: {}", contactRequest.getAutoId());
        
        try {
            log.debug("Autenticando usuario");
            Usuario usuario = authenticationService.getUsuarioAutenticado(request);
            log.debug("Usuario autenticado: {} (ID: {})", usuario.getEmail(), usuario.getId());
            
            log.debug("Procesando solicitud de contacto en VentaService");
            Venta venta = ventaService.crearSolicitudContacto(contactRequest, usuario);
            
            log.info("Venta creada exitosamente - Venta ID: {}", venta.getId());
            VentaResponse response = ventaService.convertirAVentaResponse(venta);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al crear solicitud de contacto: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> obtenerMisSolicitudes(HttpServletRequest request) {
        log.debug("Obteniendo todas las solicitudes de venta");
        
        try {
            List<Venta> ventas = ventaService.obtenerTodasLasVentas();
            log.debug("Total de ventas encontradas: {}", ventas.size());
            
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener las solicitudes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las solicitudes: " + e.getMessage());
        }
    }
    
    // Endpoints para ADMIN
    
    @GetMapping("/admin/todas")
    public ResponseEntity<?> obtenerTodasLasVentas() {
        try {
            List<Venta> ventas = ventaService.obtenerTodasLasVentas();
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las ventas");
        }
    }
    
    @GetMapping("/admin/estado/{estadoNombre}")
    public ResponseEntity<?> obtenerVentasPorEstado(@PathVariable String estadoNombre) {
        try {
            // CORREGIDO: Buscar por nombre en la base de datos
            EstadoVenta estadoVenta = estadoVentaService.obtenerPorNombre(estadoNombre)
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + estadoNombre));
            
            List<Venta> ventas = ventaService.obtenerVentasPorEstado(estadoVenta);
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las ventas");
        }
    }
    
    @PutMapping("/admin/{id}/estado")
    public ResponseEntity<?> actualizarEstadoVenta(@PathVariable Long id, 
                                                    @RequestBody EstadoVentaUpdate update) {
        log.info("Actualizando venta ID: {} a estado: {}", id, update.getEstado());
        
        try {
            // ✅ VERIFICAR que el estado existe y está activo
            EstadoVenta nuevoEstado = estadoVentaService.obtenerPorNombre(update.getEstado())
                    .orElseThrow(() -> {
                        log.error("Estado no encontrado: {}", update.getEstado());
                        return new RuntimeException("Estado no encontrado: " + update.getEstado());
                    });
            
            if (!nuevoEstado.getActiva()) {
                log.warn("Intento de actualizar a estado inactivo - Venta ID: {}, Estado: {}", id, update.getEstado());
                return ResponseEntity.badRequest()
                        .body("El estado '" + update.getEstado() + "' no está activo");
            }
            
            Venta venta = ventaService.actualizarEstadoVenta(id, update.getEstado());
            VentaResponse response = ventaService.convertirAVentaResponse(venta);
            
            log.info("Venta actualizada correctamente - Venta ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar estado de venta - Venta ID: {}, Error: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Error inesperado al actualizar estado de venta - Venta ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el estado: " + e.getMessage());
        }
    }
}

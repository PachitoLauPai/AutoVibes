package com.ventadeautos.backend.controller;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.dto.EstadoVentaUpdate;
import com.ventadeautos.backend.dto.VentaResponse;
import com.ventadeautos.backend.model.EstadoVenta;
import com.ventadeautos.backend.model.Usuario;
import com.ventadeautos.backend.model.Venta;
import com.ventadeautos.backend.service.AuthenticationService;
import com.ventadeautos.backend.service.VentaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class VentaController {
    
    private final VentaService ventaService;
    private final AuthenticationService authenticationService; // ✅ Servicio real
    
  @PostMapping("/contactar")
    public ResponseEntity<?> crearSolicitudContacto(@RequestBody ContactRequest contactRequest, 
                                                HttpServletRequest request) {
        System.out.println("=== 🚨 BACKEND DEBUG INICIADO ===");
        System.out.println("✅ POST recibido en /api/ventas/contactar");
        System.out.println("📦 ContactRequest: " + contactRequest);
        System.out.println("👤 Headers - Authorization: " + request.getHeader("Authorization"));
        System.out.println("👤 Headers - Content-Type: " + request.getHeader("Content-Type"));
        
        try {
            System.out.println("🔍 Autenticando usuario...");
            Usuario usuario = authenticationService.getUsuarioAutenticado(request);
            System.out.println("✅ Usuario autenticado: " + usuario.getEmail() + " ID: " + usuario.getId());
            
            System.out.println("🔍 Procesando en VentaService...");
            Venta venta = ventaService.crearSolicitudContacto(contactRequest, usuario);
            
            System.out.println("✅ Venta creada exitosamente ID: " + venta.getId());
            VentaResponse response = ventaService.convertirAVentaResponse(venta);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ ERROR EN BACKEND: " + e.getMessage());
            e.printStackTrace(); // 🔥 ESTO ES CLAVE
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> obtenerMisSolicitudes(HttpServletRequest request) {
        try {
            Usuario usuario = authenticationService.getUsuarioAutenticado(request);
            List<Venta> ventas = ventaService.obtenerVentasPorCliente(usuario.getId());
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las solicitudes");
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
    
    @GetMapping("/admin/estado/{estado}")
    public ResponseEntity<?> obtenerVentasPorEstado(@PathVariable String estado) {
        try {
            EstadoVenta estadoVenta = EstadoVenta.valueOf(estado.toUpperCase());
            List<Venta> ventas = ventaService.obtenerVentasPorEstado(estadoVenta);
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Estado no válido: " + estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las ventas");
        }
    }
    
    @PutMapping("/admin/{id}/estado")
    public ResponseEntity<?> actualizarEstadoVenta(@PathVariable Long id, 
                                                  @RequestBody EstadoVentaUpdate update) {
        try {
            EstadoVenta nuevoEstado = EstadoVenta.valueOf(update.getEstado().toUpperCase());
            Venta venta = ventaService.actualizarEstadoVenta(id, nuevoEstado);
            VentaResponse response = ventaService.convertirAVentaResponse(venta);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Estado no válido: " + update.getEstado());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el estado");
        }
    }
}
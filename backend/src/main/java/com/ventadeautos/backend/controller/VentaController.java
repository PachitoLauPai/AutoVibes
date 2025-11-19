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
    private final EstadoVentaService estadoVentaService;
    private final AuthenticationService authenticationService;
    
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
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> obtenerMisSolicitudes(HttpServletRequest request) {
        System.out.println("🔓 [VENTAS] Endpoint público - obteniendo todas las solicitudes");
        
        try {
            List<Venta> ventas = ventaService.obtenerTodasLasVentas();
            System.out.println("✅ [VENTAS] Total de ventas encontradas: " + ventas.size());
            
            List<VentaResponse> response = ventaService.convertirListaAVentaResponse(ventas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ [VENTAS] ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al obtener las solicitudes: " + e.getMessage());
        }
    }
    
    // Endpoints para ADMIN - CORREGIDOS
    
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
        try {
            System.out.println("🔄 [VENTAS] Actualizando venta #" + id + " a estado: " + update.getEstado());
            
            // ✅ VERIFICAR que el estado existe y está activo
            EstadoVenta nuevoEstado = estadoVentaService.obtenerPorNombre(update.getEstado())
                    .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + update.getEstado()));
            
            if (!nuevoEstado.getActiva()) {
                return ResponseEntity.badRequest()
                        .body("El estado '" + update.getEstado() + "' no está activo");
            }
            
            // ✅ Pasar el STRING del nombre
            System.out.println("📢 Llamando a VentaService.actualizarEstadoVenta()");
            Venta venta = ventaService.actualizarEstadoVenta(id, update.getEstado());
            
            VentaResponse response = ventaService.convertirAVentaResponse(venta);
            System.out.println("✅ Venta actualizada correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.out.println("❌ [VENTAS] RuntimeException: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ [VENTAS] Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar el estado: " + e.getMessage());
        }
    }
}
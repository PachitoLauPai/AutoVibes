package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.dto.VentaResponse;
import com.ventadeautos.backend.exception.BadRequestException;
import com.ventadeautos.backend.exception.ConflictException;
import com.ventadeautos.backend.exception.ResourceNotFoundException;
import com.ventadeautos.backend.model.*;
import com.ventadeautos.backend.repository.AutoRepository;
import com.ventadeautos.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {
    
    private final VentaRepository ventaRepository;
    private final AutoRepository autoRepository;
    private final EstadoVentaService estadoVentaService;
    
    // ✅ NOTA: crearSolicitudContacto está DEPRECADO
    // Los contactos públicos ahora se manejan mediante ContactService
    // Este método se mantiene por compatibilidad con el código legacy
    @Deprecated(since = "2.0", forRemoval = true)
    public Venta crearSolicitudContacto(ContactRequest contactRequest, Usuario usuario) {
        log.warn("DEPRECADO: crearSolicitudContacto - Usar ContactService en su lugar");
        throw new RuntimeException("Este método está deprecado. Usar ContactService.guardarContacto() en su lugar");
    }
    
    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAllWithAutoAndMarca();
    }
    
    public List<Venta> obtenerVentasPorEstado(EstadoVenta estado) {
        return ventaRepository.findByEstado(estado);
    }
    
    // ✅ MEJORAR: Cambiar firma para recibir String (nombre del estado)
    @Transactional
    public Venta actualizarEstadoVenta(Long ventaId, String nuevoEstadoNombre) {
        log.info("Actualizando venta ID: {} a estado: {}", ventaId, nuevoEstadoNombre);
        
        Venta venta = ventaRepository.findById((Long)ventaId)
            .orElseThrow(() -> {
                log.error("Venta no encontrada con ID: {}", ventaId);
                return new ResourceNotFoundException("Venta", ventaId);
            });
        
        // ✅ Buscar el estado por nombre
        EstadoVenta nuevoEstado = estadoVentaService.obtenerPorNombre(nuevoEstadoNombre)
            .orElseThrow(() -> {
                log.error("Estado no encontrado: {}", nuevoEstadoNombre);
                return new ResourceNotFoundException("Estado", nuevoEstadoNombre);
            });
        
        EstadoVenta estadoAnterior = venta.getEstado();
        venta.setEstado(nuevoEstado);
        
        Venta ventaActualizada = ventaRepository.save(venta);
        log.info("Venta actualizada - ID: {}, Estado anterior: {} → Estado nuevo: {}", 
                ventaId, estadoAnterior.getNombre(), nuevoEstadoNombre);
        
        // ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO
        actualizarDisponibilidadAuto(venta.getAuto().getId());
        
        return ventaActualizada;
    }
        
    // ✅ MÉTODO CORREGIDO
    private void actualizarDisponibilidadAuto(Long autoId) {
        Auto auto = autoRepository.findById((Long)autoId)
            .orElseThrow(() -> new ResourceNotFoundException("Auto", autoId));
        
        // Obtener estados
        EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
            .orElseThrow(() -> new ResourceNotFoundException("Estado", "PENDIENTE"));
        
        EstadoVenta estadoFinalizado = estadoVentaService.obtenerPorNombre("FINALIZADO")
            .orElseThrow(() -> new ResourceNotFoundException("Estado", "FINALIZADO"));
        
        // Obtener TODAS las ventas del auto
        List<Venta> ventasDelAuto = ventaRepository.findByAutoId(autoId);
        
        boolean tieneVentaPendiente = ventasDelAuto.stream()
            .anyMatch(v -> v.getEstado().getId().equals(estadoPendiente.getId()));
        
        boolean tieneVentaFinalizado = ventasDelAuto.stream()
            .anyMatch(v -> v.getEstado().getId().equals(estadoFinalizado.getId()));
        
        // ✅ Determinar nueva disponibilidad
        boolean nuevaDisponibilidad;
        
        if (tieneVentaPendiente) {
            // Si hay PENDIENTE → NO disponible
            nuevaDisponibilidad = false;
            log.debug("Auto ID: {} → NO DISPONIBLE (venta PENDIENTE)", autoId);
        } 
        else if (tieneVentaFinalizado) {
            // Si hay FINALIZADO → NO disponible (vendido)
            nuevaDisponibilidad = false;
            log.debug("Auto ID: {} → NO DISPONIBLE (VENDIDO)", autoId);
        } 
        else {
            // Si NO hay PENDIENTE ni FINALIZADO (todas canceladas o sin ventas) → SÍ disponible
            nuevaDisponibilidad = true;
            log.debug("Auto ID: {} → DISPONIBLE (ventas canceladas o sin ventas)", autoId);
        }
        
        // Solo actualizar si cambió
        if (auto.getDisponible() != nuevaDisponibilidad) {
            auto.setDisponible(nuevaDisponibilidad);
            autoRepository.save(auto);
            log.info("Auto ID: {} - Disponibilidad actualizada: {}", autoId, nuevaDisponibilidad);
        }
    }
    
    public VentaResponse convertirAVentaResponse(Venta venta) {
        VentaResponse dto = new VentaResponse();
        dto.setId(venta.getId());
        
        // Información del contacto
        if (venta.getContact() != null) {
            dto.setClienteNombre(venta.getContact().getNombre());
            dto.setClienteDni(venta.getContact().getDni());
            dto.setClienteTelefono(venta.getContact().getTelefono());
            dto.setClienteEmail(venta.getContact().getEmail());
        }
        
        // Información del auto
        if (venta.getAuto() != null) {
            dto.setAutoId(venta.getAuto().getId());
            
            // ✅ Información de la marca
            if (venta.getAuto().getMarca() != null) {
                dto.setAutoMarca(venta.getAuto().getMarca().getNombre());
                dto.setMarcaId(venta.getAuto().getMarca().getId());
            } else {
                dto.setAutoMarca("Sin marca");
                dto.setMarcaId(null);
            }
            
            dto.setAutoModelo(venta.getAuto().getModelo());
            dto.setAutoAnio(venta.getAuto().getAnio());
            dto.setAutoPrecio(venta.getAuto().getPrecio());
            
            // ✅ Información adicional del auto
            dto.setAutoColor(venta.getAuto().getColor());
            dto.setAutoKilometraje(venta.getAuto().getKilometraje());
            
            if (venta.getAuto().getCombustible() != null) {
                dto.setAutoCombustible(venta.getAuto().getCombustible().getNombre());
            }
            
            if (venta.getAuto().getTransmision() != null) {
                dto.setAutoTransmision(venta.getAuto().getTransmision().getNombre());
            }
            
            if (venta.getAuto().getCategoria() != null) {
                dto.setAutoCategoria(venta.getAuto().getCategoria().getNombre());
            }
            
            if (venta.getAuto().getCondicion() != null) {
                dto.setAutoCondicion(venta.getAuto().getCondicion().getNombre());
            }
            
            // ✅ MAPEAR IMÁGENES DEL AUTO
            if (venta.getAuto().getImagenes() != null && !venta.getAuto().getImagenes().isEmpty()) {
                dto.setAutoImagenes(venta.getAuto().getImagenes());
            }
        }
        
        // Información de la venta
        if (venta.getEstado() != null) {
            dto.setEstado(venta.getEstado().getNombre());
        } else {
            dto.setEstado("SIN ESTADO");
        }
        
        dto.setFechaSolicitud(venta.getFechaSolicitud());
        dto.setFechaActualizacion(venta.getFechaActualizacion());
        
        return dto;
    }
    
    public List<VentaResponse> convertirListaAVentaResponse(List<Venta> ventas) {
        return ventas.stream()
            .map(this::convertirAVentaResponse)
            .collect(Collectors.toList());
    }
}
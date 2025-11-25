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
    private final ClienteService clienteService;
    private final AutoRepository autoRepository;
    private final EstadoVentaService estadoVentaService;
    
    public Venta crearSolicitudContacto(ContactRequest contactRequest, Usuario usuario) {
        log.debug("Iniciando creación de solicitud de contacto - Usuario ID: {}, Email: {}, Auto ID: {}", 
                usuario.getId(), usuario.getEmail(), contactRequest.getAutoId());
        
        try {
            // 1. Verificar auto
            log.debug("Buscando auto con ID: {}", contactRequest.getAutoId());
            Auto auto = autoRepository.findById(contactRequest.getAutoId())
                .orElseThrow(() -> {
                    log.error("Auto no encontrado con ID: {}", contactRequest.getAutoId());
                    return new ResourceNotFoundException("Auto", contactRequest.getAutoId());
                });
            log.debug("Auto encontrado: {} {}", auto.getMarca().getNombre(), auto.getModelo());
            
            // ✅ Verificar que el auto esté disponible
            if (!auto.getDisponible()) {
                log.warn("Intento de contacto con auto no disponible - Auto ID: {}", auto.getId());
                throw new BadRequestException("El auto no está disponible para venta");
            }
            
            // 2. Verificar cliente
            log.debug("Procesando cliente para usuario ID: {}", usuario.getId());
            Cliente cliente = clienteService.crearOActualizarCliente(contactRequest, usuario);
            log.debug("Cliente procesado: {}", cliente.getNombres());
            
            // 3. Verificar venta existente
            log.debug("Verificando ventas existentes para cliente ID: {} y auto ID: {}", cliente.getId(), auto.getId());
            Optional<Venta> ventaExistente = ventaRepository.findByClienteIdAndAutoId(cliente.getId(), auto.getId());
            if (ventaExistente.isPresent()) {
                log.warn("Ya existe una solicitud de contacto pendiente - Venta ID: {}", ventaExistente.get().getId());
                throw new ConflictException("Ya existe una solicitud de contacto pendiente para este auto");
            }
            
            // 4. Obtener estado PENDIENTE de la base de datos
            log.debug("Buscando estado PENDIENTE");
            EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
                    .orElseThrow(() -> new ResourceNotFoundException("Estado", "PENDIENTE"));
            
            // 5. Crear venta
            log.debug("Creando nueva venta");
            Venta venta = new Venta();
            venta.setCliente(cliente);
            venta.setAuto(auto);
            venta.setEstado(estadoPendiente);
            
            Venta ventaGuardada = ventaRepository.save(venta);
            log.info("Venta creada exitosamente - Venta ID: {}, Cliente: {}, Auto: {}", 
                    ventaGuardada.getId(), cliente.getNombres(), auto.getModelo());
            
            // 6. ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO AUTOMÁTICAMENTE
            actualizarDisponibilidadAuto(auto.getId());
            
            return ventaGuardada;
            
        } catch (BadRequestException | ConflictException | ResourceNotFoundException e) {
            log.error("Error al crear solicitud de contacto: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Error crítico al crear solicitud de contacto", e);
            throw new BadRequestException("Error al procesar la solicitud de contacto: " + e.getMessage());
        }
    }
    
    public List<Venta> obtenerVentasPorCliente(Long usuarioId) {
        return ventaRepository.findByClienteUsuarioIdWithAutoAndMarca(usuarioId);
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
        
        Venta venta = ventaRepository.findById(ventaId)
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
        Auto auto = autoRepository.findById(autoId)
            .orElseThrow(() -> new ResourceNotFoundException("Auto", autoId));
        
        // Obtener estados
        EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
            .orElseThrow(() -> new ResourceNotFoundException("Estado", "PENDIENTE"));
        
        EstadoVenta estadoFinalizado = estadoVentaService.obtenerPorNombre("FINALIZADO")
            .orElseThrow(() -> new ResourceNotFoundException("Estado", "FINALIZADO"));
        
        EstadoVenta estadoCancelado = estadoVentaService.obtenerPorNombre("CANCELADO")
            .orElseThrow(() -> new ResourceNotFoundException("Estado", "CANCELADO"));
        
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
        
        // Información del cliente
        if (venta.getCliente() != null) {
            dto.setClienteNombre(venta.getCliente().getNombres());
            dto.setClienteApellidos(venta.getCliente().getApellidos());
            dto.setClienteDni(venta.getCliente().getDni());
            dto.setClienteTelefono(venta.getCliente().getTelefono());
            dto.setClienteDireccion(venta.getCliente().getDireccion());
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

    // ✅ MÉTODO: Verificar si un usuario tiene ventas activas
    public boolean tieneVentasActivas(Long usuarioId) {
        // Buscar cliente asociado al usuario
        Optional<Cliente> cliente = clienteService.obtenerClientePorUsuarioId(usuarioId);
        
        if (cliente.isPresent()) {
            // Obtener estado PENDIENTE de la base de datos
            EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
                    .orElseThrow(() -> new ResourceNotFoundException("Estado", "PENDIENTE"));
            
            // Verificar si el cliente tiene ventas pendientes
            List<Venta> ventasPendientes = ventaRepository.findByClienteIdAndEstado(
                cliente.get().getId(), estadoPendiente);
            return !ventasPendientes.isEmpty();
        }
        
        return false;

    }
    

}
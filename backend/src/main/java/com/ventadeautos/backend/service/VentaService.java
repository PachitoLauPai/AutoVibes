package com.ventadeautos.backend.service;

import com.ventadeautos.backend.dto.ContactRequest;
import com.ventadeautos.backend.dto.VentaResponse;
import com.ventadeautos.backend.model.*;
import com.ventadeautos.backend.repository.AutoRepository;
import com.ventadeautos.backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {
    
    private final VentaRepository ventaRepository;
    private final ClienteService clienteService;
    private final AutoRepository autoRepository;
    private final EstadoVentaService estadoVentaService;
    
    public Venta crearSolicitudContacto(ContactRequest contactRequest, Usuario usuario) {
        System.out.println("=== 🚨 DEBUG INICIANDO ===");
        System.out.println("📦 ContactRequest: " + contactRequest);
        System.out.println("👤 Usuario ID: " + usuario.getId() + ", Email: " + usuario.getEmail());
        System.out.println("🚗 Auto ID: " + contactRequest.getAutoId());
        
        try {
            // 1. Verificar auto
            System.out.println("🔍 Buscando auto...");
            Auto auto = autoRepository.findById(contactRequest.getAutoId())
                .orElseThrow(() -> {
                    System.out.println("❌ AUTO NO ENCONTRADO: " + contactRequest.getAutoId());
                    return new RuntimeException("Auto no encontrado");
                });
            System.out.println("✅ Auto encontrado: " + auto.getMarca() + " " + auto.getModelo());
            
            // ✅ Verificar que el auto esté disponible
            if (!auto.getDisponible()) {
                throw new RuntimeException("El auto no está disponible para venta");
            }
            
            // 2. Verificar cliente
            System.out.println("🔍 Procesando cliente...");
            Cliente cliente = clienteService.crearOActualizarCliente(contactRequest, usuario);
            System.out.println("✅ Cliente procesado: " + cliente.getNombres());
            
            // 3. Verificar venta existente
            System.out.println("🔍 Verificando ventas existentes...");
            Optional<Venta> ventaExistente = ventaRepository.findByClienteIdAndAutoId(cliente.getId(), auto.getId());
            if (ventaExistente.isPresent()) {
                System.out.println("❌ VENTA EXISTENTE: " + ventaExistente.get().getId());
                throw new RuntimeException("Ya existe una solicitud de contacto pendiente para este auto");
            }
            
            // 4. Obtener estado PENDIENTE de la base de datos
            System.out.println("🔍 Buscando estado PENDIENTE...");
            EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
                    .orElseThrow(() -> new RuntimeException("Estado PENDIENTE no encontrado en la base de datos"));
            
            // 5. Crear venta
            System.out.println("🔍 Creando nueva venta...");
            Venta venta = new Venta();
            venta.setCliente(cliente);
            venta.setAuto(auto);
            venta.setEstado(estadoPendiente);
            
            Venta ventaGuardada = ventaRepository.save(venta);
            System.out.println("✅ Venta creada exitosamente: " + ventaGuardada.getId());
            
            // 6. ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO AUTOMÁTICAMENTE
            actualizarDisponibilidadAuto(auto.getId()); // ✅ LLAMADA CORRECTA AL MÉTODO
            
            return ventaGuardada;
            
        } catch (Exception e) {
            System.out.println("❌ ERROR CRÍTICO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public List<Venta> obtenerVentasPorCliente(Long usuarioId) {
        return ventaRepository.findByClienteUsuarioId(usuarioId);
    }
    
    public List<Venta> obtenerTodasLasVentas() {
        return ventaRepository.findAllByOrderByFechaSolicitudDesc();
    }
    
    public List<Venta> obtenerVentasPorEstado(EstadoVenta estado) {
        return ventaRepository.findByEstado(estado);
    }
    
    // ✅ MEJORAR: Cambiar firma para recibir String (nombre del estado)
    @Transactional
    public Venta actualizarEstadoVenta(Long ventaId, String nuevoEstadoNombre) {
        System.out.println("🔄 Actualizando venta #" + ventaId + " a estado: " + nuevoEstadoNombre);
        
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
        
        // ✅ Buscar el estado por nombre
        EstadoVenta nuevoEstado = estadoVentaService.obtenerPorNombre(nuevoEstadoNombre)
            .orElseThrow(() -> new RuntimeException("Estado no encontrado: " + nuevoEstadoNombre));
        
        EstadoVenta estadoAnterior = venta.getEstado();
        venta.setEstado(nuevoEstado);
        
        Venta ventaActualizada = ventaRepository.save(venta);
        System.out.println("✅ Venta actualizada: " + estadoAnterior.getNombre() + " → " + nuevoEstadoNombre);
        
        // ✅ ACTUALIZAR DISPONIBILIDAD DEL AUTO
        actualizarDisponibilidadAuto(venta.getAuto().getId());
        
        return ventaActualizada;
    }
        
    // ✅ MÉTODO CORREGIDO
    private void actualizarDisponibilidadAuto(Long autoId) {
        Auto auto = autoRepository.findById(autoId)
            .orElseThrow(() -> new RuntimeException("Auto no encontrado"));
        
        // Obtener estados
        EstadoVenta estadoPendiente = estadoVentaService.obtenerPorNombre("PENDIENTE")
            .orElseThrow(() -> new RuntimeException("Estado PENDIENTE no encontrado"));
        
        EstadoVenta estadoFinalizado = estadoVentaService.obtenerPorNombre("FINALIZADO")
            .orElseThrow(() -> new RuntimeException("Estado FINALIZADO no encontrado"));
        
        EstadoVenta estadoCancelado = estadoVentaService.obtenerPorNombre("CANCELADO")
            .orElseThrow(() -> new RuntimeException("Estado CANCELADO no encontrado"));
        
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
            System.out.println("🔒 Auto #" + autoId + " → NO DISPONIBLE (venta PENDIENTE)");
        } 
        else if (tieneVentaFinalizado) {
            // Si hay FINALIZADO → NO disponible (vendido)
            nuevaDisponibilidad = false;
            System.out.println("🔒 Auto #" + autoId + " → NO DISPONIBLE (VENDIDO)");
        } 
        else {
            // Si NO hay PENDIENTE ni FINALIZADO (todas canceladas o sin ventas) → SÍ disponible
            nuevaDisponibilidad = true;
            System.out.println("✅ Auto #" + autoId + " → DISPONIBLE (ventas canceladas)");
        }
        
        // Solo actualizar si cambió
        if (auto.getDisponible() != nuevaDisponibilidad) {
            auto.setDisponible(nuevaDisponibilidad);
            autoRepository.save(auto);
            System.out.println("💾 Auto #" + autoId + " guardado con disponibilidad: " + nuevaDisponibilidad);
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
                    .orElseThrow(() -> new RuntimeException("Estado PENDIENTE no encontrado"));
            
            // Verificar si el cliente tiene ventas pendientes
            List<Venta> ventasPendientes = ventaRepository.findByClienteIdAndEstado(
                cliente.get().getId(), estadoPendiente);
            return !ventasPendientes.isEmpty();
        }
        
        return false;

    }
    

}
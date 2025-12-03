package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.EstadoVenta;
import com.ventadeautos.backend.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    
    List<Venta> findByEstado(EstadoVenta estado);
    List<Venta> findByAutoId(Long autoId);
    List<Venta> findAllByOrderByFechaSolicitudDesc();
    
    // ✅ Cargar venta con auto y marca
    @Query("SELECT v FROM Venta v LEFT JOIN FETCH v.auto a LEFT JOIN FETCH a.marca LEFT JOIN FETCH v.contact WHERE v.id = :id")
    Optional<Venta> findByIdWithAutoAndMarca(@Param("id") Long id);
    
    // ✅ Cargar todas las ventas con auto y marca
    @Query("SELECT v FROM Venta v LEFT JOIN FETCH v.auto a LEFT JOIN FETCH a.marca LEFT JOIN FETCH v.contact ORDER BY v.fechaSolicitud DESC")
    List<Venta> findAllWithAutoAndMarca();
}
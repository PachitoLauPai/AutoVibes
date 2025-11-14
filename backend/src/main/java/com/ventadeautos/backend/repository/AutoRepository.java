package com.ventadeautos.backend.repository;

import com.ventadeautos.backend.model.Auto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AutoRepository extends JpaRepository<Auto, Long> {
    
    List<Auto> findByDisponibleTrue();
    List<Auto> findByMarcaContainingIgnoreCase(String marca);
    List<Auto> findByModeloContainingIgnoreCase(String modelo);
    
    // ✅ NUEVO: Autos disponibles SIN ventas pendientes
    @Query("SELECT a FROM Auto a WHERE a.disponible = true AND " +
           "NOT EXISTS (SELECT v FROM Venta v WHERE v.auto = a AND v.estado = 'PENDIENTE')")
    List<Auto> findAutosDisponiblesSinVentasPendientes();
    
    // ✅ NUEVO: Autos con ventas pendientes (solo para admin)
    @Query("SELECT a FROM Auto a WHERE EXISTS (SELECT v FROM Venta v WHERE v.auto = a AND v.estado = 'PENDIENTE')")
    List<Auto> findAutosConVentasPendientes();
}
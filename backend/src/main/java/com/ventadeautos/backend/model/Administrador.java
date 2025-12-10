package com.ventadeautos.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "administradores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = true)
    private String apellido;
    
    @Column(nullable = true, unique = true)
    private String dni;
    
    @Column(nullable = false, unique = true)
    private String correo;
    
    @Column(nullable = false)
    private String password;
    
    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;
    
    @Column(nullable = false)
    private Boolean activo = true;
}

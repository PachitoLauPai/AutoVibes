# 🏗️ ARQUITECTURA TÉCNICA - Sistema de Gestión de Contactos

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Navegador)                         │
│                                                                 │
│  Página de Autos → Auto Detail → Formulario → WhatsApp         │
│                                                                 │
│  [Angular Frontend - localhost:4200]                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP(S)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND API (Spring Boot)                       │
│                 localhost:8080                                  │
│                                                                 │
│  ContactController                                              │
│  ├─ POST /api/contact/enviar                                   │
│  ├─ GET /api/contact/admin/todos                               │
│  └─ PUT /api/contact/admin/{id}/actualizar-estado              │
│                                                                 │
│  ContactService (Validación + Lógica)                          │
│  ├─ actualizarEstado() → Valida 4 estados                      │
│  └─ obtenerContactosPorEstado()                                │
│                                                                 │
│  ContactRepository (Spring Data JPA)                           │
│  ├─ save()                                                      │
│  ├─ findAll()                                                   │
│  ├─ findById()                                                  │
│  └─ findByEstado()                                              │
│                                                                 │
│  Contact Entity (JPA)                                           │
│  ├─ id, nombre, email, dni, teléfono                           │
│  ├─ asunto, mensaje, leído, timestamps                         │
│  ├─ estado (NUEVO)                                             │
│  └─ auto (NUEVO - Relación ManyToOne)                          │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ JDBC/Hibernate ORM
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MYSQL DATABASE                                │
│                localhost:3306                                   │
│                                                                 │
│  Tabla: contactos                                               │
│  ├─ id (BIGINT, PK)                                             │
│  ├─ nombre, email, dni, telefonoWhatsapp                        │
│  ├─ asunto, mensaje, leído                                      │
│  ├─ estado (NUEVO) - VARCHAR(50)                               │
│  ├─ auto_id (NUEVO) - FK → autos.id                            │
│  ├─ fechaCreacion, fechaActualizacion (TIMESTAMP)              │
│  └─ Índices en: estado, auto_id, fechaCreacion                 │
│                                                                 │
│  Valores en estado:                                             │
│  • PENDIENTE (inicial)                                          │
│  • EN_PROCESO                                                   │
│  • VENTA_FINALIZADA                                             │
│  • CANCELADO                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos - Cliente

```
INICIO: Cliente en página de auto
│
├─→ [auto-detail.component.ts]
│   ├─ ngOnInit() → Carga detalles del auto
│   ├─ Lee: this.auto (inyectado del ActivatedRoute)
│   ├─ Inyectados: ContactService, AutoService, AuthService, Router
│   │
│   └─ USUARIO PRESIONA: "📱 Contactar por WhatsApp"
│      │
│      └─→ enviarContacto()
│         │
│         ├─ 1. VALIDACIÓN
│         │  └─ this.form.invalid? → Salir
│         │
│         ├─ 2. PREPARAR DATOS
│         │  ├─ nombre, dni, correo (o email)
│         │  ├─ telefonoWhatsapp (ADD "+51" prefix)
│         │  ├─ asunto, mensaje
│         │  └─ autoId = this.auto.id
│         │
│         ├─ 3. CREAR REQUEST
│         │  └─ ContactRequest {nombre, dni, email, teléfono, asunto, mensaje, autoId}
│         │
│         ├─ 4. HTTP POST
│         │  └─ this.contactService.enviarContacto(contactoData)
│         │     │
│         │     ├─→ [contact.service.ts]
│         │     │  └─ POST http://localhost:8080/api/contact/enviar
│         │     │     │
│         │     │     ├─→ [ContactController]
│         │     │     │  ├─ @PostMapping("/enviar")
│         │     │     │  ├─ Recibe: ContactRequest request
│         │     │     │  ├─ Llama: contactService.guardarContacto(request)
│         │     │     │  │
│         │     │     │  ├─→ [ContactService.guardarContacto()]
│         │     │     │  │  ├─ Crea: Contact entity
│         │     │     │  │  ├─ Set: estado = "PENDIENTE"
│         │     │     │  │  ├─ Set: leído = false
│         │     │     │  │  ├─ Set: auto (busca por autoId)
│         │     │     │  │  ├─ Set: timestamps (via @PrePersist)
│         │     │     │  │  ├─ VALIDA: Auto existe
│         │     │     │  │  ├─ SAVE: contactRepository.save(contact)
│         │     │     │  │  │
│         │     │     │  │  ├─→ [ContactRepository]
│         │     │     │  │  │  └─ .save(contact)
│         │     │     │  │  │     │
│         │     │     │  │  │     ├─→ [Hibernate ORM]
│         │     │     │  │  │     │  ├─ INSERT into contactos (...)
│         │     │     │  │  │     │  ├─ VALUES (...)
│         │     │     │  │  │     │  └─ COMMIT
│         │     │     │  │  │     │
│         │     │     │  │  │     ├─→ [MySQL]
│         │     │     │  │  │     │  └─ ✅ Row inserted
│         │     │     │  │  │     │
│         │     │     │  │  │     └─→ Retorna: Contact object (con ID)
│         │     │     │  │  │
│         │     │     │  │  └─ Retorna: Contact savedContact
│         │     │     │  │
│         │     │     │  └─ ResponseEntity.created(uri).body(savedContact)
│         │     │     │
│         │     │     └─ Retorna: 201 Created + Contact JSON
│         │     │
│         │     └─ Observable resuelto ✅
│         │
│         ├─ 5. SUCCESS HANDLER (.subscribe next)
│         │  ├─ ✅ Contacto guardado en BD
│         │  ├─ ABRE: WhatsApp
│         │  │  └─ window.open("https://wa.me/+51987654321?text=...")
│         │  ├─ MUESTRA: alert("¡Contacto guardado!")
│         │  └─ CIERRA: Modal del formulario
│         │
│         └─ 6. ERROR HANDLER (.subscribe error)
│            ├─ ❌ Error en la BD
│            ├─ MUESTRA: alert("Error al guardar el contacto")
│            ├─ LOGS: console.error(err)
│            └─ NO ABRE: WhatsApp
│
└─ FIN: Formulario cerrado, usuario puede enviar WhatsApp o ver admin
```

---

## Flujo de Datos - Admin

```
INICIO: Admin accede a /admin/contact-list
│
├─→ [contact-list.component.ts]
│   ├─ ngOnInit()
│   ├─ cargarContactos()
│   │
│   ├─→ [contact.service.ts]
│   │  └─ obtenerContactos()
│   │     │
│   │     ├─→ HTTP GET http://localhost:8080/api/contact/admin/todos
│   │     │  │
│   │     │  ├─→ [ContactController]
│   │     │  │  ├─ @GetMapping("/admin/todos")
│   │     │  │  ├─ Llama: contactService.obtenerTodos()
│   │     │  │  │
│   │     │  │  ├─→ [ContactService.obtenerTodos()]
│   │     │  │  │  ├─ contactRepository.findAll()
│   │     │  │  │  │
│   │     │  │  │  ├─→ [ContactRepository]
│   │     │  │  │  │  └─ SELECT * FROM contactos
│   │     │  │  │  │     (Hibernate con LAZY loading del auto)
│   │     │  │  │  │
│   │     │  │  │  ├─→ [MySQL]
│   │     │  │  │  │  └─ ✅ Rows fetched
│   │     │  │  │  │
│   │     │  │  │  └─ Retorna: List<Contact>
│   │     │  │  │
│   │     │  │  └─ ResponseEntity.ok(contactos)
│   │     │  │
│   │     │  └─ Retorna: 200 OK + Array de contactos JSON
│   │     │
│   │     └─ Observable resuelto ✅
│   │
│   ├─ SUCCESS: this.contactos = contactos
│   ├─ RENDERIZA: Lista de contactos con badges
│   │  ├─ For each contacto:
│   │  │  ├─ *ngFor="let contacto of contactosFiltrados"
│   │  │  ├─ Muestra: nombre, estado (badge color)
│   │  │  ├─ Muestra: imagen del auto (contacto.auto.imagenes[0])
│   │  │  ├─ Botón: "Ver Detalles"
│   │  │  └─ getEstadoBadgeClass() → badge-warning|info|success|danger
│   │
│   └─ Usuario hace click: "Ver Detalles"
│      │
│      ├─ [Abre Modal]
│      ├─ selectedContact = contacto
│      ├─ showDetail = true
│      │
│      ├─ Muestra:
│      │  ├─ Información del cliente (nombre, DNI, email, etc.)
│      │  ├─ Mensaje del cliente
│      │  ├─ Imagen grande del auto
│      │  ├─ Especificaciones del auto (marca, modelo, año, color, precio, etc.)
│      │  └─ Estado actual con badge + Botón "Cambiar Estado"
│      │
│      └─ Usuario presiona: "Cambiar Estado"
│         │
│         ├─ iniciarEdicionEstado(contacto)
│         │  └─ editingStatus[contacto.id] = true
│         │  └─ newStatus[contacto.id] = contacto.estado
│         │
│         ├─ [Interfaz cambia a modo EDICIÓN]
│         │  ├─ Dropdown: <select [(ngModel)]="newStatus[id]">
│         │  ├─ Opciones: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO
│         │  └─ Botones: [Guardar] [Cancelar]
│         │
│         ├─ Usuario selecciona: "EN_PROCESO"
│         │  └─ newStatus[contacto.id] = "EN_PROCESO"
│         │
│         └─ Usuario presiona: "Guardar"
│            │
│            ├─ guardarNuevoEstado(contacto)
│            │  │
│            │  ├─ this.contactService.actualizarEstado(contacto.id, newStatus[id])
│            │  │  │
│            │  │  ├─→ [contact.service.ts]
│            │  │  │  └─ actualizarEstado(id, nuevoEstado)
│            │  │  │     │
│            │  │  │     ├─→ HTTP PUT http://localhost:8080/api/contact/admin/1/actualizar-estado
│            │  │  │     │  ├─ Body: { estado: "EN_PROCESO" }
│            │  │  │     │  │
│            │  │  │     │  ├─→ [ContactController]
│            │  │  │     │  │  ├─ @PutMapping("/admin/{id}/actualizar-estado")
│            │  │  │     │  │  ├─ PathVariable: id = 1
│            │  │  │     │  │  ├─ Llama: contactService.actualizarEstado(1, "EN_PROCESO")
│            │  │  │     │  │  │
│            │  │  │     │  │  ├─→ [ContactService.actualizarEstado()]
│            │  │  │     │  │  │  ├─ VALIDA: Estado en ["PENDIENTE", "EN_PROCESO", "VENTA_FINALIZADA", "CANCELADO"]
│            │  │  │     │  │  │  ├─ SI INVALIDO: Throw IllegalArgumentException ❌
│            │  │  │     │  │  │  ├─ contactRepository.findById(1)
│            │  │  │     │  │  │  ├─ contact.setEstado("EN_PROCESO")
│            │  │  │     │  │  │  ├─ @PreUpdate → timestamps actualizados automáticamente
│            │  │  │     │  │  │  ├─ contactRepository.save(contact)
│            │  │  │     │  │  │  │
│            │  │  │     │  │  │  ├─→ [Hibernate ORM]
│            │  │  │     │  │  │  │  ├─ UPDATE contactos
│            │  │  │     │  │  │  │  ├─ SET estado = "EN_PROCESO", fechaActualizacion = NOW()
│            │  │  │     │  │  │  │  ├─ WHERE id = 1
│            │  │  │     │  │  │  │  └─ COMMIT
│            │  │  │     │  │  │  │
│            │  │  │     │  │  │  ├─→ [MySQL]
│            │  │  │     │  │  │  │  └─ ✅ Row updated
│            │  │  │     │  │  │  │
│            │  │  │     │  │  │  └─ Retorna: Contact actualizado
│            │  │  │     │  │  │
│            │  │  │     │  │  └─ ResponseEntity.ok(contactoActualizado)
│            │  │  │     │  │
│            │  │  │     │  └─ Retorna: 200 OK + Contact JSON
│            │  │  │     │
│            │  │  │     └─ Observable resuelto ✅
│            │  │  │
│            │  │  ├─ SUCCESS HANDLER
│            │  │  │  ├─ contacto.estado = "EN_PROCESO" (local update)
│            │  │  │  ├─ editingStatus[id] = false (sale de modo edición)
│            │  │  │  ├─ alert("Estado actualizado exitosamente")
│            │  │  │  │
│            │  │  │  ├─ [UI se actualiza]
│            │  │  │  │  ├─ Badge cambia a color AZUL 🔵
│            │  │  │  │  ├─ Texto: "En Proceso"
│            │  │  │  │  └─ Modal permanece abierto
│            │  │  │  │
│            │  │  │  └─ Cierra modal
│            │  │  │
│            │  │  └─ ERROR HANDLER
│            │  │     ├─ alert("Error al actualizar estado")
│            │  │     └─ Modo edición sigue activo
│            │  │
│            │  └─ Contacto en lista se actualiza con nuevo estado ✅
│            │
│            └─ FIN: Admin puede cambiar estado de otros contactos
│
└─ Estado sincronizado entre:
   ├─ Lista de contactos (local en componente)
   ├─ Modal de detalles
   ├─ Base de datos (MySQL)
   └─ Badge visual en interfaz
```

---

## Arquitectura de Carpetas

```
AutoVibes/
│
├── backend/
│   └── src/main/java/com/ventadeautos/
│       ├── model/
│       │   └── Contact.java
│       │       ├── @Entity @Table(name = "contactos")
│       │       ├── @Id @GeneratedValue Long id
│       │       ├── String nombre, email, dni, etc.
│       │       ├── @Column(nullable = false) String estado = "PENDIENTE"
│       │       ├── @ManyToOne(fetch = LAZY) Auto auto
│       │       └── @PrePersist/@PreUpdate → timestamps
│       │
│       ├── dto/
│       │   └── ContactRequest.java
│       │       ├── String nombre, email, dni, telefonoWhatsapp
│       │       ├── String asunto, mensaje
│       │       ├── String estado (para actualizaciones)
│       │       └── Integer autoId
│       │
│       ├── controller/
│       │   └── ContactController.java
│       │       ├── @PostMapping("/enviar") → crear
│       │       ├── @GetMapping("/admin/todos") → listar
│       │       └── @PutMapping("/admin/{id}/actualizar-estado") → actualizar
│       │
│       ├── service/
│       │   └── ContactService.java
│       │       ├── guardarContacto(request) → new Contact + setEstado("PENDIENTE")
│       │       ├── obtenerTodos() → List<Contact> findAll()
│       │       ├── actualizarEstado(id, estado) → validar + update
│       │       └── obtenerContactosPorEstado(estado) → findByEstado()
│       │
│       ├── repository/
│       │   └── ContactRepository.java
│       │       ├── extends JpaRepository<Contact, Long>
│       │       ├── List<Contact> findByEstado(String estado)
│       │       └── Spring genera SQL automáticamente
│       │
│       └── config/
│           └── CORSConfig.java
│               └── @CrossOrigin(origins = "http://localhost:4200")
│
├── frontend/
│   └── src/app/
│       ├── core/
│       │   └── services/
│       │       └── contact.service.ts
│       │           ├── interface ContactRequest {...}
│       │           ├── interface Contact {...}
│       │           ├── enviarContacto(data): Observable<Contact>
│       │           ├── obtenerContactos(): Observable<Contact[]>
│       │           ├── actualizarEstado(id, estado): Observable<Contact>
│       │           └── HTTP calls a backend
│       │
│       ├── features/
│       │   ├── autos/
│       │   │   └── auto-detail/
│       │   │       ├── auto-detail.ts
│       │   │       │   └── enviarContacto(): POST + WhatsApp
│       │   │       ├── auto-detail.html
│       │   │       │   └── Formulario + Botón WhatsApp
│       │   │       └── auto-detail.css
│       │   │
│       │   └── admin/
│       │       └── contact-list/
│       │           ├── contact-list.ts
│       │           │   ├── contactos: Contact[]
│       │           │   ├── editingStatus: {[id]: boolean}
│       │           │   ├── cargarContactos()
│       │           │   ├── iniciarEdicionEstado(contacto)
│       │           │   ├── guardarNuevoEstado(contacto)
│       │           │   ├── getEstadoBadgeClass(estado)
│       │           │   └── getImagenAuto(auto)
│       │           │
│       │           ├── contact-list.html
│       │           │   ├── Lista de contactos con *ngFor
│       │           │   ├── Modal con detalles
│       │           │   ├── Sección de auto (imagen + specs)
│       │           │   ├── Sección de estado (display/edit)
│       │           │   └── Dropdown para cambiar estado
│       │           │
│       │           └── contact-list.css
│       │               ├── .auto-info-card
│       │               ├── .badge-warning, .badge-info, etc.
│       │               ├── .estado-section
│       │               ├── .estado-edit (display: flex)
│       │               └── @media (max-width: 768px)
│       │
│       └── shared/
│           └── (componentes compartidos)
│
└── MySQL Database
    └── contactos table
        ├── id (BIGINT, PK)
        ├── nombre (VARCHAR 255)
        ├── email, dni, telefonoWhatsapp
        ├── asunto, mensaje
        ├── leído (BOOLEAN)
        ├── estado (VARCHAR 50) ← NUEVO
        ├── auto_id (BIGINT, FK) ← NUEVO
        ├── fechaCreacion, fechaActualizacion (TIMESTAMP)
        └── Índices en: estado, auto_id
```

---

## Validaciones por Capas

```
CLIENTE (Frontend)
  ↓
┌─────────────────────────────────────┐
│ 1. VALIDACIÓN DE FORMULARIO         │
│   ├─ Campos requeridos              │
│   ├─ Formato de email               │
│   ├─ Teléfono válido                │
│   └─ Mensaje no vacío               │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 2. VALIDACIÓN EN TRANSPORT          │
│   ├─ Headers CORS correctos         │
│   ├─ Content-Type: application/json │
│   └─ Conexión HTTPS (producción)    │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 3. VALIDACIÓN EN CONTROLLER         │
│   ├─ Request no null                │
│   ├─ PathVariable valido            │
│   └─ RequestBody válido             │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 4. VALIDACIÓN EN SERVICE            │
│   ├─ Estado en whitelist             │
│   ├─ Auto existe (si autoId)        │
│   ├─ Contacto existe (para update)  │
│   └─ DNI válido                     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 5. VALIDACIÓN EN DATABASE           │
│   ├─ Constraints NOT NULL           │
│   ├─ FK constraints                 │
│   ├─ Unique constraints             │
│   └─ Default values                 │
└─────────────────────────────────────┘
```

---

## Flujo de Estados

```
CICLO DE VIDA DE UN CONTACTO:

   1. CREACIÓN (Cliente)
      │
      └─→ Estado automático: PENDIENTE 🟨
          └─ Ready para admin review

   2. ADMIN REVISA
      │
      ├─→ SI interesado: EN_PROCESO 🔵
      │   └─ Se contacta con cliente
      │
      ├─→ SI compró: VENTA_FINALIZADA 🟢
      │   └─ Transacción completada
      │
      └─→ SI no interesado: CANCELADO 🔴
          └─ Fin del contacto

   Estados finales: VENTA_FINALIZADA o CANCELADO
   Estados activos: PENDIENTE o EN_PROCESO

   Transiciones posibles:
   ┌─────────────────────────────────────┐
   │ PENDIENTE ↓                         │
   │   ├─→ EN_PROCESO                    │
   │   ├─→ VENTA_FINALIZADA              │
   │   └─→ CANCELADO                     │
   │                                     │
   │ EN_PROCESO ↓                        │
   │   ├─→ VENTA_FINALIZADA              │
   │   └─→ CANCELADO                     │
   │                                     │
   │ VENTA_FINALIZADA = FINAL            │
   │ CANCELADO = FINAL                   │
   └─────────────────────────────────────┘
```

---

## Seguridad por Capas

```
┌──────────────────────────────────────────────────┐
│ ENTRADA                                          │
│ ├─ CORS whitelist: localhost:4200                │
│ ├─ Content-Type validation                       │
│ └─ Size limits en payloads                       │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ PROCESAMIENTO                                    │
│ ├─ Input validation en Controller                │
│ ├─ Business logic validation en Service          │
│ └─ Prepared statements (Hibernate)               │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ SALIDA                                           │
│ ├─ DTO response (no expone IDs internos)         │
│ ├─ Error messages amigables                      │
│ └─ Logging sin datos sensibles                   │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│ BASE DE DATOS                                    │
│ ├─ Constraints en tabla                          │
│ ├─ Foreign keys                                  │
│ ├─ Default values                                │
│ └─ Índices en campos searchables                 │
└──────────────────────────────────────────────────┘
```

---

Este documento muestra la arquitectura técnica completa del sistema.

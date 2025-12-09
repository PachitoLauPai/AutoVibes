# 🔧 Instrucciones Técnicas de Implementación

## 📋 Resumen de Cambios Técnicos

Esta guía detalla todos los cambios realizados al código del proyecto AutoVibes para implementar el sistema de gestión de contactos con estados.

---

## 1️⃣ Backend - Java/Spring Boot

### Cambio 1: Actualizar Modelo Contact.java

**Ubicación:** `backend/src/main/java/com/ventadeautos/backend/model/Contact.java`

**Agregar campo:**
```java
// Estado del contacto: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO
@Column(nullable = false)
private String estado = "PENDIENTE";
```

**Resultado:**
- Campo `estado` se crea en tabla `contactos` de BD
- Valor por defecto: "PENDIENTE"
- No nulo: siempre debe tener un valor

---

### Cambio 2: Actualizar DTO ContactRequest.java

**Ubicación:** `backend/src/main/java/com/ventadeautos/backend/dto/ContactRequest.java`

**Agregar campo:**
```java
private String estado;  // Para cambios de estado por admin
```

**Resultado:**
- Permite recibir estado en requests del admin
- Utilizado en endpoint de actualizar estado

---

### Cambio 3: Agregar Endpoint en ContactController.java

**Ubicación:** `backend/src/main/java/com/ventadeautos/backend/controller/ContactController.java`

**Agregar método:**
```java
@PutMapping("/admin/{id}/actualizar-estado")
public ResponseEntity<Contact> actualizarEstado(
    @PathVariable Long id, 
    @RequestBody ContactRequest request) {
    Contact contacto = contactService.actualizarEstado(id, request.getEstado());
    return ResponseEntity.ok(contacto);
}
```

**Resultado:**
- Nuevo endpoint: `PUT /api/contact/admin/{id}/actualizar-estado`
- Requiere: ID del contacto en URL + estado en body
- Retorna: Contacto actualizado

---

### Cambio 4: Agregar Métodos en ContactService.java

**Ubicación:** `backend/src/main/java/com/ventadeautos/backend/service/ContactService.java`

**Método 1: Actualizar Estado**
```java
public Contact actualizarEstado(Long id, String nuevoEstado) {
    log.info("Actualizando estado del contacto {} a: {}", id, nuevoEstado);
    Contact contact = obtenerContactoPorId(id);
    
    // Validación de estado
    if (!nuevoEstado.equals("PENDIENTE") && 
        !nuevoEstado.equals("EN_PROCESO") && 
        !nuevoEstado.equals("VENTA_FINALIZADA") && 
        !nuevoEstado.equals("CANCELADO")) {
        log.warn("Estado inválido: {}", nuevoEstado);
        throw new IllegalArgumentException(
            "Estado inválido. Use: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA o CANCELADO"
        );
    }
    
    contact.setEstado(nuevoEstado);
    return contactRepository.save(contact);
}
```

**Método 2: Obtener por Estado**
```java
public List<Contact> obtenerContactosPorEstado(String estado) {
    log.debug("Obteniendo contactos con estado: {}", estado);
    return contactRepository.findByEstado(estado);
}
```

**Resultado:**
- Valida que solo estados válidos se guarden
- Permite filtrar contactos por estado
- Registra todas las operaciones en logs

---

### Cambio 5: Agregar Query en ContactRepository.java

**Ubicación:** `backend/src/main/java/com/ventadeautos/backend/repository/ContactRepository.java`

**Agregar método:**
```java
// Obtener contactos por estado
List<Contact> findByEstado(String estado);
```

**Resultado:**
- Spring Data JPA genera automáticamente la query SQL
- Equivalente a: `SELECT * FROM contactos WHERE estado = ?`

---

## 2️⃣ Frontend - Angular/TypeScript

### Cambio 1: Actualizar ContactService

**Ubicación:** `frontend/src/app/core/services/contact.service.ts`

**Actualizar interfaces:**
```typescript
export interface ContactRequest {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  autoId?: number;
  dni?: string;                    // ← NUEVO
  estado?: string;                  // ← NUEVO
}

export interface Contact {
  id?: number;
  nombre: string;
  correo?: string;                  // ← Se aceptan ambos
  email?: string;                   // ← O email
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;                  // ← NUEVO
  fechaCreacion?: Date;
  leido?: boolean;
  dni?: string;                     // ← NUEVO
  auto?: any;                       // ← NUEVO: Objeto Auto
}
```

**Agregar método:**
```typescript
actualizarEstado(id: number, nuevoEstado: string): Observable<Contact> {
    const request: ContactRequest = { 
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        estado: nuevoEstado 
    };
    
    return this.http.put<Contact>(
        `${this.apiUrl}/admin/${id}/actualizar-estado`, 
        request
    ).pipe(
        tap((response) => {
            console.log('Estado del contacto actualizado:', response);
        }),
        catchError(error => {
            console.error('Error actualizando estado:', error);
            return throwError(() => error);
        })
    );
}
```

**Resultado:**
- Permite cambiar estado desde frontend
- Comunicación HTTP con backend
- Manejo de errores centralizado

---

### Cambio 2: Actualizar auto-detail.ts

**Ubicación:** `frontend/src/app/features/autos/auto-detail/auto-detail.ts`

**Modificar método enviarContacto():**

Antes:
```typescript
// Redirigir a WhatsApp directamente
window.open(whatsappUrl, '_blank');
```

Después:
```typescript
// 1. Preparar datos para guardar en BD
const contactoParaGuardar = {
  nombre: this.contactData.nombre,
  dni: this.contactData.dni,
  email: this.contactData.email,
  telefono: '+51' + telefonoSinFormato,
  asunto: this.contactData.asunto,
  mensaje: this.contactData.mensaje,
  autoId: this.contactData.autoId
};

// 2. Guardar en BD
this.contactService.enviarContacto(contactoParaGuardar).subscribe({
  next: (response) => {
    // 3. Después de guardar, abrir WhatsApp
    const numeroAsesor = '51928770187';
    const mensaje = encodeURIComponent(/* ... */);
    const whatsappUrl = `https://wa.me/${numeroAsesor}?text=${mensaje}`;
    window.open(whatsappUrl, '_blank');
    
    alert('Contacto guardado. ¡Seremos contactados vía WhatsApp pronto!');
    this.closeContactModal();
  },
  error: (error) => {
    alert('Error al guardar el contacto. Por favor, intenta de nuevo.');
  }
});
```

**Resultado:**
- Contacto se guarda ANTES de abrir WhatsApp
- Se mantiene experiencia de usuario
- Mensajes de feedback claros

---

### Cambio 3: Actualizar contact-list.ts

**Ubicación:** `frontend/src/app/features/admin/contact-list/contact-list.ts`

**Agregar interfaces:**
```typescript
interface Auto {
  id?: number;
  marca?: { nombre: string };
  modelo: string;
  anio: number;
  precio: number;
  color: string;
  combustible?: { nombre: string };
  transmision?: { nombre: string };
  categoria?: { nombre: string };
  condicion?: { nombre: string };
  imagenes?: string[];
}

interface Contact {
  id?: number;
  nombre: string;
  correo?: string;
  email?: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  estado?: string;              // ← NUEVO
  fechaCreacion?: Date;
  leido?: boolean;
  dni?: string;                 // ← NUEVO
  auto?: Auto;                  // ← NUEVO
}
```

**Agregar propiedades a clase:**
```typescript
export class ContactListComponent implements OnInit {
  contactos: Contact[] = [];
  loading = true;
  error = '';
  // ... propiedades existentes ...
  
  editingStatus: { [key: number]: boolean } = {};  // ← NUEVO
  newStatus: { [key: number]: string } = {};       // ← NUEVO
}
```

**Agregar métodos:**
```typescript
// Iniciar edición de estado
iniciarEdicionEstado(contacto: Contact): void {
  if (!contacto.id) return;
  this.editingStatus[contacto.id] = true;
  this.newStatus[contacto.id] = contacto.estado || 'PENDIENTE';
}

// Cancelar edición
cancelarEdicionEstado(contactoId: number): void {
  this.editingStatus[contactoId] = false;
}

// Guardar nuevo estado
guardarNuevoEstado(contacto: Contact): void {
  if (!contacto.id) return;
  
  const nuevoEstado = this.newStatus[contacto.id];
  
  this.contactService.actualizarEstado(contacto.id, nuevoEstado).subscribe({
    next: (contactoActualizado) => {
      contacto.estado = contactoActualizado.estado;
      this.editingStatus[contacto.id!] = false;
      console.log('Estado actualizado exitosamente');
    },
    error: (err) => {
      console.error('Error:', err);
      alert('Error al actualizar el estado');
    }
  });
}

// Obtener clase CSS según estado
getEstadoBadgeClass(estado: string | undefined): string {
  switch (estado) {
    case 'PENDIENTE': return 'badge-warning';
    case 'EN_PROCESO': return 'badge-info';
    case 'VENTA_FINALIZADA': return 'badge-success';
    case 'CANCELADO': return 'badge-danger';
    default: return 'badge-secondary';
  }
}

// Obtener etiqueta legible del estado
getEstadoLabel(estado: string | undefined): string {
  switch (estado) {
    case 'PENDIENTE': return 'Pendiente';
    case 'EN_PROCESO': return 'En Proceso';
    case 'VENTA_FINALIZADA': return 'Venta Finalizada';
    case 'CANCELADO': return 'Cancelado';
    default: return 'Desconocido';
  }
}

// Obtener imagen del auto
getImagenAuto(auto: Auto | undefined): string {
  if (!auto) return this.getPlaceholder();
  if (auto.imagenes && auto.imagenes.length > 0) {
    return auto.imagenes[0];
  }
  return this.getPlaceholder();
}

private getPlaceholder(): string {
  return 'https://via.placeholder.com/300x200?text=Sin+imagen';
}
```

**Resultado:**
- Gestión completa de edición de estados
- Mapeo de estados a colores
- Obtención segura de imágenes

---

### Cambio 4: Actualizar contact-list.html

**Ubicación:** `frontend/src/app/features/admin/contact-list/contact-list.html`

**En tarjetas de contacto, agregar:**
```html
<!-- Auto Info Card if exists -->
<div *ngIf="contacto.auto" class="auto-info-card">
  <h4>Vehículo de Interés</h4>
  <div class="auto-detail-mini">
    <div class="auto-image-mini">
      <img [src]="getImagenAuto(contacto.auto)" [alt]="contacto.auto.modelo" class="auto-img-small">
    </div>
    <div class="auto-specs-mini">
      <div><strong>{{ contacto.auto.marca?.nombre }} {{ contacto.auto.modelo }}</strong></div>
      <div>Año: {{ contacto.auto.anio }}</div>
      <div>Color: {{ contacto.auto.color }}</div>
      <div>Precio: US$ {{ (contacto.auto.precio | number:'1.2-2') }}</div>
    </div>
  </div>
</div>
```

**En modal de detalles, agregar sección de estado:**
```html
<div class="detail-section estado-section">
  <h3>Estado del Contacto</h3>
  <div class="estado-control">
    <!-- Mostrar estado actual -->
    <div *ngIf="!editingStatus[selectedContact.id!]" class="estado-display">
      <span [ngClass]="'badge ' + getEstadoBadgeClass(selectedContact.estado)">
        {{ getEstadoLabel(selectedContact.estado) }}
      </span>
      <button (click)="iniciarEdicionEstado(selectedContact)" class="btn-edit-estado">
        <svg><!-- icono --></svg>
        Cambiar Estado
      </button>
    </div>
    
    <!-- Modo edición -->
    <div *ngIf="editingStatus[selectedContact.id!]" class="estado-edit">
      <select [(ngModel)]="newStatus[selectedContact.id!]" class="estado-select">
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN_PROCESO">En Proceso</option>
        <option value="VENTA_FINALIZADA">Venta Finalizada</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <button (click)="guardarNuevoEstado(selectedContact)" class="btn-save-estado">
        Guardar
      </button>
      <button (click)="cancelarEdicionEstado(selectedContact.id!)" class="btn-cancel-estado">
        Cancelar
      </button>
    </div>
  </div>
</div>
```

**Agregar sección de auto en modal:**
```html
<div *ngIf="selectedContact.auto" class="detail-section auto-section">
  <h3>Vehículo de Interés</h3>
  <div class="auto-detail-full">
    <div class="auto-image-section">
      <img [src]="getImagenAuto(selectedContact.auto)" class="auto-img-detail">
    </div>
    <div class="auto-specs-section">
      <div class="spec-row">
        <span class="spec-label">Marca:</span>
        <span class="spec-value">{{ selectedContact.auto.marca?.nombre }}</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Modelo:</span>
        <span class="spec-value">{{ selectedContact.auto.modelo }}</span>
      </div>
      <!-- ... más especificaciones ... -->
    </div>
  </div>
</div>
```

**Resultado:**
- UI completa para gestión de estados
- Visualización de datos del auto
- Interfaz responsiva

---

### Cambio 5: Actualizar contact-list.css

**Ubicación:** `frontend/src/app/features/admin/contact-list/contact-list.css`

**Agregar estilos al final:**
```css
/* Auto Info Card */
.auto-info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border-left: 4px solid #667eea;
}

/* Estado Section */
.estado-section {
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
  border-left: 4px solid #667eea;
}

.estado-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.estado-edit {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.estado-select {
  padding: 0.6rem 0.8rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  background: white;
}

.btn-edit-estado,
.btn-save-estado,
.btn-cancel-estado {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-edit-estado {
  background: #667eea;
  color: white;
}

.btn-edit-estado:hover {
  background: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-save-estado {
  background: #28a745;
  color: white;
}

.btn-save-estado:hover {
  background: #218838;
}

.btn-cancel-estado {
  background: #6c757d;
  color: white;
}

/* Badges por estado */
.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.badge-danger {
  background-color: #f8d7da;
  color: #721c24;
}
```

**Resultado:**
- Estilos visuales para UI de estados
- Colores consistentes con estados
- Respuesta adaptada para móviles

---

## 3️⃣ Base de Datos

### Cambio: Migración Automática de Hibernate

**Configuración en:** `backend/src/main/resources/application.properties`

**Propiedad existente:**
```properties
spring.jpa.hibernate.ddl-auto=create
```

**Efecto:**
- Al iniciar la aplicación, Hibernate lee el modelo `Contact.java`
- Detecta el nuevo campo `estado`
- Crea la columna automáticamente en la tabla `contactos`
- Tipo: VARCHAR, Default: "PENDIENTE"

**Query SQL equivalente generada automáticamente:**
```sql
ALTER TABLE contactos ADD COLUMN estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE';
```

---

## 4️⃣ Flujo de Datos

### Diagrama de Operación

```
┌─────────────────────────────────────┐
│     CLIENTE (Frontend)              │
│  1. Llena formulario de contacto    │
│  2. Presiona "Contactar por WSP"    │
└─────────────┬───────────────────────┘
              │
              ├──→ [POST] /api/contact/enviar
              │    - Guarda en BD
              │    - Estado: PENDIENTE
              │    - Auto: Asociado
              │
              └──→ [Abre WhatsApp]
                   - Mensaje pre-completo
                   - Datos del cliente

┌─────────────────────────────────────┐
│  BASE DE DATOS (MySQL)              │
│  Tabla: contactos                   │
│  - Nuevo registro guardado          │
│  - Estado: PENDIENTE (default)      │
│  - Auto_id: Asociado                │
└─────────────┬───────────────────────┘
              │
              ├────────────────────────────┐
              │                            │
┌─────────────▼──────────┐    ┌──────────▼────────────┐
│  ADMIN (Frontend)      │    │  API (Backend)        │
│  Ver contactos         │    │  - GET /admin/todos   │
│  Ver detalles          │    │  - Data completa      │
│  Cambiar estado        │    │  - Auto incluida      │
│  (PENDIENTE → ...)     │    │                       │
└─────────────┬──────────┘    └──────────┬────────────┘
              │                           │
              └───────┬───────────────────┘
                      │
              [PUT] /admin/{id}/actualizar-estado
              - Nuevo estado: EN_PROCESO
              - Valida en backend
              - Guarda en BD
              - Retorna contacto actualizado
              │
              └──→ Frontend actualiza UI
                   - Badge cambia de color
                   - Estado se refleja
```

---

## 5️⃣ Validaciones Implementadas

### Backend (Java)
```java
// 1. Validar estado válido
if (!nuevoEstado.equals("PENDIENTE") && ...) {
    throw new IllegalArgumentException("Estado inválido");
}

// 2. Validar contacto existe
Contact contact = obtenerContactoPorId(id); // Lanza exception si no existe

// 3. Validar auto existe (al guardar contacto)
if (request.getAutoId() != null) {
    Auto auto = autoRepository.findById(...)
        .orElseThrow(() -> new ResourceNotFoundException("Auto", id));
}
```

### Frontend (TypeScript)
```typescript
// 1. Validar teléfono
const telefonoSinFormato = this.contactData.telefono.replace(/\D/g, '');
if (telefonoSinFormato.length !== 9 || !telefonoSinFormato.startsWith('9')) {
    alert('Teléfono inválido');
    return;
}

// 2. Validar formulario completo
if (!this.isFormValid()) {
    alert('Por favor complete todos los campos');
    return;
}

// 3. Manejo de errores HTTP
.subscribe({
    next: (response) => { /* éxito */ },
    error: (err) => { alert('Error: ' + err.message); }
});
```

---

## 6️⃣ Consideraciones Importantes

### 1. **Relación con Auto**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "auto_id")
private Auto auto;
```
- La relación es **opcional** (puede ser null)
- `LAZY` loading para mejor rendimiento
- `@JoinColumn` especifica nombre de FK

### 2. **Estados como Enum**
Alternativa recomendada para futuros cambios:
```java
@Enumerated(EnumType.STRING)
private EstadoContacto estado;

enum EstadoContacto {
    PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO
}
```

### 3. **Timestamps automáticos**
```java
@PrePersist
protected void onCreate() {
    fechaCreacion = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    if (respondido && fechaRespuesta == null) {
        fechaRespuesta = LocalDateTime.now();
    }
}
```

### 4. **Logs para debugging**
```java
@Slf4j  // Lombok para logger
log.info("Contacto guardado: {}", contactoGuardado.getId());
log.debug("Auto asociado: {}", request.getAutoId());
log.warn("Estado inválido: {}", nuevoEstado);
log.error("Contacto no encontrado: {}", id);
```

---

## 7️⃣ Testing de Integración

### Prueba en Postman/Insomnia

**1. Crear Contacto:**
```
POST http://localhost:8080/api/contact/enviar
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "email": "juan@test.com",
  "telefono": "987654321",
  "asunto": "Sobre Toyota Corolla",
  "mensaje": "¿Qué promociones tienen?",
  "autoId": 1
}
```

**2. Obtener Contactos:**
```
GET http://localhost:8080/api/contact/admin/todos
```

**3. Actualizar Estado:**
```
PUT http://localhost:8080/api/contact/admin/1/actualizar-estado
Content-Type: application/json

{
  "estado": "EN_PROCESO"
}
```

---

## 8️⃣ Optimizaciones Posibles

1. **Caché de Estados**
   ```java
   @Cacheable("estadosContacto")
   public List<Contact> obtenerContactosPorEstado(String estado)
   ```

2. **Paginación**
   ```java
   public Page<Contact> obtenerTodosLosContactos(Pageable pageable)
   ```

3. **Búsqueda Avanzada**
   ```java
   public Page<Contact> buscar(
       String nombre, String estado, LocalDate fechaDesde, Pageable pageable)
   ```

4. **Event Listener**
   ```java
   @Component
   public class ContactoListener {
       @EventListener
       public void onContactoCreado(ContactoCreatedEvent event) {
           // Enviar email, notificación, etc.
       }
   }
   ```

---

**¡Implementación completada exitosamente!** ✅

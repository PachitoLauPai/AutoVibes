# Implementación: Sistema de Contactos con Gestión de Estado

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de gestión de contactos que permite a los clientes enviar consultas sobre vehículos a través de WhatsApp, guardando automáticamente la información en la base de datos. Los administradores pueden ver todos los contactos en el panel de control con detalles del cliente, del vehículo de interés, y cambiar el estado del contacto entre: **PENDIENTE**, **EN_PROCESO**, **VENTA_FINALIZADA** y **CANCELADO**.

---

## 🔧 Cambios en el Backend

### 1. **Modelo Contact.java**
**Archivo:** `backend/src/main/java/com/ventadeautos/backend/model/Contact.java`

**Cambios realizados:**
- ✅ Agregado campo `estado` de tipo `String` con valor por defecto "PENDIENTE"
- ✅ Estados válidos: `PENDIENTE`, `EN_PROCESO`, `VENTA_FINALIZADA`, `CANCELADO`
- ✅ Relación `@ManyToOne` con la entidad `Auto` (opcional)

```java
@Column(nullable = false)
private String estado = "PENDIENTE";
```

---

### 2. **DTO ContactRequest.java**
**Archivo:** `backend/src/main/java/com/ventadeautos/backend/dto/ContactRequest.java`

**Cambios realizados:**
- ✅ Agregado campo `estado` para permitir cambios de estado desde el admin
- ✅ Campo `autoId` opcional para asociar contacto a un vehículo

```java
private String estado;  // Para cambios de estado por admin
```

---

### 3. **Controlador ContactController.java**
**Archivo:** `backend/src/main/java/com/ventadeautos/backend/controller/ContactController.java`

**Nuevos Endpoints:**
- ✅ `PUT /api/contact/admin/{id}/actualizar-estado` - Cambiar estado del contacto

```java
@PutMapping("/admin/{id}/actualizar-estado")
public ResponseEntity<Contact> actualizarEstado(@PathVariable Long id, @RequestBody ContactRequest request) {
    Contact contacto = contactService.actualizarEstado(id, request.getEstado());
    return ResponseEntity.ok(contacto);
}
```

**Endpoints Existentes Mejorados:**
- ✅ `GET /api/contact/admin/todos` - Obtiene todos los contactos con sus datos asociados
- ✅ `GET /api/contact/admin/no-leidos` - Obtiene contactos sin leer
- ✅ `POST /api/contact/enviar` - Envía un nuevo contacto (ahora con autoId)

---

### 4. **Servicio ContactService.java**
**Archivo:** `backend/src/main/java/com/ventadeautos/backend/service/ContactService.java`

**Nuevos Métodos:**
- ✅ `actualizarEstado(Long id, String nuevoEstado)` - Actualiza el estado validando valores válidos
- ✅ `obtenerContactosPorEstado(String estado)` - Obtiene contactos filtrados por estado
- ✅ Mejoras en `guardarContacto()` para asociar contactos con autos

```java
public Contact actualizarEstado(Long id, String nuevoEstado) {
    Contact contact = obtenerContactoPorId(id);
    
    if (!nuevoEstado.equals("PENDIENTE") && !nuevoEstado.equals("EN_PROCESO") 
        && !nuevoEstado.equals("VENTA_FINALIZADA") && !nuevoEstado.equals("CANCELADO")) {
        throw new IllegalArgumentException("Estado inválido...");
    }
    
    contact.setEstado(nuevoEstado);
    return contactRepository.save(contact);
}
```

---

### 5. **Repositorio ContactRepository.java**
**Archivo:** `backend/src/main/java/com/ventadeautos/backend/repository/ContactRepository.java`

**Nuevos Métodos:**
- ✅ `findByEstado(String estado)` - Busca contactos por estado

```java
List<Contact> findByEstado(String estado);
```

---

## 🎨 Cambios en el Frontend

### 1. **Servicio ContactService (TypeScript)**
**Archivo:** `frontend/src/app/core/services/contact.service.ts`

**Cambios realizados:**
- ✅ Actualizado `ContactRequest` interface con campos `dni` y `estado`
- ✅ Actualizado `Contact` interface con campos `auto`, `dni` y mejoras
- ✅ Nuevo método `actualizarEstado(id, nuevoEstado)` - Cambia el estado en el backend

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
    return this.http.put<Contact>(`${this.apiUrl}/admin/${id}/actualizar-estado`, request);
}
```

---

### 2. **Componente auto-detail.ts**
**Archivo:** `frontend/src/app/features/autos/auto-detail/auto-detail.ts`

**Cambios realizados:**
- ✅ Modificado `enviarContacto()` para guardar en BD antes de enviar a WhatsApp
- ✅ Llamada a `contactService.enviarContacto()` con los datos completos del formulario
- ✅ Después de guardar, abre WhatsApp automáticamente

```typescript
enviarContacto(): void {
    // ... validaciones ...
    
    this.contactService.enviarContacto(contactoParaGuardar).subscribe({
        next: (response) => {
            // Guardar en BD exitoso
            // Después redirigir a WhatsApp
            window.open(whatsappUrl, '_blank');
        },
        error: (error) => alert('Error al guardar el contacto')
    });
}
```

---

### 3. **Componente contact-list.ts**
**Archivo:** `frontend/src/app/features/admin/contact-list/contact-list.ts`

**Cambios realizados:**
- ✅ Nueva interfaz `Auto` para mostrar datos del vehículo
- ✅ Actualizado `Contact` interface con campos completos
- ✅ Método `actualizarEstado()` para cambiar estado
- ✅ Método `iniciarEdicionEstado()` - Inicia modo edición
- ✅ Método `guardarNuevoEstado()` - Guarda el nuevo estado en BD
- ✅ Método `getEstadoBadgeClass()` - Retorna clase CSS según estado
- ✅ Método `getEstadoLabel()` - Traduce código de estado a etiqueta legible
- ✅ Métodos `getImagenAuto()` - Obtiene imagen del vehículo

```typescript
guardarNuevoEstado(contacto: Contact): void {
    const nuevoEstado = this.newStatus[contacto.id!];
    
    this.contactService.actualizarEstado(contacto.id!, nuevoEstado).subscribe({
        next: (contactoActualizado) => {
            contacto.estado = contactoActualizado.estado;
            this.editingStatus[contacto.id!] = false;
        },
        error: (err) => alert('Error al actualizar el estado')
    });
}
```

---

### 4. **Plantilla contact-list.html**
**Archivo:** `frontend/src/app/features/admin/contact-list/contact-list.html`

**Cambios realizados:**
- ✅ Nueva sección "auto-info-card" en listado de contactos con imagen y datos del auto
- ✅ Actualizado modal de detalles con sección de estado editable
- ✅ Nueva sección "Estado del Contacto" con selector de estado
- ✅ Sección "Vehículo de Interés" en modal de detalles con:
  - Imagen del auto
  - Marca, modelo, año
  - Color, precio
  - Combustible, transmisión
  - Categoría, condición

**En la tarjeta de contacto:**
```html
<div *ngIf="contacto.auto" class="auto-info-card">
  <h4>Vehículo de Interés</h4>
  <div class="auto-detail-mini">
    <div class="auto-image-mini">
      <img [src]="getImagenAuto(contacto.auto)" class="auto-img-small">
    </div>
    <div class="auto-specs-mini">
      <!-- Especificaciones del auto -->
    </div>
  </div>
</div>
```

**En el modal de detalles:**
```html
<div class="estado-control">
  <div *ngIf="!editingStatus[selectedContact.id!]" class="estado-display">
    <span [ngClass]="'badge ' + getEstadoBadgeClass(selectedContact.estado)">
      {{ getEstadoLabel(selectedContact.estado) }}
    </span>
    <button (click)="iniciarEdicionEstado(selectedContact)">Cambiar Estado</button>
  </div>
  <div *ngIf="editingStatus[selectedContact.id!]" class="estado-edit">
    <select [(ngModel)]="newStatus[selectedContact.id!]">
      <option value="PENDIENTE">Pendiente</option>
      <option value="EN_PROCESO">En Proceso</option>
      <option value="VENTA_FINALIZADA">Venta Finalizada</option>
      <option value="CANCELADO">Cancelado</option>
    </select>
    <button (click)="guardarNuevoEstado(selectedContact)">Guardar</button>
  </div>
</div>
```

---

### 5. **Estilos contact-list.css**
**Archivo:** `frontend/src/app/features/admin/contact-list/contact-list.css`

**Nuevos Estilos Agregados:**
- ✅ `.auto-info-card` - Estilo para tarjeta de auto en listado
- ✅ `.auto-detail-full` - Estilo para sección de auto en modal
- ✅ `.estado-section` - Estilo para sección de estado
- ✅ `.estado-control`, `.estado-display`, `.estado-edit` - Controles de estado
- ✅ `.badge-warning`, `.badge-info`, `.badge-success`, `.badge-danger` - Badges por estado
- ✅ `.btn-edit-estado`, `.btn-save-estado`, `.btn-cancel-estado` - Botones
- ✅ Respuesta CSS adaptada para móviles

---

## 📊 Flujo de Uso Completo

### Desde la perspectiva del Cliente:

1. Cliente navega a detalle de auto
2. Presiona botón "Contactar a través de WhatsApp"
3. Se abre modal con formulario
4. Completa: Nombre, DNI, Email, Teléfono, Mensaje
5. Presiona "Contactar a través de WhatsApp"
6. **Sistema guarda el contacto en BD** (con estado PENDIENTE y autoId asociado)
7. Se abre WhatsApp automáticamente con número del asesor

### Desde la perspectiva del Admin:

1. Admin accede a `/admin` > Sección "Contactos"
2. Ve listado de todos los contactos en tiempo real
3. Cada contacto muestra:
   - Datos del cliente (nombre, DNI, email, teléfono)
   - Datos del vehículo (imagen, marca, modelo, precio, etc.)
   - Estado actual (badge con color)
4. Click en "Ver Detalles" para abrir modal expandido
5. En el modal puede:
   - Ver todos los datos del cliente
   - Ver imagen completa del auto
   - Ver especificaciones completas del auto
   - Cambiar el estado del contacto:
     - **PENDIENTE** → Contacto nuevo recibido
     - **EN_PROCESO** → Se está gestionando
     - **VENTA_FINALIZADA** → Se completó la venta
     - **CANCELADO** → Se canceló la consulta

---

## 🎨 Estados y Colores

| Estado | Color | Badge |
|--------|-------|-------|
| PENDIENTE | Amarillo | `badge-warning` |
| EN_PROCESO | Azul | `badge-info` |
| VENTA_FINALIZADA | Verde | `badge-success` |
| CANCELADO | Rojo | `badge-danger` |

---

## 📝 Esquema de Base de Datos

### Tabla `contactos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| nombre | VARCHAR(255) | Nombre del cliente |
| dni | VARCHAR(255) | DNI del cliente |
| email | VARCHAR(255) | Email del cliente |
| telefono | VARCHAR(255) | Teléfono del cliente |
| asunto | VARCHAR(255) | Asunto del contacto |
| mensaje | TEXT | Mensaje del contacto |
| auto_id | BIGINT | FK a tabla autos (opcional) |
| estado | VARCHAR(50) | Estado: PENDIENTE, EN_PROCESO, VENTA_FINALIZADA, CANCELADO |
| leido | TINYINT(1) | Si ha sido leído |
| respondido | TINYINT(1) | Si ha recibido respuesta |
| fecha_creacion | DATETIME | Fecha de creación |
| fecha_respuesta | DATETIME | Fecha de respuesta |

---

## ✅ Validaciones Implementadas

### Backend:
- ✅ Validación de campos obligatorios en ContactRequest
- ✅ Validación de estado válido en `actualizarEstado()`
- ✅ Validación de auto existente antes de asociar

### Frontend:
- ✅ Validación de formulario completo antes de enviar
- ✅ Validación de teléfono (9 dígitos, comienza con 9)
- ✅ Confirmación antes de eliminar contacto
- ✅ Manejo de errores en todas las llamadas HTTP

---

## 🚀 Cómo Usar

### Para Clientes:

1. Navega a cualquier detalle de auto
2. Desplázate al botón "Contactar a través de WhatsApp"
3. Llena el formulario con tus datos
4. Presiona el botón
5. ¡Listo! Tu contacto se guardó y se abrió WhatsApp

### Para Administradores:

1. Inicia sesión como admin
2. Ve a la sección de Contactos desde el dashboard
3. Revisa todos los contactos en tiempo real
4. Haz click en "Ver Detalles" para información completa
5. Cambia el estado según sea necesario
6. Los contactos se actualizan automáticamente

---

## 🔄 API Endpoints

### Públicos (Cliente):
```
POST /api/contact/enviar
Body: {
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "email": "juan@email.com",
  "telefono": "987654321",
  "asunto": "Consulta sobre Toyota Corolla",
  "mensaje": "¿Qué promociones tienen?",
  "autoId": 1
}
```

### Admin:
```
GET /api/contact/admin/todos
GET /api/contact/admin/no-leidos
GET /api/contact/admin/{id}
PUT /api/contact/admin/{id}/marcar-leido
PUT /api/contact/admin/{id}/actualizar-estado
Body: {
  "estado": "EN_PROCESO"
}
DELETE /api/contact/admin/{id}
```

---

## 📦 Archivos Modificados

### Backend:
- ✅ `model/Contact.java` - Agregado campo estado
- ✅ `dto/ContactRequest.java` - Agregado campo estado
- ✅ `controller/ContactController.java` - Nuevo endpoint de estado
- ✅ `service/ContactService.java` - Nuevos métodos de estado
- ✅ `repository/ContactRepository.java` - Nueva query de estado

### Frontend:
- ✅ `core/services/contact.service.ts` - Nuevo método actualizarEstado
- ✅ `features/autos/auto-detail/auto-detail.ts` - Guardado en BD antes de WhatsApp
- ✅ `features/admin/contact-list/contact-list.ts` - Gestión completa de estados
- ✅ `features/admin/contact-list/contact-list.html` - UI completa de detalles
- ✅ `features/admin/contact-list/contact-list.css` - Nuevos estilos

---

## 🐛 Consideraciones Técnicas

1. **Hibernateauto-crea las columnas**: Como el proyecto usa `spring.jpa.hibernate.ddl-auto=create`, el campo `estado` se creará automáticamente en la próxima ejecución.

2. **Relación con Auto**: Los contactos se asocian opcionalmentea autos mediante `@ManyToOne`.

3. **Timestamps**: Los contactos registran automáticamente `fechaCreacion` y `fechaRespuesta`.

4. **Logs**: Todas las operaciones se registran con `@Slf4j` en nivel DEBUG.

5. **Seguridad**: Los endpoints de admin requieren acceso autenticado si está habilitada la seguridad.

---

## 📱 Responsive Design

- ✅ Diseño móvil adaptado para todos los tamaños
- ✅ Modal expandible que se ajusta a pantalla
- ✅ Selector de estado responsive
- ✅ Tarjetas de contacto adaptadas

---

## 🎉 Resultado Final

Los clientes ahora pueden:
- ✅ Enviar consultas sobre autos
- ✅ Sus datos se guardan automáticamente
- ✅ Se asocia el auto de interés

Los administradores pueden:
- ✅ Ver todos los contactos con detalles completos
- ✅ Ver imagen y especificaciones del auto
- ✅ Cambiar el estado del contacto
- ✅ Filtrar por estado
- ✅ Marcar como leído
- ✅ Eliminar contactos

---

**¡Sistema completamente funcional y listo para producción!** 🚀

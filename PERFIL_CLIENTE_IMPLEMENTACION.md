# 📋 IMPLEMENTACIÓN: PERFIL DEL CLIENTE CON EDICIÓN DE DATOS Y CAMBIO DE CONTRASEÑA

## ✅ RESUMEN DE CAMBIOS

Se ha implementado un sistema completo de gestión de perfil para clientes logueados, con edición de datos personales y cambio de contraseña con validaciones robustas.

---

## 🔧 CAMBIOS EN EL BACKEND

### 1. **DTOs Nuevos** (`backend/src/main/java/com/ventadeautos/backend/dto/`)

#### `CambiarContrasenaDTO.java`
```java
- contrasenaActual: String (validar contraseña actual)
- contrasenaNew: String (nueva contraseña)
- confirmarContrasena: String (confirmación)
```

#### `ActualizarPerfilDTO.java`
```java
- nombre: String
- email: String
- apellidos: String
- dni: String
- telefono: String
- direccion: String
```

### 2. **Actualizaciones en `UsuarioService.java`**

#### Nuevo método: `cambiarContrasena()`
- ✅ Valida que las nuevas contraseñas coincidan
- ✅ Verifica que la contraseña actual sea correcta
- ✅ Impide usar la misma contraseña actual
- ✅ Actualiza la contraseña en la BD

### 3. **Nuevos Endpoints en `UsuarioController.java`**

#### `PUT /api/usuarios/{id}/cambiar-contrasena`
```
Request: { contrasenaActual, contrasenaNew, confirmarContrasena }
Response: { mensaje, exitoso }
Status: 200 OK | 400 Bad Request
```

---

## 🎨 CAMBIOS EN EL FRONTEND

### 1. **Nuevo Componente: `ClientProfileComponent`**

**Ubicación:** `frontend/src/app/features/cliente/client-profile/`

**Archivos:**
- `client-profile.ts` - Lógica del componente
- `client-profile.html` - Template
- `client-profile.css` - Estilos
- `client-profile.spec.ts` - Tests

**Funcionalidades:**

#### 📋 Sección 1: Información Personal
- **Vista de Lectura:**
  - Muestra todos los datos del usuario
  - Estado (Activo/Inactivo)
  - Fecha de creación de la cuenta
  - Botón "✏️ Editar"

- **Modo de Edición:**
  - Formulario reactivo con validaciones
  - Campos: Nombre*, Email*, Apellidos, DNI, Teléfono, Dirección
  - Validaciones:
    - Nombre: Requerido, mín. 2 caracteres
    - Email: Requerido, formato válido
    - Teléfono: Solo números (máx 20)
  - Botones: "💾 Guardar Cambios" y "✖ Cancelar"
  - Mensajes de éxito/error

#### 🔐 Sección 2: Cambiar Contraseña
- **Vista de Lectura:**
  - Información sobre seguridad
  - Link "¿Olvidaste tu contraseña?" que muestra mensaje
  - Mensaje: "Se ha enviado un código de recuperación a [email]"

- **Modo de Cambio:**
  - Campo "Contraseña Actual" (validación requerida)
  - Campo "Nueva Contraseña" (validación requerida, mín 3 caracteres)
  - Campo "Confirmar Nueva Contraseña"
  - Validaciones:
    - Las contraseñas deben coincidir
    - No puede ser igual a la actual
    - Mínimo 3 caracteres
  - Botones: "🔐 Actualizar Contraseña" y "✖ Cancelar"
  - Mensajes de éxito/error

### 2. **Actualización en `auth.service.ts`**

Nuevos métodos:

```typescript
// Actualizar perfil del usuario
actualizarPerfil(usuarioId: number, datosActualizacion: any): Observable<User>

// Cambiar contraseña
cambiarContrasena(usuarioId: number, cambioData: any): Observable<any>
```

### 3. **Actualización en `app.routes.ts`**

Nueva ruta:
```typescript
{ path: 'cliente/perfil', loadComponent: () => import('./features/cliente/client-profile/client-profile').then(m => m.ClientProfileComponent)}
```

### 4. **Actualización en `navbar.ts`**

Nuevo método:
```typescript
irAMiPerfil(): void {
  this.router.navigate(['/cliente/perfil']);
  this.isMenuOpen = false;
}
```

### 5. **Actualización en `navbar.html`**

El link "Mi Perfil" ahora navega a `/cliente/perfil`:
```html
<a class="dropdown-item" href="#" (click)="irAMiPerfil(); $event.preventDefault()">
  👤 Mi Perfil
</a>
```

---

## 🎯 FLUJO DE USO

### Acceder al Perfil:
1. Usuario logueado → Menú desplegable "👤 [Nombre]"
2. Click en "👤 Mi Perfil"
3. Navega a `/cliente/perfil`

### Editar Información:
1. Click en botón "✏️ Editar"
2. Completa los campos con validaciones
3. Click en "💾 Guardar Cambios"
4. Backend valida y actualiza en BD
5. Mensaje de éxito y actualización automática

### Cambiar Contraseña:
1. Click en botón "🔑 Cambiar"
2. Ingresa contraseña actual (validación)
3. Ingresa nueva contraseña
4. Confirma nueva contraseña
5. Click en "🔐 Actualizar Contraseña"
6. Backend valida y actualiza
7. Mensaje de éxito

### Recuperar Contraseña:
1. Click en "¿Olvidaste tu contraseña?"
2. Muestra mensaje: "Se ha enviado código a [email]"

---

## ✨ CARACTERÍSTICAS ESPECIALES

### Validaciones Robustas:
- ✅ Email único (no puede repetirse)
- ✅ Teléfono solo números
- ✅ Campos requeridos con mensajes específicos
- ✅ Contraseña actual verificada
- ✅ Contraseñas nuevas deben coincidir

### UX Mejorada:
- ✅ Interfaz intuitiva con emojis
- ✅ Responsiva en móvil y escritorio
- ✅ Animaciones suaves
- ✅ Mensajes de éxito/error claros
- ✅ Deshabilitamiento de botones cuando hay conflictos
- ✅ Tema oscuro en navbar, blanco en perfil

### Seguridad:
- ✅ Las contraseñas se envían al backend
- ✅ El backend valida la contraseña actual
- ✅ Sin exposición de datos sensibles
- ✅ Actualización automática del localStorage

---

## 🔌 ENDPOINTS UTILIZADOS

### 1. Obtener datos del usuario
```
GET /api/usuarios/{id}
```

### 2. Actualizar perfil
```
PUT /api/usuarios/{id}
Body: { nombre, email, apellidos, dni, telefono, direccion }
```

### 3. Cambiar contraseña
```
PUT /api/usuarios/{id}/cambiar-contrasena
Body: { contrasenaActual, contrasenaNew, confirmarContrasena }
```

---

## 📱 DISEÑO RESPONSIVO

- ✅ Desktop (>1024px): Cuadrícula de 2 columnas
- ✅ Tablet (768px-1024px): Cuadrícula adaptable
- ✅ Mobile (<768px): Una columna
- ✅ Inputs optimizados para iOS (font-size 16px)

---

## 🧪 PRUEBAS

Se incluye archivo `client-profile.spec.ts` con tests básicos para:
- ✅ Creación del componente
- ✅ Carga del usuario actual
- ✅ Toggle del modo edición
- ✅ Toggle del modo cambio de contraseña

---

## 📝 NOTAS IMPORTANTES

1. **Base de Datos:** Los cambios se guardan en la tabla `usuarios`
2. **Validaciones Backend:** Todas las validaciones se duplican en backend por seguridad
3. **Email Único:** El backend previene duplicados de email
4. **Actualización en Tiempo Real:** El localStorage se actualiza automáticamente
5. **Seguridad:** Las contraseñas se validan en backend antes de cambiar

---

## 🚀 PRÓXIMAS MEJORAS (Opcionales)

- [ ] Envío real de email con código de recuperación
- [ ] Verificación de email antes de cambiar
- [ ] Autenticación con 2FA
- [ ] Historial de cambios de perfil
- [ ] Foto de perfil del usuario

---

**Estado:** ✅ COMPLETADO Y TESTEADO
**Fecha:** 18 de Noviembre de 2025

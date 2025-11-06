# Sistema de Roles y Permisos - Clínica SePrise

## Descripción General

El sistema implementa un control de acceso basado en roles (RBAC - Role-Based Access Control) que restringe el acceso a diferentes módulos y funcionalidades según el tipo de usuario.

## Roles Definidos

### 1. Administrador
**Usuario de prueba:** `admin` / `admin123`

**Permisos:**
- ✅ Acceso completo a todos los módulos
- ✅ Agenda de Turnos (consulta, registro, acreditación, cancelación)
- ✅ Gestión de Pacientes (alta de pacientes, historia clínica)
- ✅ Gestión de Consultorios (asignación de médicos)
- ✅ Gestión de Profesionales (alta, horarios, honorarios)

**Casos de uso:**
- Administración general del sistema
- Configuración de consultorios y profesionales
- Supervisión de todas las operaciones

---

### 2. Recepción
**Usuario de prueba:** `recepcion` / `recep123`

**Permisos:**
- ✅ Agenda de Turnos (completo)
  - Consulta de turnos
  - Registro de nuevos turnos
  - Acreditación de pacientes
  - Cancelación de turnos
- ✅ Alta de Pacientes
  - Registro de nuevos pacientes
  - Consulta de datos de pacientes
  - ⚠️ **NO** tiene acceso a historias clínicas
- ❌ Sin acceso a Consultorios
- ❌ Sin acceso a Profesionales

**Casos de uso:**
- Gestión diaria de la agenda
- Atención al público
- Registro de pacientes nuevos
- Control de llegada de pacientes

---

### 3. Médico
**Usuario de prueba:** `medico` / `medico123`

**Permisos:**
- ❌ Sin acceso a Turnos
- ✅ Historia Clínica (dentro de Pacientes)
  - Consulta de historias clínicas
  - Registro de nuevas consultas
  - Actualización de diagnósticos y tratamientos
- ❌ Sin acceso a Consultorios
- ✅ Gestión de Honorarios (dentro de Profesionales)
  - Consulta de honorarios
  - Liquidación de pagos
  - Reporte de pacientes atendidos

**Casos de uso:**
- Atención médica y registro de consultas
- Consulta de antecedentes de pacientes
- Revisión de honorarios propios

---

## Arquitectura Técnica

### Estructura de Archivos

```
/utils/roles.ts              # Definición de roles y sistema de permisos
/components/MenuPrincipal.tsx # Menú filtrado según rol
/components/GestionPacientes.tsx # Pestañas condicionales
/components/GestionProfesionales.tsx # Pestañas condicionales
/components/InfoRoles.tsx     # Documentación visual de roles
/App.tsx                      # Validación de navegación
```

### Componentes Principales

#### 1. `/utils/roles.ts`
Define la estructura del sistema de permisos:

```typescript
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  RECEPCION: 'Recepción',
  MEDICO: 'Médico',
}

export const MODULOS = {
  TURNOS: 'turnos',
  PACIENTES: 'pacientes',
  CONSULTORIOS: 'consultorios',
  PROFESIONALES: 'profesionales',
}

export const SUB_MODULOS = {
  ALTA_PACIENTE: 'alta_paciente',
  HISTORIA_CLINICA: 'historia_clinica',
  ALTA_PROFESIONAL: 'alta_profesional',
  GESTION_HORARIOS: 'gestion_horarios',
  GESTION_HONORARIOS: 'gestion_honorarios',
}
```

**Funciones de utilidad:**
- `tieneAccesoModulo(rol, modulo)` - Verifica acceso a módulos principales
- `tieneAccesoSubModulo(rol, subModulo)` - Verifica acceso a sub-módulos
- `obtenerModulosPermitidos(rol)` - Obtiene lista de módulos permitidos
- `obtenerSubModulosPermitidos(rol)` - Obtiene lista de sub-módulos permitidos

#### 2. Validación en Componentes

**MenuPrincipal:**
- Filtra botones según permisos del rol
- Muestra badge visual con el nivel de acceso
- Renderiza solo los módulos permitidos

**GestionPacientes:**
- Recibe el rol como prop
- Muestra pestañas condicionales según permisos
- Para médicos: muestra solo Historia Clínica directamente

**GestionProfesionales:**
- Recibe el rol como prop
- Muestra pestañas condicionales según permisos
- Para médicos: muestra solo Gestión de Honorarios directamente

**App.tsx:**
- Función `navegarConPermiso()` valida antes de cambiar de pantalla
- Validaciones en `renderScreen()` para evitar acceso directo
- Muestra toast de error si se intenta acceder sin permisos
- Redirige al menú si se detecta acceso no autorizado

---

## Flujo de Autenticación y Autorización

### 1. Login
```
Usuario ingresa credenciales
    ↓
Backend valida (supabase/functions/server/index.tsx)
    ↓
Retorna usuario con rol asignado
    ↓
App.tsx guarda usuario y rol en estado
```

### 2. Navegación
```
Usuario selecciona módulo
    ↓
navegarConPermiso() valida permisos
    ↓
Si tiene acceso: navega al módulo
    ↓
Si NO tiene acceso: muestra toast de error
```

### 3. Renderizado de Pantalla
```
renderScreen() verifica permisos
    ↓
Si tiene acceso: renderiza componente
    ↓
Si NO tiene acceso: redirige a menú
```

### 4. Componentes con Pestañas
```
Componente recibe rol
    ↓
Verifica permisos para cada pestaña
    ↓
Renderiza solo pestañas permitidas
    ↓
Si solo una pestaña: la muestra directamente sin tabs
```

---

## Configuración de Permisos

### Matriz de Permisos

| Rol           | Turnos | Pacientes (Alta) | Historia Clínica | Consultorios | Profesionales (Alta/Horarios) | Honorarios |
|---------------|--------|------------------|------------------|--------------|-------------------------------|------------|
| Administrador | ✅     | ✅               | ✅               | ✅           | ✅                            | ✅         |
| Recepción     | ✅     | ✅               | ❌               | ❌           | ❌                            | ❌         |
| Médico        | ❌     | ❌               | ✅               | ❌           | ❌                            | ✅         |

---

## Seguridad

### Validaciones Implementadas

1. **Frontend:**
   - Validación en MenuPrincipal (no muestra botones no permitidos)
   - Validación en navegación (navegarConPermiso)
   - Validación en renderizado (renderScreen)
   - Validación en componentes (pestañas condicionales)

2. **Backend:**
   - Autenticación de usuarios con usuario/contraseña
   - Retorno de rol en respuesta de login
   - (Nota: En producción, se recomienda agregar validaciones de roles en cada endpoint)

### Recomendaciones de Seguridad

Para un entorno de producción, se recomienda:

1. **Tokens JWT:** Implementar autenticación con tokens JWT
2. **Validación Backend:** Validar permisos en cada endpoint del backend
3. **Refresh Tokens:** Implementar sistema de refresh tokens
4. **Rate Limiting:** Limitar intentos de login
5. **Logging:** Registrar intentos de acceso no autorizados
6. **Hash de Contraseñas:** Usar bcrypt o similar para contraseñas
7. **HTTPS:** Asegurar todas las comunicaciones con SSL/TLS

---

## Extensión del Sistema

### Agregar un Nuevo Rol

1. Definir el rol en `/utils/roles.ts`:
```typescript
export const ROLES = {
  ...
  ENFERMERA: 'Enfermera',
}
```

2. Configurar permisos:
```typescript
const PERMISOS_POR_ROL = {
  ...
  [ROLES.ENFERMERA]: {
    modulos: [MODULOS.TURNOS, MODULOS.PACIENTES],
    subModulos: [SUB_MODULOS.HISTORIA_CLINICA],
  },
}
```

3. Agregar usuario de prueba en el backend
4. Actualizar documentación

### Agregar un Nuevo Módulo

1. Definir módulo en `/utils/roles.ts`:
```typescript
export const MODULOS = {
  ...
  FARMACIA: 'farmacia',
}
```

2. Asignar permisos a roles:
```typescript
const PERMISOS_POR_ROL = {
  [ROLES.ADMINISTRADOR]: {
    modulos: [..., MODULOS.FARMACIA],
    ...
  },
}
```

3. Crear componente del módulo
4. Agregar en MenuPrincipal
5. Agregar ruta en App.tsx

---

## Testing

### Casos de Prueba Sugeridos

1. **Administrador:**
   - ✅ Puede acceder a todos los módulos
   - ✅ Ve todas las pestañas en cada módulo

2. **Recepción:**
   - ✅ Ve los botones de Turnos y Pacientes en el menú
   - ✅ En Pacientes, solo ve Alta de Pacientes (no Historia Clínica)
   - ❌ No puede navegar a Consultorios o Profesionales
   - ✅ Muestra error si intenta acceso directo a módulos restringidos

3. **Médico:**
   - ✅ Ve botones de Pacientes y Profesionales
   - ✅ En Pacientes, solo ve Historia Clínica
   - ✅ En Profesionales, solo ve Gestión de Honorarios
   - ❌ No puede acceder a Turnos o Consultorios

---

## Soporte y Contacto

Para más información sobre el sistema de roles o para solicitar cambios en los permisos, contactar al administrador del sistema.

**Versión:** 1.0  
**Última actualización:** Noviembre 2025  
**Sistema:** Clínica SePrise - Sistema de Gestión P1

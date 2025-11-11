# Backend Express - Clínica SePrise

API REST completa para el sistema de gestión de Clínica SePrise construida con Express.js y PostgreSQL.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_seprise
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=tu_secret_super_seguro

CORS_ORIGIN=http://localhost:3000
```

### 3. Crear Base de Datos PostgreSQL

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE clinica_seprise;

# Salir
\q
```

### 4. Inicializar Tablas y Datos

```bash
npm run init-db
```

Este comando:
- ✅ Crea todas las tablas necesarias
- ✅ Crea índices para mejor performance
- ✅ Inserta usuarios, profesionales, pacientes y consultorios de ejemplo

### 5. Ejecutar Servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📋 Estructura del Proyecto

```
server/
├── config/
│   └── database.js          # Configuración de PostgreSQL
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── pacientes.js         # CRUD de pacientes
│   ├── profesionales.js     # CRUD de profesionales
│   ├── turnos.js            # CRUD de turnos
│   ├── consultorios.js      # CRUD de consultorios
│   ├── historia-clinica.js  # CRUD de historias clínicas
│   └── health.js            # Health checks
├── scripts/
│   └── init-db.js           # Script de inicialización de BD
├── server.js                # Punto de entrada principal
├── package.json
├── .env.example
└── README.md
```

## 🔌 Endpoints API

### Base URL

```
http://localhost:5000/api
```

### 🏥 Health Check

#### GET `/api/health`

Health check básico

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

#### GET `/api/health/full`

Health check con verificación de base de datos

### 🔐 Autenticación

#### POST `/api/auth/login`

Login de usuario

**Request:**
```json
{
  "usuario": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "usuario": "admin",
    "rol": "Administrador"
  }
}
```

#### GET `/api/auth/verify`

Verificar token JWT

**Headers:**
```
Authorization: Bearer {token}
```

#### GET `/api/auth/usuarios`

Obtener todos los usuarios

#### POST `/api/auth/usuarios`

Crear nuevo usuario

**Request:**
```json
{
  "usuario": "nuevo_usuario",
  "password": "password123",
  "rol": "Recepción"
}
```

### 👥 Pacientes

#### GET `/api/pacientes`

Obtener todos los pacientes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "María",
      "apellido": "González",
      "dni": "35123456",
      "fecha_nacimiento": "1990-05-15",
      "correo": "maria.gonzalez@email.com",
      "telefono": "1145678901",
      "direccion": "Av. Corrientes 1234, CABA",
      "created_at": "2025-11-11T10:00:00.000Z"
    }
  ]
}
```

#### GET `/api/pacientes/:id`

Obtener paciente por ID

#### POST `/api/pacientes`

Crear nuevo paciente

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "fecha_nacimiento": "1985-03-20",
  "correo": "juan@email.com",
  "telefono": "1123456789",
  "direccion": "Calle Falsa 123"
}
```

#### PUT `/api/pacientes/:id`

Actualizar paciente

#### DELETE `/api/pacientes/:id`

Eliminar paciente

#### GET `/api/pacientes/buscar/:termino`

Buscar pacientes por DNI, nombre o apellido

### 👨‍⚕️ Profesionales

#### GET `/api/profesionales`

Obtener todos los profesionales

#### GET `/api/profesionales/:id`

Obtener profesional por ID

#### POST `/api/profesionales`

Crear nuevo profesional

**Request:**
```json
{
  "nombre": "Dr. Pedro",
  "apellido": "García",
  "especialidad": "Cardiología",
  "matricula": "MN-67890",
  "telefono": "1134567890",
  "correo": "pedro.garcia@clinica.com",
  "horarios": [
    {
      "dia": "Lunes",
      "inicio": "09:00",
      "fin": "13:00"
    }
  ],
  "insumos": ["Estetoscopio", "Tensiómetro"],
  "honorarios": 5000
}
```

#### PUT `/api/profesionales/:id`

Actualizar profesional

#### DELETE `/api/profesionales/:id`

Eliminar profesional

#### PATCH `/api/profesionales/:id/horarios`

Actualizar solo horarios

**Request:**
```json
{
  "horarios": [
    {
      "dia": "Lunes",
      "inicio": "09:00",
      "fin": "13:00"
    }
  ]
}
```

#### PATCH `/api/profesionales/:id/honorarios`

Actualizar solo honorarios

**Request:**
```json
{
  "honorarios": 6000
}
```

### 📅 Turnos

#### GET `/api/turnos`

Obtener todos los turnos (con filtros opcionales)

**Query params:**
- `fecha`: Filtrar por fecha (YYYY-MM-DD)
- `profesional_id`: Filtrar por profesional
- `estado`: Filtrar por estado (Pendiente, Confirmado, Atendido, Cancelado)

**Example:**
```
GET /api/turnos?fecha=2025-11-15&profesional_id=1&estado=Pendiente
```

#### GET `/api/turnos/:id`

Obtener turno por ID

#### POST `/api/turnos`

Crear nuevo turno

**Request:**
```json
{
  "paciente_id": 1,
  "profesional_id": 2,
  "fecha": "2025-11-15",
  "hora": "10:30",
  "motivo": "Consulta de control",
  "estado": "Pendiente"
}
```

#### PUT `/api/turnos/:id`

Actualizar turno

#### DELETE `/api/turnos/:id`

Eliminar turno

#### PATCH `/api/turnos/:id/acreditar`

Acreditar turno (marcar como confirmado)

#### PATCH `/api/turnos/:id/cancelar`

Cancelar turno

**Request:**
```json
{
  "motivo_cancelacion": "Paciente no pudo asistir",
  "usuario_cancelacion": "admin"
}
```

#### GET `/api/turnos/paciente/:paciente_id`

Obtener todos los turnos de un paciente

### 🏥 Consultorios

#### GET `/api/consultorios`

Obtener todos los consultorios (incluye datos del profesional asignado)

#### GET `/api/consultorios/:id`

Obtener consultorio por ID

#### POST `/api/consultorios`

Crear nuevo consultorio

**Request:**
```json
{
  "numero": "103",
  "piso": "1",
  "profesional_id": null,
  "insumos_disponibles": [
    "Estetoscopio",
    "Tensiómetro",
    "Camilla"
  ]
}
```

#### PUT `/api/consultorios/:id`

Actualizar consultorio

#### DELETE `/api/consultorios/:id`

Eliminar consultorio

#### PATCH `/api/consultorios/:id/asignar-profesional`

Asignar profesional a consultorio

**Request:**
```json
{
  "profesional_id": 3
}
```

### 📋 Historia Clínica

#### GET `/api/historia-clinica`

Obtener todas las historias clínicas

#### GET `/api/historia-clinica/:id`

Obtener registro de historia clínica por ID

#### GET `/api/historia-clinica/paciente/:paciente_id`

Obtener historia clínica completa de un paciente

#### POST `/api/historia-clinica`

Crear nuevo registro en historia clínica

**Request:**
```json
{
  "paciente_id": 1,
  "profesional_id": 2,
  "fecha": "2025-11-11",
  "diagnostico": "Hipertensión arterial",
  "tratamiento": "Enalapril 10mg cada 12hs",
  "observaciones": "Control en 30 días"
}
```

#### PUT `/api/historia-clinica/:id`

Actualizar registro de historia clínica

#### DELETE `/api/historia-clinica/:id`

Eliminar registro de historia clínica

## 🔒 Seguridad

### CORS

El servidor está configurado con CORS para aceptar requests desde el frontend:

```javascript
// En server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

### Helmet

Se usa Helmet para agregar headers de seguridad HTTP:

```javascript
app.use(helmet());
```

### JWT

Se implementa autenticación con JWT (JSON Web Tokens):

```javascript
const token = jwt.sign(
  { id, usuario, rol },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Contraseñas

⚠️ **IMPORTANTE**: En la versión actual, las contraseñas se almacenan en texto plano para compatibilidad con datos existentes.

**Para producción**, implementar hash con bcrypt:

```javascript
// Al crear usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Al verificar
const passwordMatch = await bcrypt.compare(password, user.password);
```

## 📊 Base de Datos

### Schema

```sql
usuarios (
  id, usuario, password, rol, created_at
)

pacientes (
  id, nombre, apellido, dni, fecha_nacimiento, 
  correo, telefono, direccion, created_at
)

profesionales (
  id, nombre, apellido, especialidad, matricula,
  telefono, correo, horarios (JSONB), insumos (JSONB),
  honorarios, created_at
)

turnos (
  id, paciente_id, profesional_id, fecha, hora,
  motivo, estado, acreditado, cancelado,
  motivo_cancelacion, usuario_cancelacion,
  fecha_cancelacion, created_at
)

consultorios (
  id, numero, piso, profesional_id,
  insumos_disponibles (JSONB), created_at
)

historia_clinica (
  id, paciente_id, profesional_id, fecha,
  diagnostico, tratamiento, observaciones, created_at
)
```

### Relaciones

- `turnos.paciente_id` → `pacientes.id` (ON DELETE CASCADE)
- `turnos.profesional_id` → `profesionales.id` (ON DELETE CASCADE)
- `consultorios.profesional_id` → `profesionales.id` (ON DELETE SET NULL)
- `historia_clinica.paciente_id` → `pacientes.id` (ON DELETE CASCADE)
- `historia_clinica.profesional_id` → `profesionales.id` (ON DELETE SET NULL)

### Índices

Para mejorar el rendimiento:

```sql
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_profesional ON turnos(profesional_id);
CREATE INDEX idx_turnos_paciente ON turnos(paciente_id);
CREATE INDEX idx_historia_paciente ON historia_clinica(paciente_id);
CREATE INDEX idx_historia_fecha ON historia_clinica(fecha);
```

## 🧪 Testing

### Probar con cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"admin123"}'

# Obtener pacientes
curl http://localhost:5000/api/pacientes
```

### Probar con Postman

Importa la colección de Postman (crear archivo `postman_collection.json` con todos los endpoints)

## 📦 Despliegue

### Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create clinica-seprise-api

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables de entorno
heroku config:set JWT_SECRET=tu_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Inicializar DB
heroku run npm run init-db
```

### Railway

1. Conecta tu repo de GitHub
2. Agrega PostgreSQL desde la UI
3. Configura variables de entorno
4. Deploy automático

### VPS (DigitalOcean, AWS, etc.)

```bash
# Instalar Node.js y PostgreSQL
# Clonar repo
# Configurar .env
# Ejecutar npm install
# Inicializar DB con npm run init-db
# Usar PM2 para mantener el servidor corriendo
npm install -g pm2
pm2 start server.js --name clinica-api
pm2 startup
pm2 save
```

## 🔧 Mantenimiento

### Backup de Base de Datos

```bash
# Crear backup
pg_dump -U postgres clinica_seprise > backup.sql

# Restaurar backup
psql -U postgres clinica_seprise < backup.sql
```

### Logs

```bash
# En desarrollo, los logs se muestran en consola
# En producción, usar PM2:
pm2 logs clinica-api
```

### Monitoreo

Considerar usar:
- PM2 para gestión de procesos
- New Relic para APM
- Sentry para tracking de errores

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED"

Verifica que PostgreSQL esté corriendo:
```bash
# Linux/Mac
sudo service postgresql status

# Windows
# Verifica en Servicios
```

### Error: "password authentication failed"

Verifica las credenciales en `.env`

### Error: "relation does not exist"

Ejecuta el script de inicialización:
```bash
npm run init-db
```

## 📝 Notas

- El servidor usa `morgan` para logging de requests
- Los errores se capturan y devuelven en formato JSON
- En modo desarrollo, los stack traces se incluyen en las respuestas de error

## 🎯 Próximas Mejoras

- [ ] Implementar hash de contraseñas con bcrypt
- [ ] Agregar middleware de autenticación JWT a rutas protegidas
- [ ] Implementar rate limiting
- [ ] Agregar validación de datos con Joi o express-validator
- [ ] Implementar paginación en endpoints GET
- [ ] Agregar websockets para notificaciones en tiempo real
- [ ] Implementar búsqueda full-text
- [ ] Agregar tests con Jest/Mocha

---

**Desarrollado para Clínica SePrise**  
**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025

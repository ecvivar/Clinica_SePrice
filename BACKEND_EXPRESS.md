# Guía de Migración al Backend Express

Este documento explica cómo usar el nuevo backend Express en lugar de Supabase Edge Functions.

## 🎯 ¿Qué Cambió?

El proyecto ahora incluye un **backend completo en Express.js** que reemplaza las Supabase Edge Functions.

### Ventajas del Backend Express:

- ✅ **Más control**: Código backend completamente bajo tu control
- ✅ **Sin vendor lock-in**: No dependes de Supabase
- ✅ **Despliegue flexible**: Deploy en cualquier servidor (Heroku, Railway, VPS, etc.)
- ✅ **PostgreSQL directo**: Conexión directa a la base de datos
- ✅ **Fácil de debuggear**: Código Node.js estándar
- ✅ **Extensible**: Agregar nuevas funcionalidades es más sencillo

## 📁 Estructura del Proyecto

```
clinica-seprise/
├── server/                    # ⭐ NUEVO: Backend Express
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pacientes.js
│   │   ├── profesionales.js
│   │   ├── turnos.js
│   │   ├── consultorios.js
│   │   ├── historia-clinica.js
│   │   └── health.js
│   ├── scripts/
│   │   └── init-db.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── src/                       # Frontend React
├── utils/
│   ├── api.ts                 # API antigua (Supabase)
│   └── api-express.ts         # ⭐ NUEVA API (Express)
└── ...
```

## 🚀 Inicio Rápido

### 1. Instalar PostgreSQL

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### En macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### En Windows:
Descarga e instala desde [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Crear Base de Datos

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql
# o en Windows/Mac:
psql -U postgres

# Dentro de psql:
CREATE DATABASE clinica_seprise;

# Crear usuario (opcional)
CREATE USER clinica_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE clinica_seprise TO clinica_user;

# Salir
\q
```

### 3. Configurar Backend Express

```bash
# Ir a la carpeta del servidor
cd server

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita el archivo `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_seprise
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

JWT_SECRET=un_secret_super_seguro_cambiar_en_produccion

CORS_ORIGIN=http://localhost:3000
```

### 4. Inicializar Base de Datos

```bash
# Esto crea todas las tablas e inserta datos de ejemplo
npm run init-db
```

Verás:
```
🔧 Inicializando base de datos...

📋 Creando tablas...
✅ Tabla usuarios creada
✅ Tabla pacientes creada
✅ Tabla profesionales creada
✅ Tabla turnos creada
✅ Tabla consultorios creada
✅ Tabla historia_clinica creada

📑 Creando índices...
✅ Índices creados

📥 Insertando datos iniciales...
✅ Usuarios iniciales creados
✅ Profesionales iniciales creados
✅ Pacientes iniciales creados
✅ Consultorios iniciales creados

✅ Base de datos inicializada correctamente!

📝 Usuarios disponibles:
   - admin / admin123 (Administrador)
   - recepcion / recep123 (Recepción)
   - medico / medico123 (Médico)
```

### 5. Ejecutar Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

Verás:
```
🚀 Servidor corriendo en http://localhost:5000
📝 Documentación: http://localhost:5000/
🏥 Health Check: http://localhost:5000/api/health
```

### 6. Verificar que Funciona

Abre en el navegador:
- http://localhost:5000/ → Verás info de la API
- http://localhost:5000/api/health → Verás `{"status":"ok"}`

O usa curl:
```bash
curl http://localhost:5000/api/health
```

## 🔧 Configurar Frontend

### Opción 1: Usar el Nuevo API Client (Recomendado)

Reemplaza las importaciones en tus componentes:

```tsx
// Antes (con Supabase):
import { authApi, pacientesApi } from '../utils/api';

// Después (con Express):
import { authApi, pacientesApi } from '../utils/api-express';
```

### Opción 2: Modificar api.ts Existente

Edita `/utils/api.ts` y cambia la URL base:

```typescript
// Antes:
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2de2f7f7`;

// Después:
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### Configurar Variable de Entorno

Crea o edita `/.env` en la raíz del frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Para producción:
```env
REACT_APP_API_URL=https://tu-api.com/api
```

## ✅ Verificar Integración Completa

### 1. Ejecutar Backend

```bash
cd server
npm run dev
```

### 2. Ejecutar Frontend

```bash
# En otra terminal
cd ..
npm start
```

### 3. Probar la Aplicación

1. Abre http://localhost:3000
2. Inicia sesión con `admin` / `admin123`
3. Prueba crear un paciente
4. Prueba registrar un turno
5. Ve al "Diagnóstico del Sistema" y ejecuta las pruebas

## 🌐 Desplegar a Producción

### Backend en Heroku

```bash
cd server

# Crear app
heroku create clinica-seprise-api

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables
heroku config:set JWT_SECRET=tu_secret_super_seguro
heroku config:set NODE_ENV=production

# Deploy
git init
git add .
git commit -m "Initial backend"
heroku git:remote -a clinica-seprise-api
git push heroku main

# Inicializar DB
heroku run npm run init-db

# Ver URL
heroku open
```

### Backend en Railway.app

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repo de GitHub
3. Railway detectará automáticamente el `server/package.json`
4. Agrega PostgreSQL desde la UI
5. Configura las variables de entorno
6. Deploy automático

### Frontend en Vercel/Netlify

Configura la variable de entorno:

```env
REACT_APP_API_URL=https://tu-api-en-heroku.herokuapp.com/api
```

## 📊 Comparación: Supabase vs Express

| Característica | Supabase Edge Functions | Express Backend |
|----------------|-------------------------|-----------------|
| **Control** | Limitado | Total |
| **Vendor Lock-in** | Sí | No |
| **Costo** | Según uso/plan | Según hosting |
| **Debugging** | Más difícil | Más fácil |
| **Deployment** | Solo Supabase | Cualquier servidor |
| **Base de datos** | Supabase PostgreSQL | Cualquier PostgreSQL |
| **Extensibilidad** | Limitada | Completa |

## 🔄 Migración Gradual

Puedes mantener **ambos backends** temporalmente:

1. Usa Supabase para algunos módulos
2. Usa Express para otros módulos
3. Migra gradualmente

En `api.ts`, agrega una flag:

```typescript
const USE_EXPRESS = process.env.REACT_APP_USE_EXPRESS === 'true';

export const authApi = {
  login: async (...args) => {
    if (USE_EXPRESS) {
      return expressAuthApi.login(...args);
    }
    return supabaseAuthApi.login(...args);
  }
};
```

## 🐛 Troubleshooting

### Backend no inicia

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solución**: PostgreSQL no está corriendo
```bash
# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql

# Windows
# Iniciar servicio PostgreSQL desde Servicios
```

### Frontend no se conecta al backend

**Error**: `CORS error` o `Failed to fetch`

**Solución**:
1. Verifica que el backend esté corriendo en `http://localhost:5000`
2. Verifica `CORS_ORIGIN` en el `.env` del backend
3. Verifica `REACT_APP_API_URL` en el `.env` del frontend

### Error de autenticación

**Error**: `password authentication failed for user`

**Solución**:
1. Verifica las credenciales en `server/.env`
2. Prueba conectarte manualmente:
```bash
psql -U postgres -d clinica_seprise
```

## 📝 Próximos Pasos

Ahora que tienes el backend Express funcionando:

1. ✅ Revisa los endpoints en `server/README.md`
2. ✅ Prueba todas las funcionalidades del frontend
3. ✅ Implementa hash de contraseñas con bcrypt (producción)
4. ✅ Agrega validación de JWT en rutas protegidas
5. ✅ Implementa rate limiting
6. ✅ Configura backups automáticos de la BD

## 📚 Recursos

- **Documentación completa del backend**: `/server/README.md`
- **Endpoints API**: `/server/README.md#endpoints-api`
- **Express.js docs**: https://expressjs.com
- **PostgreSQL docs**: https://www.postgresql.org/docs

---

**¿Necesitas ayuda?**
- Revisa los logs del servidor: `npm run dev` muestra todos los requests
- Usa el módulo "Diagnóstico del Sistema" en la app para verificar la conexión
- Revisa la consola del navegador para errores del frontend

**Última actualización**: Noviembre 2025

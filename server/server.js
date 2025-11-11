const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Middlewares ====================
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// ==================== Rutas ====================
const authRoutes = require('./routes/auth');
const pacientesRoutes = require('./routes/pacientes');
const profesionalesRoutes = require('./routes/profesionales');
const turnosRoutes = require('./routes/turnos');
const consultoriosRoutes = require('./routes/consultorios');
const historiaClinicaRoutes = require('./routes/historia-clinica');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/consultorios', consultoriosRoutes);
app.use('/api/historia-clinica', historiaClinicaRoutes);
app.use('/api/health', healthRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Clínica SePrise',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      pacientes: '/api/pacientes',
      profesionales: '/api/profesionales',
      turnos: '/api/turnos',
      consultorios: '/api/consultorios',
      historiaClinica: '/api/historia-clinica'
    }
  });
});

// ==================== Manejo de Errores ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== Iniciar Servidor ====================
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Documentación: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app;

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Health check básico
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check con verificación de DB
router.get('/full', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const result = await db.query('SELECT NOW()');
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        timestamp: result.rows[0].now
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
});

module.exports = router;

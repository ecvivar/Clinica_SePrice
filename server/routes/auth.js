const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const result = await db.query(
      'SELECT * FROM usuarios WHERE usuario = $1',
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña (por ahora sin hash para compatibilidad)
    // En producción, usar bcrypt.compare()
    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario, 
        rol: user.rol 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      usuario: {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    res.json({
      success: true,
      usuario: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Obtener todos los usuarios (solo para admin)
router.get('/usuarios', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, usuario, rol, created_at FROM usuarios ORDER BY id'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// Crear usuario
router.post('/usuarios', async (req, res) => {
  try {
    const { usuario, password, rol } = req.body;

    if (!usuario || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existente = await db.query(
      'SELECT id FROM usuarios WHERE usuario = $1',
      [usuario]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Insertar usuario (sin hash por ahora, para compatibilidad)
    const result = await db.query(
      'INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3) RETURNING id, usuario, rol',
      [usuario, password, rol]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
});

module.exports = router;

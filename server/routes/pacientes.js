const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los pacientes
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pacientes ORDER BY apellido, nombre'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes'
    });
  }
});

// Obtener un paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM pacientes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente'
    });
  }
});

// Crear paciente
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion } = req.body;

    // Validaciones
    if (!nombre || !apellido || !dni || !fecha_nacimiento) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, DNI y fecha de nacimiento son requeridos'
      });
    }

    // Verificar si ya existe un paciente con ese DNI
    const existente = await db.query(
      'SELECT id FROM pacientes WHERE dni = $1',
      [dni]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un paciente con ese DNI'
      });
    }

    // Insertar paciente
    const result = await db.query(
      `INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente'
    });
  }
});

// Actualizar paciente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion } = req.body;

    const result = await db.query(
      `UPDATE pacientes 
       SET nombre = $1, apellido = $2, dni = $3, fecha_nacimiento = $4, 
           correo = $5, telefono = $6, direccion = $7
       WHERE id = $8
       RETURNING *`,
      [nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente'
    });
  }
});

// Eliminar paciente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM pacientes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Paciente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente'
    });
  }
});

// Buscar pacientes por DNI o nombre
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;
    
    const result = await db.query(
      `SELECT * FROM pacientes 
       WHERE dni ILIKE $1 OR nombre ILIKE $1 OR apellido ILIKE $1
       ORDER BY apellido, nombre`,
      [`%${termino}%`]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar pacientes'
    });
  }
});

module.exports = router;

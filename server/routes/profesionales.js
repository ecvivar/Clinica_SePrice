const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los profesionales
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM profesionales ORDER BY apellido, nombre'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener profesionales'
    });
  }
});

// Obtener un profesional por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM profesionales WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener profesional'
    });
  }
});

// Crear profesional
router.post('/', async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      especialidad, 
      matricula, 
      telefono, 
      correo,
      horarios = [],
      insumos = [],
      honorarios = 0
    } = req.body;

    // Validaciones
    if (!nombre || !apellido || !especialidad || !matricula) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellido, especialidad y matrícula son requeridos'
      });
    }

    // Verificar si ya existe un profesional con esa matrícula
    const existente = await db.query(
      'SELECT id FROM profesionales WHERE matricula = $1',
      [matricula]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un profesional con esa matrícula'
      });
    }

    // Insertar profesional
    const result = await db.query(
      `INSERT INTO profesionales 
       (nombre, apellido, especialidad, matricula, telefono, correo, horarios, insumos, honorarios)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nombre, 
        apellido, 
        especialidad, 
        matricula, 
        telefono, 
        correo,
        JSON.stringify(horarios),
        JSON.stringify(insumos),
        honorarios
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear profesional'
    });
  }
});

// Actualizar profesional
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      apellido, 
      especialidad, 
      matricula, 
      telefono, 
      correo,
      horarios,
      insumos,
      honorarios
    } = req.body;

    const result = await db.query(
      `UPDATE profesionales 
       SET nombre = $1, apellido = $2, especialidad = $3, matricula = $4, 
           telefono = $5, correo = $6, horarios = $7, insumos = $8, honorarios = $9
       WHERE id = $10
       RETURNING *`,
      [
        nombre, 
        apellido, 
        especialidad, 
        matricula, 
        telefono, 
        correo,
        JSON.stringify(horarios),
        JSON.stringify(insumos),
        honorarios,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar profesional'
    });
  }
});

// Eliminar profesional
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM profesionales WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Profesional eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar profesional'
    });
  }
});

// Actualizar horarios de un profesional
router.patch('/:id/horarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { horarios } = req.body;

    const result = await db.query(
      'UPDATE profesionales SET horarios = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(horarios), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar horarios'
    });
  }
});

// Actualizar honorarios de un profesional
router.patch('/:id/honorarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { honorarios } = req.body;

    const result = await db.query(
      'UPDATE profesionales SET honorarios = $1 WHERE id = $2 RETURNING *',
      [honorarios, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profesional no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar honorarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar honorarios'
    });
  }
});

module.exports = router;

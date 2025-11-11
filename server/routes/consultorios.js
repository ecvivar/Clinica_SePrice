const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los consultorios
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, 
              p.nombre as profesional_nombre, 
              p.apellido as profesional_apellido, 
              p.especialidad,
              p.insumos as profesional_insumos
       FROM consultorios c
       LEFT JOIN profesionales p ON c.profesional_id = p.id
       ORDER BY c.numero`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener consultorios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consultorios'
    });
  }
});

// Obtener un consultorio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT c.*, 
              p.nombre as profesional_nombre, 
              p.apellido as profesional_apellido, 
              p.especialidad
       FROM consultorios c
       LEFT JOIN profesionales p ON c.profesional_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultorio no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener consultorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consultorio'
    });
  }
});

// Crear consultorio
router.post('/', async (req, res) => {
  try {
    const { numero, piso, profesional_id, insumos_disponibles = [] } = req.body;

    // Validaciones
    if (!numero) {
      return res.status(400).json({
        success: false,
        message: 'El número de consultorio es requerido'
      });
    }

    // Verificar si ya existe un consultorio con ese número
    const existente = await db.query(
      'SELECT id FROM consultorios WHERE numero = $1',
      [numero]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un consultorio con ese número'
      });
    }

    // Insertar consultorio
    const result = await db.query(
      `INSERT INTO consultorios (numero, piso, profesional_id, insumos_disponibles)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [numero, piso, profesional_id, JSON.stringify(insumos_disponibles)]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear consultorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear consultorio'
    });
  }
});

// Actualizar consultorio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, piso, profesional_id, insumos_disponibles } = req.body;

    const result = await db.query(
      `UPDATE consultorios 
       SET numero = $1, piso = $2, profesional_id = $3, insumos_disponibles = $4
       WHERE id = $5
       RETURNING *`,
      [numero, piso, profesional_id, JSON.stringify(insumos_disponibles), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultorio no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar consultorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar consultorio'
    });
  }
});

// Asignar profesional a consultorio
router.patch('/:id/asignar-profesional', async (req, res) => {
  try {
    const { id } = req.params;
    const { profesional_id } = req.body;

    const result = await db.query(
      'UPDATE consultorios SET profesional_id = $1 WHERE id = $2 RETURNING *',
      [profesional_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultorio no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al asignar profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar profesional'
    });
  }
});

// Eliminar consultorio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM consultorios WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consultorio no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Consultorio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar consultorio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar consultorio'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las historias clínicas
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT hc.*, 
              p.nombre as paciente_nombre, 
              p.apellido as paciente_apellido, 
              p.dni as paciente_dni,
              pr.nombre as profesional_nombre, 
              pr.apellido as profesional_apellido,
              pr.especialidad
       FROM historia_clinica hc
       LEFT JOIN pacientes p ON hc.paciente_id = p.id
       LEFT JOIN profesionales pr ON hc.profesional_id = pr.id
       ORDER BY hc.fecha DESC, hc.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener historias clínicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias clínicas'
    });
  }
});

// Obtener historia clínica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT hc.*, 
              p.nombre as paciente_nombre, 
              p.apellido as paciente_apellido,
              pr.nombre as profesional_nombre, 
              pr.apellido as profesional_apellido
       FROM historia_clinica hc
       LEFT JOIN pacientes p ON hc.paciente_id = p.id
       LEFT JOIN profesionales pr ON hc.profesional_id = pr.id
       WHERE hc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia clínica'
    });
  }
});

// Obtener historia clínica por paciente
router.get('/paciente/:paciente_id', async (req, res) => {
  try {
    const { paciente_id } = req.params;
    
    const result = await db.query(
      `SELECT hc.*, 
              pr.nombre as profesional_nombre, 
              pr.apellido as profesional_apellido,
              pr.especialidad
       FROM historia_clinica hc
       LEFT JOIN profesionales pr ON hc.profesional_id = pr.id
       WHERE hc.paciente_id = $1
       ORDER BY hc.fecha DESC, hc.created_at DESC`,
      [paciente_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener historia clínica del paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia clínica del paciente'
    });
  }
});

// Crear registro en historia clínica
router.post('/', async (req, res) => {
  try {
    const { 
      paciente_id, 
      profesional_id, 
      fecha, 
      diagnostico,
      tratamiento,
      observaciones
    } = req.body;

    // Validaciones
    if (!paciente_id || !profesional_id || !fecha || !diagnostico) {
      return res.status(400).json({
        success: false,
        message: 'Paciente, profesional, fecha y diagnóstico son requeridos'
      });
    }

    // Insertar registro
    const result = await db.query(
      `INSERT INTO historia_clinica 
       (paciente_id, profesional_id, fecha, diagnostico, tratamiento, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [paciente_id, profesional_id, fecha, diagnostico, tratamiento, observaciones]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear historia clínica'
    });
  }
});

// Actualizar historia clínica
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paciente_id, 
      profesional_id, 
      fecha, 
      diagnostico,
      tratamiento,
      observaciones
    } = req.body;

    const result = await db.query(
      `UPDATE historia_clinica 
       SET paciente_id = $1, profesional_id = $2, fecha = $3, 
           diagnostico = $4, tratamiento = $5, observaciones = $6
       WHERE id = $7
       RETURNING *`,
      [paciente_id, profesional_id, fecha, diagnostico, tratamiento, observaciones, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar historia clínica'
    });
  }
});

// Eliminar registro de historia clínica
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM historia_clinica WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Historia clínica eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar historia clínica'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los turnos
router.get('/', async (req, res) => {
  try {
    const { fecha, profesional_id, estado } = req.query;
    
    let query = `
      SELECT t.*, 
             p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.dni as paciente_dni,
             pr.nombre as profesional_nombre, pr.apellido as profesional_apellido, pr.especialidad
      FROM turnos t
      LEFT JOIN pacientes p ON t.paciente_id = p.id
      LEFT JOIN profesionales pr ON t.profesional_id = pr.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Filtros opcionales
    if (fecha) {
      query += ` AND t.fecha = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    if (profesional_id) {
      query += ` AND t.profesional_id = $${paramCount}`;
      params.push(profesional_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND t.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ' ORDER BY t.fecha DESC, t.hora DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener turnos'
    });
  }
});

// Obtener un turno por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT t.*, 
              p.nombre as paciente_nombre, p.apellido as paciente_apellido,
              pr.nombre as profesional_nombre, pr.apellido as profesional_apellido
       FROM turnos t
       LEFT JOIN pacientes p ON t.paciente_id = p.id
       LEFT JOIN profesionales pr ON t.profesional_id = pr.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener turno'
    });
  }
});

// Crear turno
router.post('/', async (req, res) => {
  try {
    const { 
      paciente_id, 
      profesional_id, 
      fecha, 
      hora, 
      motivo,
      estado = 'Pendiente'
    } = req.body;

    // Validaciones
    if (!paciente_id || !profesional_id || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        message: 'Paciente, profesional, fecha y hora son requeridos'
      });
    }

    // Verificar que no exista otro turno en el mismo horario
    const existente = await db.query(
      `SELECT id FROM turnos 
       WHERE profesional_id = $1 AND fecha = $2 AND hora = $3 AND cancelado = false`,
      [profesional_id, fecha, hora]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un turno para ese profesional en ese horario'
      });
    }

    // Insertar turno
    const result = await db.query(
      `INSERT INTO turnos (paciente_id, profesional_id, fecha, hora, motivo, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [paciente_id, profesional_id, fecha, hora, motivo, estado]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear turno'
    });
  }
});

// Actualizar turno
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      paciente_id, 
      profesional_id, 
      fecha, 
      hora, 
      motivo,
      estado
    } = req.body;

    const result = await db.query(
      `UPDATE turnos 
       SET paciente_id = $1, profesional_id = $2, fecha = $3, hora = $4, 
           motivo = $5, estado = $6
       WHERE id = $7
       RETURNING *`,
      [paciente_id, profesional_id, fecha, hora, motivo, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar turno'
    });
  }
});

// Acreditar turno
router.patch('/:id/acreditar', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE turnos 
       SET acreditado = true, estado = 'Confirmado'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al acreditar turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al acreditar turno'
    });
  }
});

// Cancelar turno
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_cancelacion, usuario_cancelacion } = req.body;

    const result = await db.query(
      `UPDATE turnos 
       SET cancelado = true, 
           estado = 'Cancelado',
           motivo_cancelacion = $1,
           usuario_cancelacion = $2,
           fecha_cancelacion = NOW()
       WHERE id = $3
       RETURNING *`,
      [motivo_cancelacion, usuario_cancelacion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cancelar turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar turno'
    });
  }
});

// Eliminar turno
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM turnos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Turno eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar turno'
    });
  }
});

// Obtener turnos por paciente
router.get('/paciente/:paciente_id', async (req, res) => {
  try {
    const { paciente_id } = req.params;
    
    const result = await db.query(
      `SELECT t.*, 
              pr.nombre as profesional_nombre, 
              pr.apellido as profesional_apellido, 
              pr.especialidad
       FROM turnos t
       LEFT JOIN profesionales pr ON t.profesional_id = pr.id
       WHERE t.paciente_id = $1
       ORDER BY t.fecha DESC, t.hora DESC`,
      [paciente_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener turnos del paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener turnos del paciente'
    });
  }
});

module.exports = router;

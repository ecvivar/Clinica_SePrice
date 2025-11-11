const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'clinica_seprise',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const initDatabase = async () => {
  console.log('🔧 Inicializando base de datos...\n');

  try {
    // Crear tablas
    console.log('📋 Creando tablas...');

    await pool.query(`
      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id BIGSERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL CHECK (rol IN ('Administrador', 'Recepción', 'Médico')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla usuarios creada');

    await pool.query(`
      -- Tabla de pacientes
      CREATE TABLE IF NOT EXISTS pacientes (
        id BIGSERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        dni TEXT UNIQUE NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        correo TEXT,
        telefono TEXT,
        direccion TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla pacientes creada');

    await pool.query(`
      -- Tabla de profesionales
      CREATE TABLE IF NOT EXISTS profesionales (
        id BIGSERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        especialidad TEXT NOT NULL,
        matricula TEXT UNIQUE NOT NULL,
        telefono TEXT,
        correo TEXT,
        horarios JSONB DEFAULT '[]'::jsonb,
        insumos JSONB DEFAULT '[]'::jsonb,
        honorarios DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla profesionales creada');

    await pool.query(`
      -- Tabla de turnos
      CREATE TABLE IF NOT EXISTS turnos (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT REFERENCES pacientes(id) ON DELETE CASCADE,
        profesional_id BIGINT REFERENCES profesionales(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        motivo TEXT,
        estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Atendido', 'Cancelado')),
        acreditado BOOLEAN DEFAULT false,
        cancelado BOOLEAN DEFAULT false,
        motivo_cancelacion TEXT,
        usuario_cancelacion TEXT,
        fecha_cancelacion TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla turnos creada');

    await pool.query(`
      -- Tabla de consultorios
      CREATE TABLE IF NOT EXISTS consultorios (
        id BIGSERIAL PRIMARY KEY,
        numero TEXT UNIQUE NOT NULL,
        piso TEXT,
        profesional_id BIGINT REFERENCES profesionales(id) ON DELETE SET NULL,
        insumos_disponibles JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla consultorios creada');

    await pool.query(`
      -- Tabla de historia clínica
      CREATE TABLE IF NOT EXISTS historia_clinica (
        id BIGSERIAL PRIMARY KEY,
        paciente_id BIGINT REFERENCES pacientes(id) ON DELETE CASCADE,
        profesional_id BIGINT REFERENCES profesionales(id) ON DELETE SET NULL,
        fecha DATE NOT NULL,
        diagnostico TEXT NOT NULL,
        tratamiento TEXT,
        observaciones TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla historia_clinica creada');

    // Crear índices
    console.log('\n📑 Creando índices...');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
      CREATE INDEX IF NOT EXISTS idx_turnos_profesional ON turnos(profesional_id);
      CREATE INDEX IF NOT EXISTS idx_turnos_paciente ON turnos(paciente_id);
      CREATE INDEX IF NOT EXISTS idx_historia_paciente ON historia_clinica(paciente_id);
      CREATE INDEX IF NOT EXISTS idx_historia_fecha ON historia_clinica(fecha);
    `);
    console.log('✅ Índices creados');

    // Insertar datos iniciales
    console.log('\n📥 Insertando datos iniciales...');

    // Usuarios
    const usuariosCount = await pool.query('SELECT COUNT(*) FROM usuarios');
    if (parseInt(usuariosCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO usuarios (usuario, password, rol) VALUES
          ('admin', 'admin123', 'Administrador'),
          ('recepcion', 'recep123', 'Recepción'),
          ('medico', 'medico123', 'Médico');
      `);
      console.log('✅ Usuarios iniciales creados');
    } else {
      console.log('⏭️  Usuarios ya existen');
    }

    // Profesionales
    const profesionalesCount = await pool.query('SELECT COUNT(*) FROM profesionales');
    if (parseInt(profesionalesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO profesionales (nombre, apellido, especialidad, matricula, telefono, correo, horarios, honorarios) VALUES
          ('Dr. Carlos', 'Rodríguez', 'Cardiología', 'MN-12345', '1145678901', 'carlos.rodriguez@clinica.com', 
           '[{"dia":"Lunes","inicio":"09:00","fin":"13:00"},{"dia":"Miércoles","inicio":"14:00","fin":"18:00"}]'::jsonb, 5000),
          ('Dra. María', 'González', 'Pediatría', 'MN-23456', '1156789012', 'maria.gonzalez@clinica.com',
           '[{"dia":"Martes","inicio":"08:00","fin":"12:00"},{"dia":"Jueves","inicio":"14:00","fin":"18:00"}]'::jsonb, 4500),
          ('Dr. Juan', 'Martínez', 'Traumatología', 'MN-34567', '1167890123', 'juan.martinez@clinica.com',
           '[{"dia":"Lunes","inicio":"14:00","fin":"18:00"},{"dia":"Viernes","inicio":"09:00","fin":"13:00"}]'::jsonb, 5500),
          ('Dra. Ana', 'López', 'Dermatología', 'MN-45678', '1178901234', 'ana.lopez@clinica.com',
           '[{"dia":"Miércoles","inicio":"09:00","fin":"13:00"},{"dia":"Viernes","inicio":"14:00","fin":"18:00"}]'::jsonb, 4000);
      `);
      console.log('✅ Profesionales iniciales creados');
    } else {
      console.log('⏭️  Profesionales ya existen');
    }

    // Pacientes
    const pacientesCount = await pool.query('SELECT COUNT(*) FROM pacientes');
    if (parseInt(pacientesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, correo, telefono, direccion) VALUES
          ('María', 'González', '35123456', '1990-05-15', 'maria.gonzalez@email.com', '1145678901', 'Av. Corrientes 1234, CABA'),
          ('Juan', 'Pérez', '28987654', '1985-08-22', 'juan.perez@email.com', '1156789012', 'Calle Rivadavia 567, CABA'),
          ('Ana', 'Martínez', '42345678', '1998-12-10', 'ana.martinez@email.com', '1167890123', 'San Martín 890, CABA'),
          ('Carlos', 'López', '31234567', '1988-03-28', 'carlos.lopez@email.com', '1178901234', 'Av. Santa Fe 2345, CABA');
      `);
      console.log('✅ Pacientes iniciales creados');
    } else {
      console.log('⏭️  Pacientes ya existen');
    }

    // Consultorios
    const consultoriosCount = await pool.query('SELECT COUNT(*) FROM consultorios');
    if (parseInt(consultoriosCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO consultorios (numero, piso, insumos_disponibles) VALUES
          ('101', '1', '["Estetoscopio", "Tensiómetro", "Termómetro", "Camilla"]'::jsonb),
          ('102', '1', '["Estetoscopio", "Tensiómetro", "Camilla", "Otoscopio"]'::jsonb),
          ('201', '2', '["Camilla", "Tensiómetro", "Electrocardiograma"]'::jsonb),
          ('202', '2', '["Estetoscopio", "Termómetro", "Camilla"]'::jsonb);
      `);
      console.log('✅ Consultorios iniciales creados');
    } else {
      console.log('⏭️  Consultorios ya existen');
    }

    console.log('\n✅ Base de datos inicializada correctamente!\n');
    console.log('📝 Usuarios disponibles:');
    console.log('   - admin / admin123 (Administrador)');
    console.log('   - recepcion / recep123 (Recepción)');
    console.log('   - medico / medico123 (Médico)\n');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Ejecutar inicialización
initDatabase()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

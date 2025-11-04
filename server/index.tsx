import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-2de2f7f7/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== USUARIOS ====================

app.post('/make-server-2de2f7f7/auth/reinicializar-usuarios', async (c) => {
  try {
    const usuariosCorrectos = [
      { id: 1, usuario: 'admin', password: 'admin123', rol: 'Administrador', nombre: 'Admin' },
      { id: 2, usuario: 'recepcion', password: 'recep123', rol: 'Recepción', nombre: 'Recepcionista' },
      { id: 3, usuario: 'medico', password: 'medico123', rol: 'Médico', nombre: 'Dr. Médico' }
    ];
    
    await kv.set('usuarios', usuariosCorrectos);
    console.log('Usuarios reinicializados manualmente');
    
    return c.json({ success: true, message: 'Usuarios reinicializados correctamente' });
  } catch (error) {
    console.log('Error reinicializando usuarios:', error);
    return c.json({ error: 'Error al reinicializar usuarios' }, 500);
  }
});

app.post('/make-server-2de2f7f7/auth/login', async (c) => {
  try {
    const { usuario, password } = await c.req.json();
    
    // Usuarios por defecto con roles exactamente como están definidos en el frontend
    const usuariosPorDefecto = [
      { id: 1, usuario: 'admin', password: 'admin123', rol: 'Administrador', nombre: 'Admin' },
      { id: 2, usuario: 'recepcion', password: 'recep123', rol: 'Recepción', nombre: 'Recepcionista' },
      { id: 3, usuario: 'medico', password: 'medico123', rol: 'Médico', nombre: 'Dr. Médico' }
    ];
    
    let usuarios = await kv.get('usuarios');
    
    // Verificar si los usuarios tienen roles antiguos (con "Profesional")
    const tieneRolesAntiguos = usuarios && usuarios.some(u => 
      u.rol && (u.rol.includes('Profesional') || u.rol.length > 15)
    );
    
    // Si no hay usuarios o tienen roles antiguos, reinicializar
    if (!usuarios || usuarios.length === 0 || tieneRolesAntiguos) {
      await kv.set('usuarios', usuariosPorDefecto);
      usuarios = usuariosPorDefecto;
      console.log('Usuarios reinicializados con roles actualizados');
    }
    
    const listaUsuarios = usuarios;
    
    const usuarioEncontrado = listaUsuarios.find(
      u => u.usuario === usuario && u.password === password
    );
    
    if (usuarioEncontrado) {
      const { password: _, ...usuarioSinPassword } = usuarioEncontrado;
      console.log('Login exitoso - Usuario:', usuarioSinPassword.usuario, 'Rol:', usuarioSinPassword.rol, 'Longitud rol:', usuarioSinPassword.rol.length);
      return c.json({ success: true, usuario: usuarioSinPassword });
    }
    
    console.log('Login fallido - Usuario no encontrado:', usuario);
    return c.json({ success: false, error: 'Credenciales incorrectas' }, 401);
  } catch (error) {
    console.log('Error en login:', error);
    return c.json({ error: 'Error en el servidor' }, 500);
  }
});

// ==================== PACIENTES ====================

app.get('/make-server-2de2f7f7/pacientes', async (c) => {
  try {
    let pacientes = await kv.get('pacientes');
    
    if (!pacientes) {
      pacientes = [];
    }
    
    if (!Array.isArray(pacientes)) {
      console.error('Pacientes no es un array:', pacientes);
      pacientes = [];
    }
    
    return c.json(pacientes);
  } catch (error) {
    console.log('Error obteniendo pacientes:', error);
    return c.json([], 200);
  }
});

app.post('/make-server-2de2f7f7/pacientes', async (c) => {
  try {
    const paciente = await c.req.json();
    const pacientes = await kv.get('pacientes') || [];
    
    // Verificar DNI único
    const dniExiste = pacientes.find(p => p.dni === paciente.dni);
    if (dniExiste) {
      return c.json({ error: 'Ya existe un paciente con ese DNI' }, 400);
    }
    
    const nuevoPaciente = {
      id: pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1,
      ...paciente,
      fechaRegistro: new Date().toISOString()
    };
    
    pacientes.push(nuevoPaciente);
    await kv.set('pacientes', pacientes);
    
    return c.json(nuevoPaciente);
  } catch (error) {
    console.log('Error creando paciente:', error);
    return c.json({ error: 'Error al crear paciente' }, 500);
  }
});

// ==================== PROFESIONALES ====================

app.get('/make-server-2de2f7f7/profesionales', async (c) => {
  try {
    let profesionales = await kv.get('profesionales');
    
    // Si no hay datos o es null/undefined, devolver array vacío
    if (!profesionales) {
      profesionales = [];
    }
    
    // Asegurar que sea un array
    if (!Array.isArray(profesionales)) {
      console.error('Profesionales no es un array:', profesionales);
      profesionales = [];
    }
    
    return c.json(profesionales);
  } catch (error) {
    console.log('Error obteniendo profesionales:', error);
    return c.json([], 200); // Devolver array vacío en lugar de error
  }
});

app.post('/make-server-2de2f7f7/profesionales', async (c) => {
  try {
    const profesional = await c.req.json();
    const profesionales = await kv.get('profesionales') || [];
    
    const nuevoProfesional = {
      id: profesionales.length > 0 ? Math.max(...profesionales.map(p => p.id)) + 1 : 1,
      ...profesional,
      fechaRegistro: new Date().toISOString()
    };
    
    profesionales.push(nuevoProfesional);
    await kv.set('profesionales', profesionales);
    
    return c.json(nuevoProfesional);
  } catch (error) {
    console.log('Error creando profesional:', error);
    return c.json({ error: 'Error al crear profesional' }, 500);
  }
});

app.put('/make-server-2de2f7f7/profesionales/:id/horarios', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { horarios } = await c.req.json();
    
    const profesionales = await kv.get('profesionales') || [];
    const index = profesionales.findIndex(p => p.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Profesional no encontrado' }, 404);
    }
    
    profesionales[index].horarios = horarios;
    await kv.set('profesionales', profesionales);
    
    return c.json(profesionales[index]);
  } catch (error) {
    console.log('Error actualizando horarios:', error);
    return c.json({ error: 'Error al actualizar horarios' }, 500);
  }
});

// ==================== TURNOS ====================

app.get('/make-server-2de2f7f7/turnos', async (c) => {
  try {
    let turnos = await kv.get('turnos');
    
    if (!turnos) {
      turnos = [];
    }
    
    if (!Array.isArray(turnos)) {
      console.error('Turnos no es un array:', turnos);
      turnos = [];
    }
    
    return c.json(turnos);
  } catch (error) {
    console.log('Error obteniendo turnos:', error);
    return c.json([], 200);
  }
});

app.post('/make-server-2de2f7f7/turnos', async (c) => {
  try {
    const turno = await c.req.json();
    const turnos = await kv.get('turnos') || [];
    
    const nuevoTurno = {
      id: turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1,
      ...turno,
      estado: 'Confirmado',
      fechaRegistro: new Date().toISOString()
    };
    
    turnos.push(nuevoTurno);
    await kv.set('turnos', turnos);
    
    return c.json(nuevoTurno);
  } catch (error) {
    console.log('Error creando turno:', error);
    return c.json({ error: 'Error al crear turno' }, 500);
  }
});

app.put('/make-server-2de2f7f7/turnos/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const actualizacion = await c.req.json();
    
    const turnos = await kv.get('turnos') || [];
    const index = turnos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Turno no encontrado' }, 404);
    }
    
    turnos[index] = { ...turnos[index], ...actualizacion };
    await kv.set('turnos', turnos);
    
    return c.json(turnos[index]);
  } catch (error) {
    console.log('Error actualizando turno:', error);
    return c.json({ error: 'Error al actualizar turno' }, 500);
  }
});

app.post('/make-server-2de2f7f7/turnos/:id/cancelar', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { motivo, usuario } = await c.req.json();
    
    const turnos = await kv.get('turnos') || [];
    const index = turnos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Turno no encontrado' }, 404);
    }
    
    turnos[index].estado = 'Cancelado';
    turnos[index].motivoCancelacion = motivo;
    turnos[index].usuarioCancelacion = usuario;
    turnos[index].fechaCancelacion = new Date().toISOString();
    
    await kv.set('turnos', turnos);
    
    return c.json(turnos[index]);
  } catch (error) {
    console.log('Error cancelando turno:', error);
    return c.json({ error: 'Error al cancelar turno' }, 500);
  }
});

app.post('/make-server-2de2f7f7/turnos/:id/acreditar', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    const turnos = await kv.get('turnos') || [];
    const index = turnos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Turno no encontrado' }, 404);
    }
    
    turnos[index].estado = 'Acreditado';
    turnos[index].fechaAcreditacion = new Date().toISOString();
    
    await kv.set('turnos', turnos);
    
    return c.json(turnos[index]);
  } catch (error) {
    console.log('Error acreditando turno:', error);
    return c.json({ error: 'Error al acreditar turno' }, 500);
  }
});

// ==================== HISTORIA CLÍNICA ====================

app.get('/make-server-2de2f7f7/historia-clinica', async (c) => {
  try {
    let historias = await kv.get('historias_clinicas');
    
    if (!historias) {
      historias = [];
    }
    
    if (!Array.isArray(historias)) {
      console.error('Historias clínicas no es un array:', historias);
      historias = [];
    }
    
    return c.json(historias);
  } catch (error) {
    console.log('Error obteniendo historias clínicas:', error);
    return c.json([], 200);
  }
});

app.get('/make-server-2de2f7f7/historia-clinica/paciente/:pacienteId', async (c) => {
  try {
    const pacienteId = parseInt(c.req.param('pacienteId'));
    const historias = await kv.get('historias_clinicas') || [];
    const historiasDelPaciente = historias.filter(h => h.pacienteId === pacienteId);
    return c.json(historiasDelPaciente);
  } catch (error) {
    console.log('Error obteniendo historia del paciente:', error);
    return c.json({ error: 'Error al obtener historia del paciente' }, 500);
  }
});

app.post('/make-server-2de2f7f7/historia-clinica', async (c) => {
  try {
    const registro = await c.req.json();
    const historias = await kv.get('historias_clinicas') || [];
    
    const nuevoRegistro = {
      id: historias.length > 0 ? Math.max(...historias.map(h => h.id)) + 1 : 1,
      ...registro,
      fecha: new Date().toISOString()
    };
    
    historias.push(nuevoRegistro);
    await kv.set('historias_clinicas', historias);
    
    return c.json(nuevoRegistro);
  } catch (error) {
    console.log('Error creando registro de historia clínica:', error);
    return c.json({ error: 'Error al crear registro' }, 500);
  }
});

// ==================== INSUMOS ====================

// Obtener insumos de un profesional
app.get('/make-server-2de2f7f7/profesionales/:id/insumos', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const profesionales = await kv.get('profesionales') || [];
    const profesional = profesionales.find(p => p.id === id);
    
    if (!profesional) {
      return c.json({ error: 'Profesional no encontrado' }, 404);
    }
    
    return c.json(profesional.insumos || []);
  } catch (error) {
    console.log('Error obteniendo insumos del profesional:', error);
    return c.json({ error: 'Error al obtener insumos' }, 500);
  }
});

// Actualizar insumos de un profesional
app.put('/make-server-2de2f7f7/profesionales/:id/insumos', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { insumos } = await c.req.json();
    
    const profesionales = await kv.get('profesionales') || [];
    const index = profesionales.findIndex(p => p.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Profesional no encontrado' }, 404);
    }
    
    profesionales[index].insumos = insumos;
    await kv.set('profesionales', profesionales);
    
    return c.json(profesionales[index]);
  } catch (error) {
    console.log('Error actualizando insumos del profesional:', error);
    return c.json({ error: 'Error al actualizar insumos' }, 500);
  }
});

// Obtener insumos disponibles en un consultorio
app.get('/make-server-2de2f7f7/consultorios/:id/insumos', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const consultorios = await kv.get('consultorios') || [];
    const consultorio = consultorios.find(cons => cons.id === id);
    
    if (!consultorio) {
      return c.json({ error: 'Consultorio no encontrado' }, 404);
    }
    
    return c.json(consultorio.insumosDisponibles || []);
  } catch (error) {
    console.log('Error obteniendo insumos del consultorio:', error);
    return c.json({ error: 'Error al obtener insumos' }, 500);
  }
});

// Actualizar insumos disponibles en un consultorio
app.put('/make-server-2de2f7f7/consultorios/:id/insumos', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { insumosDisponibles } = await c.req.json();
    
    const consultorios = await kv.get('consultorios') || [];
    const index = consultorios.findIndex(cons => cons.id === id);
    
    if (index === -1) {
      return c.json({ error: 'Consultorio no encontrado' }, 404);
    }
    
    consultorios[index].insumosDisponibles = insumosDisponibles;
    await kv.set('consultorios', consultorios);
    
    return c.json(consultorios[index]);
  } catch (error) {
    console.log('Error actualizando insumos del consultorio:', error);
    return c.json({ error: 'Error al actualizar insumos' }, 500);
  }
});

// Obtener todos los consultorios con información de insumos
app.get('/make-server-2de2f7f7/consultorios', async (c) => {
  try {
    let consultorios = await kv.get('consultorios');
    
    // Si no hay datos o es null/undefined, devolver array vacío
    if (!consultorios) {
      consultorios = [];
    }
    
    // Asegurar que sea un array
    if (!Array.isArray(consultorios)) {
      console.error('Consultorios no es un array:', consultorios);
      consultorios = [];
    }
    
    return c.json(consultorios);
  } catch (error) {
    console.log('Error obteniendo consultorios:', error);
    return c.json([], 200); // Devolver array vacío en lugar de error
  }
});

// Crear o actualizar consultorio
app.post('/make-server-2de2f7f7/consultorios', async (c) => {
  try {
    console.log('POST /consultorios - Recibido');
    const consultorio = await c.req.json();
    console.log('Consultorio recibido:', consultorio);
    
    let consultorios = await kv.get('consultorios');
    console.log('Consultorios actuales en KV:', consultorios);
    
    if (!consultorios || !Array.isArray(consultorios)) {
      consultorios = [];
    }
    
    if (consultorio.id) {
      const index = consultorios.findIndex(cons => cons.id === consultorio.id);
      if (index !== -1) {
        consultorios[index] = consultorio;
        console.log('Consultorio actualizado en posición:', index);
      } else {
        consultorios.push(consultorio);
        console.log('Consultorio agregado (tenía ID pero no existía)');
      }
    } else {
      consultorio.id = consultorios.length > 0 ? Math.max(...consultorios.map(c => c.id)) + 1 : 1;
      consultorios.push(consultorio);
      console.log('Nuevo consultorio creado con ID:', consultorio.id);
    }
    
    await kv.set('consultorios', consultorios);
    console.log('Consultorios guardados en KV');
    
    return c.json(consultorio);
  } catch (error) {
    console.log('Error guardando consultorio:', error);
    return c.json({ error: 'Error al guardar consultorio' }, 500);
  }
});

// Eliminar consultorio
app.delete('/make-server-2de2f7f7/consultorios/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    let consultorios = await kv.get('consultorios');
    
    if (!consultorios || !Array.isArray(consultorios)) {
      return c.json({ error: 'No hay consultorios' }, 404);
    }
    
    const index = consultorios.findIndex(cons => cons.id === id);
    if (index === -1) {
      return c.json({ error: 'Consultorio no encontrado' }, 404);
    }
    
    consultorios.splice(index, 1);
    await kv.set('consultorios', consultorios);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error eliminando consultorio:', error);
    return c.json({ error: 'Error al eliminar consultorio' }, 500);
  }
});

// ==================== INICIALIZAR DATOS DE DEMO ====================

app.post('/make-server-2de2f7f7/inicializar-demo', async (c) => {
  try {
    // Usuarios con roles exactos
    const usuariosDemo = [
      { id: 1, usuario: 'admin', password: 'admin123', rol: 'Administrador', nombre: 'Admin' },
      { id: 2, usuario: 'recepcion', password: 'recep123', rol: 'Recepción', nombre: 'Recepcionista' },
      { id: 3, usuario: 'medico', password: 'medico123', rol: 'Médico', nombre: 'Dr. Médico' }
    ];
    
    // Pacientes demo
    const pacientesDemo = [
      { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', fechaNacimiento: '1980-05-15', correo: 'juan.perez@email.com', telefono: '1123456789', direccion: 'Av. Corrientes 1234' },
      { id: 2, nombre: 'María', apellido: 'González', dni: '23456789', fechaNacimiento: '1975-08-22', correo: 'maria.gonzalez@email.com', telefono: '1134567890', direccion: 'Calle Rivadavia 567' },
      { id: 3, nombre: 'Carlos', apellido: 'López', dni: '34567890', fechaNacimiento: '1990-03-10', correo: 'carlos.lopez@email.com', telefono: '1145678901', direccion: 'Av. Santa Fe 890' }
    ];
    
    // Profesionales demo
    const profesionalesDemo = [
      { id: 1, nombre: 'Carlos', apellido: 'García', especialidad: 'Cardiología', matricula: 'MP1234', horarios: 'Lunes 09:00-13:00' },
      { id: 2, nombre: 'Laura', apellido: 'Rodríguez', especialidad: 'Pediatría', matricula: 'MP2345', horarios: 'Martes 14:00-18:00' },
      { id: 3, nombre: 'Ana', apellido: 'Fernández', especialidad: 'Traumatología', matricula: 'MP3456', horarios: '' },
      { id: 4, nombre: 'Roberto', apellido: 'Gómez', especialidad: 'Neurología', matricula: 'MP4567', horarios: '' }
    ];
    
    // Turnos demo
    const turnosDemo = [
      { id: 1, fecha: '2025-11-05', hora: '09:00', pacienteId: 1, pacienteNombre: 'Juan Pérez', profesionalId: 1, profesionalNombre: 'Dr. García', especialidad: 'Cardiología', estado: 'Confirmado' },
      { id: 2, fecha: '2025-11-05', hora: '10:30', pacienteId: 2, pacienteNombre: 'María González', profesionalId: 2, profesionalNombre: 'Dra. Rodríguez', especialidad: 'Pediatría', estado: 'Acreditado' },
      { id: 3, fecha: '2025-11-06', hora: '11:00', pacienteId: 3, pacienteNombre: 'Carlos López', profesionalId: 1, profesionalNombre: 'Dr. García', especialidad: 'Cardiología', estado: 'Pendiente' }
    ];
    
    // Consultorios demo
    const consultoriosDemo = [
      { id: 1, numero: '101', piso: '1', profesionalId: 1, profesionalNombre: 'Dr. Carlos García', insumosDisponibles: ['Estetoscopio', 'Tensiómetro', 'Electrocardiograma', 'Camilla'] },
      { id: 2, numero: '102', piso: '1', profesionalId: 2, profesionalNombre: 'Dra. Laura Rodríguez', insumosDisponibles: ['Estetoscopio', 'Termómetro', 'Otoscopio', 'Depresor lingual'] },
      { id: 3, numero: '201', piso: '2', profesionalId: 3, profesionalNombre: 'Dra. Ana Fernández', insumosDisponibles: ['Camilla', 'Vendas', 'Guantes descartables'] },
      { id: 4, numero: '202', piso: '2', insumosDisponibles: [] },
      { id: 5, numero: '301', piso: '3', insumosDisponibles: [] }
    ];
    
    await kv.set('usuarios', usuariosDemo);
    await kv.set('pacientes', pacientesDemo);
    await kv.set('profesionales', profesionalesDemo);
    await kv.set('turnos', turnosDemo);
    await kv.set('consultorios', consultoriosDemo);
    await kv.set('historias_clinicas', []);
    
    console.log('Datos de demostración inicializados incluyendo usuarios');
    
    return c.json({ success: true, message: 'Datos de demostración inicializados correctamente' });
  } catch (error) {
    console.log('Error inicializando datos demo:', error);
    return c.json({ error: 'Error al inicializar datos' }, 500);
  }
});

Deno.serve(app.fetch);

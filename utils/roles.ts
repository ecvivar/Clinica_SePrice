// Definición de roles del sistema
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  RECEPCION: 'Recepción',
  MEDICO: 'Médico',
} as const;

export type RolType = typeof ROLES[keyof typeof ROLES];

// Definición de módulos del sistema
export const MODULOS = {
  TURNOS: 'turnos',
  PACIENTES: 'pacientes',
  CONSULTORIOS: 'consultorios',
  PROFESIONALES: 'profesionales',
} as const;

export type ModuloType = typeof MODULOS[keyof typeof MODULOS];

// Definición de sub-módulos
export const SUB_MODULOS = {
  // Pacientes
  ALTA_PACIENTE: 'alta_paciente',
  HISTORIA_CLINICA: 'historia_clinica',
  
  // Profesionales
  ALTA_PROFESIONAL: 'alta_profesional',
  GESTION_HORARIOS: 'gestion_horarios',
  GESTION_HONORARIOS: 'gestion_honorarios',
} as const;

export type SubModuloType = typeof SUB_MODULOS[keyof typeof SUB_MODULOS];

// Configuración de permisos por rol
const PERMISOS_POR_ROL: Record<RolType, {
  modulos: ModuloType[];
  subModulos: SubModuloType[];
}> = {
  [ROLES.ADMINISTRADOR]: {
    modulos: [
      MODULOS.TURNOS,
      MODULOS.PACIENTES,
      MODULOS.CONSULTORIOS,
      MODULOS.PROFESIONALES,
    ],
    subModulos: [
      SUB_MODULOS.ALTA_PACIENTE,
      SUB_MODULOS.HISTORIA_CLINICA,
      SUB_MODULOS.ALTA_PROFESIONAL,
      SUB_MODULOS.GESTION_HORARIOS,
      SUB_MODULOS.GESTION_HONORARIOS,
    ],
  },
  [ROLES.RECEPCION]: {
    modulos: [MODULOS.TURNOS, MODULOS.PACIENTES],
    subModulos: [SUB_MODULOS.ALTA_PACIENTE],
  },
  [ROLES.MEDICO]: {
    modulos: [MODULOS.PACIENTES, MODULOS.PROFESIONALES],
    subModulos: [
      SUB_MODULOS.HISTORIA_CLINICA,
      SUB_MODULOS.GESTION_HONORARIOS,
    ],
  },
};

// Función auxiliar para normalizar el rol (trim y manejo de variaciones)
function normalizarRol(rol: string): RolType | null {
  const rolTrimmed = rol.trim();
  
  // Buscar coincidencia exacta
  if (rolTrimmed === ROLES.ADMINISTRADOR || 
      rolTrimmed === ROLES.RECEPCION || 
      rolTrimmed === ROLES.MEDICO) {
    return rolTrimmed as RolType;
  }
  
  // Mapeo de roles antiguos/alternativos a los roles actuales
  const mapaRoles: Record<string, RolType> = {
    // Roles antiguos del sistema
    'Profesional Médico': ROLES.MEDICO,
    'Profesional Recepción': ROLES.RECEPCION,
    'Profesional Administrador': ROLES.ADMINISTRADOR,
    // Variaciones sin tildes
    'Profesional Medico': ROLES.MEDICO,
    'Profesional Recepcion': ROLES.RECEPCION,
  };
  
  // Buscar en el mapa de roles alternativos
  if (mapaRoles[rolTrimmed]) {
    return mapaRoles[rolTrimmed];
  }
  
  // Buscar coincidencia sin tildes (fallback)
  const rolSinTildes = rolTrimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (rolSinTildes.toLowerCase() === 'administrador') return ROLES.ADMINISTRADOR;
  if (rolSinTildes.toLowerCase() === 'recepcion') return ROLES.RECEPCION;
  if (rolSinTildes.toLowerCase() === 'medico') return ROLES.MEDICO;
  if (rolSinTildes.toLowerCase().includes('medico')) return ROLES.MEDICO;
  if (rolSinTildes.toLowerCase().includes('recepcion')) return ROLES.RECEPCION;
  
  return null;
}

// Funciones de verificación de permisos
export function tieneAccesoModulo(rol: string, modulo: ModuloType): boolean {
  const rolNormalizado = normalizarRol(rol);
  if (!rolNormalizado) {
    console.warn('Rol no reconocido:', rol);
    return false;
  }
  
  const permisos = PERMISOS_POR_ROL[rolNormalizado];
  if (!permisos) {
    console.warn('No hay permisos definidos para el rol:', rolNormalizado);
    return false;
  }
  
  return permisos.modulos.includes(modulo);
}

export function tieneAccesoSubModulo(rol: string, subModulo: SubModuloType): boolean {
  const rolNormalizado = normalizarRol(rol);
  if (!rolNormalizado) return false;
  
  const permisos = PERMISOS_POR_ROL[rolNormalizado];
  if (!permisos) return false;
  return permisos.subModulos.includes(subModulo);
}

export function obtenerModulosPermitidos(rol: string): ModuloType[] {
  const rolNormalizado = normalizarRol(rol);
  if (!rolNormalizado) return [];
  
  const permisos = PERMISOS_POR_ROL[rolNormalizado];
  if (!permisos) return [];
  return permisos.modulos;
}

export function obtenerSubModulosPermitidos(rol: string): SubModuloType[] {
  const rolNormalizado = normalizarRol(rol);
  if (!rolNormalizado) return [];
  
  const permisos = PERMISOS_POR_ROL[rolNormalizado];
  if (!permisos) return [];
  return permisos.subModulos;
}

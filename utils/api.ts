import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-2de2f7f7`;

interface ApiOptions {
  method?: string;
  body?: any;
}

// Estado del backend
let backendAvailable: boolean | null = null;
let backendCheckPromise: Promise<boolean> | null = null;

// Verificar si el backend está disponible
async function checkBackendAvailability(): Promise<boolean> {
  if (backendAvailable !== null) {
    return backendAvailable;
  }
  
  if (backendCheckPromise) {
    return backendCheckPromise;
  }
  
  backendCheckPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      backendAvailable = response.ok;
      
      if (!backendAvailable) {
        console.info('💡 Sistema funcionando en modo local (backend no disponible)');
      }
      
      return backendAvailable;
    } catch (error) {
      backendAvailable = false;
      console.info('💡 Sistema funcionando en modo local (backend no disponible)');
      return false;
    } finally {
      backendCheckPromise = null;
    }
  })();
  
  return backendCheckPromise;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body } = options;
  
  // Verificar disponibilidad del backend
  const isAvailable = await checkBackendAvailability();
  if (!isAvailable) {
    throw new Error('BACKEND_OFFLINE');
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      throw new Error(error.error || 'Error en la petición');
    }
    
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Error parsing JSON:', text);
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    // Si hay un error de red, marcar backend como no disponible
    if (error instanceof TypeError) {
      backendAvailable = false;
    }
    throw error;
  }
}

// ==================== AUTH ====================

export const authApi = {
  login: async (usuario: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: { usuario, password }
    });
  },
  
  reinicializarUsuarios: async () => {
    return apiCall('/auth/reinicializar-usuarios', {
      method: 'POST'
    });
  }
};

// ==================== PACIENTES ====================

export const pacientesApi = {
  getAll: async () => {
    return apiCall('/pacientes');
  },
  
  create: async (paciente: any) => {
    return apiCall('/pacientes', {
      method: 'POST',
      body: paciente
    });
  }
};

// ==================== PROFESIONALES ====================

export const profesionalesApi = {
  getAll: async () => {
    return apiCall('/profesionales');
  },
  
  create: async (profesional: any) => {
    return apiCall('/profesionales', {
      method: 'POST',
      body: profesional
    });
  },
  
  updateHorarios: async (id: number, horarios: any[]) => {
    return apiCall(`/profesionales/${id}/horarios`, {
      method: 'PUT',
      body: { horarios }
    });
  },
  
  getInsumos: async (id: number) => {
    return apiCall(`/profesionales/${id}/insumos`);
  },
  
  updateInsumos: async (id: number, insumos: string[]) => {
    return apiCall(`/profesionales/${id}/insumos`, {
      method: 'PUT',
      body: { insumos }
    });
  }
};

// ==================== TURNOS ====================

export const turnosApi = {
  getAll: async () => {
    return apiCall('/turnos');
  },
  
  create: async (turno: any) => {
    return apiCall('/turnos', {
      method: 'POST',
      body: turno
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/turnos/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  cancelar: async (id: number, motivo: string, usuario: string) => {
    return apiCall(`/turnos/${id}/cancelar`, {
      method: 'POST',
      body: { motivo, usuario }
    });
  },
  
  acreditar: async (id: number) => {
    return apiCall(`/turnos/${id}/acreditar`, {
      method: 'POST'
    });
  }
};

// ==================== CONSULTORIOS ====================

export const consultoriosApi = {
  getAll: async () => {
    return apiCall('/consultorios');
  },
  
  save: async (consultorio: any) => {
    return apiCall('/consultorios', {
      method: 'POST',
      body: consultorio
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/consultorios/${id}`, {
      method: 'DELETE'
    });
  },
  
  getInsumos: async (id: number) => {
    return apiCall(`/consultorios/${id}/insumos`);
  },
  
  updateInsumos: async (id: number, insumosDisponibles: string[]) => {
    return apiCall(`/consultorios/${id}/insumos`, {
      method: 'PUT',
      body: { insumosDisponibles }
    });
  }
};

// ==================== HISTORIA CLÍNICA ====================

export const historiaClinicaApi = {
  getAll: async () => {
    return apiCall('/historia-clinica');
  },
  
  getByPaciente: async (pacienteId: number) => {
    return apiCall(`/historia-clinica/paciente/${pacienteId}`);
  },
  
  create: async (registro: any) => {
    return apiCall('/historia-clinica', {
      method: 'POST',
      body: registro
    });
  }
};

// ==================== INICIALIZACIÓN ====================

export const inicializarDemo = async () => {
  return apiCall('/inicializar-demo', {
    method: 'POST'
  });
};

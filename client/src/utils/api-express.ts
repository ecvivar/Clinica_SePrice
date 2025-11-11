// API Client para backend Express
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

// Estado del backend
let backendAvailable: boolean | null = null;
let backendCheckPromise: Promise<boolean> | null = null;

// Token JWT
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

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
  const { method = 'GET', body, headers = {} } = options;
  
  // Verificar disponibilidad del backend
  const isAvailable = await checkBackendAvailability();
  if (!isAvailable) {
    throw new Error('BACKEND_OFFLINE');
  }
  
  try {
    const token = getAuthToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { message: response.statusText };
      }
      throw new Error(error.message || 'Error en la solicitud');
    }
    
    return await response.json();
  } catch (error: any) {
    if (error.message === 'BACKEND_OFFLINE') {
      throw error;
    }
    console.error('Error en API call:', error);
    throw error;
  }
}

// ==================== Autenticación ====================

export const authApi = {
  login: async (usuario: string, password: string) => {
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: { usuario, password }
      });
      
      if (result.success && result.token) {
        setAuthToken(result.token);
      }
      
      return result;
    } catch (error: any) {
      if (error.message === 'BACKEND_OFFLINE') {
        throw error;
      }
      return { success: false, message: error.message };
    }
  },
  
  verify: async () => {
    return apiCall('/auth/verify');
  },
  
  getUsuarios: async () => {
    return apiCall('/auth/usuarios');
  },
  
  createUsuario: async (data: any) => {
    return apiCall('/auth/usuarios', {
      method: 'POST',
      body: data
    });
  }
};

// ==================== Pacientes ====================

export const pacientesApi = {
  getAll: async () => {
    return apiCall('/pacientes');
  },
  
  getById: async (id: number) => {
    return apiCall(`/pacientes/${id}`);
  },
  
  create: async (data: any) => {
    return apiCall('/pacientes', {
      method: 'POST',
      body: data
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/pacientes/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/pacientes/${id}`, {
      method: 'DELETE'
    });
  },
  
  buscar: async (termino: string) => {
    return apiCall(`/pacientes/buscar/${termino}`);
  }
};

// ==================== Profesionales ====================

export const profesionalesApi = {
  getAll: async () => {
    return apiCall('/profesionales');
  },
  
  getById: async (id: number) => {
    return apiCall(`/profesionales/${id}`);
  },
  
  create: async (data: any) => {
    return apiCall('/profesionales', {
      method: 'POST',
      body: data
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/profesionales/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/profesionales/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateHorarios: async (id: number, horarios: any[]) => {
    return apiCall(`/profesionales/${id}/horarios`, {
      method: 'PATCH',
      body: { horarios }
    });
  },
  
  updateHonorarios: async (id: number, honorarios: number) => {
    return apiCall(`/profesionales/${id}/honorarios`, {
      method: 'PATCH',
      body: { honorarios }
    });
  }
};

// ==================== Turnos ====================

export const turnosApi = {
  getAll: async (filters?: { fecha?: string; profesional_id?: number; estado?: string }) => {
    const params = new URLSearchParams();
    if (filters?.fecha) params.append('fecha', filters.fecha);
    if (filters?.profesional_id) params.append('profesional_id', filters.profesional_id.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    
    const queryString = params.toString();
    return apiCall(`/turnos${queryString ? '?' + queryString : ''}`);
  },
  
  getById: async (id: number) => {
    return apiCall(`/turnos/${id}`);
  },
  
  create: async (data: any) => {
    return apiCall('/turnos', {
      method: 'POST',
      body: data
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/turnos/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/turnos/${id}`, {
      method: 'DELETE'
    });
  },
  
  acreditar: async (id: number) => {
    return apiCall(`/turnos/${id}/acreditar`, {
      method: 'PATCH'
    });
  },
  
  cancelar: async (id: number, motivo: string, usuario: string) => {
    return apiCall(`/turnos/${id}/cancelar`, {
      method: 'PATCH',
      body: { motivo_cancelacion: motivo, usuario_cancelacion: usuario }
    });
  },
  
  getByPaciente: async (paciente_id: number) => {
    return apiCall(`/turnos/paciente/${paciente_id}`);
  }
};

// ==================== Consultorios ====================

export const consultoriosApi = {
  getAll: async () => {
    return apiCall('/consultorios');
  },
  
  getById: async (id: number) => {
    return apiCall(`/consultorios/${id}`);
  },
  
  create: async (data: any) => {
    return apiCall('/consultorios', {
      method: 'POST',
      body: data
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/consultorios/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/consultorios/${id}`, {
      method: 'DELETE'
    });
  },
  
  asignarProfesional: async (id: number, profesional_id: number) => {
    return apiCall(`/consultorios/${id}/asignar-profesional`, {
      method: 'PATCH',
      body: { profesional_id }
    });
  }
};

// ==================== Historia Clínica ====================

export const historiaClinicaApi = {
  getAll: async () => {
    return apiCall('/historia-clinica');
  },
  
  getById: async (id: number) => {
    return apiCall(`/historia-clinica/${id}`);
  },
  
  getByPaciente: async (paciente_id: number) => {
    return apiCall(`/historia-clinica/paciente/${paciente_id}`);
  },
  
  create: async (data: any) => {
    return apiCall('/historia-clinica', {
      method: 'POST',
      body: data
    });
  },
  
  update: async (id: number, data: any) => {
    return apiCall(`/historia-clinica/${id}`, {
      method: 'PUT',
      body: data
    });
  },
  
  delete: async (id: number) => {
    return apiCall(`/historia-clinica/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== Health ====================

export const healthApi = {
  check: async () => {
    return apiCall('/health');
  },
  
  fullCheck: async () => {
    return apiCall('/health/full');
  }
};

// Exportar función para resetear el estado del backend
export function resetBackendCheck() {
  backendAvailable = null;
  backendCheckPromise = null;
}

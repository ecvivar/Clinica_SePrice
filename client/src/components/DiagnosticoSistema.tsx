import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Database,
  RefreshCw,
  Users,
  Calendar,
  Stethoscope,
  Building2,
  FileText,
  Activity
} from 'lucide-react';
import { authApi, pacientesApi, profesionalesApi, turnosApi, consultoriosApi, historiaClinicaApi, inicializarDemo } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DiagnosticoSistemaProps {
  onBack: () => void;
}

interface TestResult {
  nombre: string;
  estado: 'success' | 'error' | 'pending' | 'loading';
  mensaje?: string | undefined;
  detalles?: any | undefined;
}

export function DiagnosticoSistema({ onBack }: DiagnosticoSistemaProps) {
  const [resultados, setResultados] = useState<TestResult[]>([]);
  const [testando, setTestando] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  const actualizarResultado = (nombre: string, estado: TestResult['estado'], mensaje?: string, detalles?: any) => {
    setResultados(prev => {
      const index = prev.findIndex(r => r.nombre === nombre);
      const nuevoResultado = { nombre, estado, mensaje, detalles };
      
      if (index >= 0) {
        const nuevos = [...prev];
        nuevos[index] = nuevoResultado;
        return nuevos;
      } else {
        return [...prev, nuevoResultado];
      }
    });
  };

  const verificarBackend = async () => {
    setBackendStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2de2f7f7/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setBackendStatus('online');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch (error) {
      setBackendStatus('offline');
      return false;
    }
  };

  const ejecutarPruebas = async () => {
    setTestando(true);
    setResultados([]);

    // 1. Verificar Backend
    actualizarResultado('Backend Status', 'loading', 'Verificando conexión...');
    const backendOnline = await verificarBackend();
    
    if (!backendOnline) {
      actualizarResultado('Backend Status', 'error', 'Backend no disponible', {
        mensaje: 'El sistema funcionará en modo local con datos mock'
      });
      setTestando(false);
      return;
    }
    
    actualizarResultado('Backend Status', 'success', 'Backend conectado correctamente');

    // 2. Test Auth - Login
    actualizarResultado('Autenticación', 'loading', 'Probando login...');
    try {
      const loginResult = await authApi.login('admin', 'admin123');
      actualizarResultado('Autenticación', 'success', 'Login funcionando', loginResult);
    } catch (error: any) {
      actualizarResultado('Autenticación', 'error', 'Error en login', { error: error.message });
    }

    // 3. Test Pacientes
    actualizarResultado('API Pacientes', 'loading', 'Obteniendo pacientes...');
    try {
      const pacientes = await pacientesApi.getAll();
      actualizarResultado('API Pacientes', 'success', `${pacientes.length} pacientes encontrados`, { 
        cantidad: pacientes.length,
        muestra: pacientes.slice(0, 3)
      });
    } catch (error: any) {
      actualizarResultado('API Pacientes', 'error', 'Error al obtener pacientes', { error: error.message });
    }

    // 4. Test Profesionales
    actualizarResultado('API Profesionales', 'loading', 'Obteniendo profesionales...');
    try {
      const profesionales = await profesionalesApi.getAll();
      actualizarResultado('API Profesionales', 'success', `${profesionales.length} profesionales encontrados`, {
        cantidad: profesionales.length,
        muestra: profesionales.slice(0, 3)
      });
    } catch (error: any) {
      actualizarResultado('API Profesionales', 'error', 'Error al obtener profesionales', { error: error.message });
    }

    // 5. Test Turnos
    actualizarResultado('API Turnos', 'loading', 'Obteniendo turnos...');
    try {
      const turnos = await turnosApi.getAll();
      actualizarResultado('API Turnos', 'success', `${turnos.length} turnos encontrados`, {
        cantidad: turnos.length,
        muestra: turnos.slice(0, 3)
      });
    } catch (error: any) {
      actualizarResultado('API Turnos', 'error', 'Error al obtener turnos', { error: error.message });
    }

    // 6. Test Consultorios
    actualizarResultado('API Consultorios', 'loading', 'Obteniendo consultorios...');
    try {
      const consultorios = await consultoriosApi.getAll();
      actualizarResultado('API Consultorios', 'success', `${consultorios.length} consultorios encontrados`, {
        cantidad: consultorios.length,
        muestra: consultorios
      });
    } catch (error: any) {
      actualizarResultado('API Consultorios', 'error', 'Error al obtener consultorios', { error: error.message });
    }

    // 7. Test Historia Clínica
    actualizarResultado('API Historia Clínica', 'loading', 'Obteniendo historias clínicas...');
    try {
      const historias = await historiaClinicaApi.getAll();
      actualizarResultado('API Historia Clínica', 'success', `${historias.length} registros encontrados`, {
        cantidad: historias.length
      });
    } catch (error: any) {
      actualizarResultado('API Historia Clínica', 'error', 'Error al obtener historias', { error: error.message });
    }

    setTestando(false);
  };

  const reinicializarDatos = async () => {
    if (!confirm('¿Estás seguro de que quieres reinicializar todos los datos de prueba? Esto eliminará todos los datos actuales.')) {
      return;
    }

    setTestando(true);
    try {
      await inicializarDemo();
      alert('Datos reinicializados correctamente. Se han creado usuarios, pacientes y profesionales de prueba.');
      await ejecutarPruebas();
    } catch (error: any) {
      alert('Error al reinicializar datos: ' + error.message);
    } finally {
      setTestando(false);
    }
  };

  const reinicializarUsuarios = async () => {
    if (!confirm('¿Estás seguro de que quieres reinicializar los usuarios? Esto restablecerá las contraseñas a los valores por defecto.')) {
      return;
    }

    setTestando(true);
    try {
      await authApi.reinicializarUsuarios();
      alert('Usuarios reinicializados correctamente.');
    } catch (error: any) {
      alert('Error al reinicializar usuarios: ' + error.message);
    } finally {
      setTestando(false);
    }
  };

  const getIcono = (nombre: string) => {
    if (nombre.includes('Backend')) return Database;
    if (nombre.includes('Auth')) return Users;
    if (nombre.includes('Pacientes')) return Users;
    if (nombre.includes('Profesionales')) return Stethoscope;
    if (nombre.includes('Turnos')) return Calendar;
    if (nombre.includes('Consultorios')) return Building2;
    if (nombre.includes('Historia')) return FileText;
    return Activity;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-blue-600 text-2xl mb-2">Diagnóstico del Sistema</h1>
              <p className="text-gray-600">Herramienta de prueba y verificación del backend</p>
            </div>
            <Button onClick={onBack} variant="outline">Volver</Button>
          </div>

          {/* Información de Conexión */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Estado de Conexión
              </CardTitle>
              <CardDescription>
                Información del backend de Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado del Backend:</span>
                  <Badge 
                    variant={backendStatus === 'online' ? 'default' : backendStatus === 'offline' ? 'destructive' : 'secondary'}
                    className="flex items-center gap-2"
                  >
                    {backendStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {backendStatus === 'online' && <CheckCircle2 className="h-3 w-3" />}
                    {backendStatus === 'offline' && <XCircle className="h-3 w-3" />}
                    {backendStatus === 'checking' ? 'Verificando...' : backendStatus === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <Separator />
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project ID:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{projectId}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endpoint:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-xs">
                      https://{projectId}.supabase.co/functions/v1/make-server-2de2f7f7
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Key:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-xs">
                      {publicAnonKey.substring(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Button 
              onClick={ejecutarPruebas} 
              disabled={testando}
              className="w-full"
            >
              {testando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Ejecutar Todas las Pruebas
                </>
              )}
            </Button>

            <Button 
              onClick={reinicializarDatos} 
              disabled={testando}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reinicializar Datos Demo
            </Button>

            <Button 
              onClick={reinicializarUsuarios} 
              disabled={testando}
              variant="outline"
              className="w-full"
            >
              <Users className="mr-2 h-4 w-4" />
              Reinicializar Usuarios
            </Button>
          </div>

          {/* Resultados de Pruebas */}
          {resultados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados de las Pruebas</CardTitle>
                <CardDescription>
                  Estado de cada componente del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resultados.map((resultado, index) => {
                    const Icono = getIcono(resultado.nombre);
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Icono className="h-5 w-5 text-gray-500" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{resultado.nombre}</span>
                                {resultado.estado === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                {resultado.estado === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                                {resultado.estado === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                              </div>
                              {resultado.mensaje && (
                                <p className="text-sm text-gray-600 mt-1">{resultado.mensaje}</p>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              resultado.estado === 'success' ? 'default' : 
                              resultado.estado === 'error' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {resultado.estado === 'loading' ? 'Probando...' : resultado.estado}
                          </Badge>
                        </div>

                        {resultado.detalles && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                              Ver detalles
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(resultado.detalles, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Usuarios por Defecto */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Usuarios de Prueba</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                <div><strong>Administrador:</strong> usuario: <code>admin</code> / contraseña: <code>admin123</code></div>
                <div><strong>Recepción:</strong> usuario: <code>recepcion</code> / contraseña: <code>recep123</code></div>
                <div><strong>Médico:</strong> usuario: <code>medico</code> / contraseña: <code>medico123</code></div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Guía de Modo Local */}
          {backendStatus === 'offline' && (
            <Alert className="mt-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Modo Local Activado</AlertTitle>
              <AlertDescription className="text-amber-800">
                El sistema está funcionando con datos mock en localStorage. Para conectar con Supabase:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Verifica que el Project ID y API Key en <code>/utils/supabase/info.tsx</code> sean correctos</li>
                  <li>Asegúrate de que la función edge esté desplegada en Supabase</li>
                  <li>Verifica que no haya problemas de CORS o red</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

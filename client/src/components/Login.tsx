import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { authApi } from '../utils/api';
import { InfoRoles } from './InfoRoles';

interface LoginProps {
  onLogin: (usuario: string, rol: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(usuario, password);
      if (response.success) {
        onLogin(response.usuario.usuario, response.usuario.rol);
      } else {
        setError('Usuario o contraseña incorrectos. Por favor, intente nuevamente.');
      }
    } catch (err: any) {
      // Si el backend no está disponible, usar autenticación local
      if (err?.message === 'BACKEND_OFFLINE') {
        // Usuarios locales de demostración
        const usuariosLocales = [
          { usuario: 'admin', password: 'admin123', rol: 'Administrador' },
          { usuario: 'recepcion', password: 'recep123', rol: 'Recepción' },
          { usuario: 'medico', password: 'medico123', rol: 'Médico' }
        ];
        
        const usuarioLocal = usuariosLocales.find(
          u => u.usuario === usuario && u.password === password
        );
        
        if (usuarioLocal) {
          onLogin(usuarioLocal.usuario, usuarioLocal.rol);
        } else {
          setError('Usuario o contraseña incorrectos. Por favor, intente nuevamente.');
        }
      } else {
        console.error('Error en login:', err);
        setError('Usuario o contraseña incorrectos. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setTimeout(() => {
      setShowForgotPassword(false);
    }, 3000);
  };

  const handleReinicializarUsuarios = async () => {
    setLoading(true);
    try {
      await authApi.reinicializarUsuarios();
      setError('');
      alert('Usuarios reinicializados correctamente. Ahora puedes iniciar sesión.');
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        setError('');
        alert('Sistema en modo local. Los usuarios de demostración están disponibles:\n\nAdmin: admin/admin123\nRecepción: recepcion/recep123\nMédico: medico/medico123');
      } else {
        console.error('Error reinicializando usuarios:', err);
        setError('Error al reinicializar usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-blue-600 text-3xl mb-2">Clínica SePrise</h1>
            <p className="text-gray-600">P1 - Sistema de Gestión</p>
            <div className="mt-4 flex justify-center">
              <InfoRoles />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingrese su usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="mt-1"
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showForgotPassword && (
              <Alert>
                <AlertDescription>
                  Contacte al administrador del sistema para recuperar su contraseña.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:underline text-sm block w-full"
              >
                ¿Olvidaste tu contraseña?
              </button>
              <button
                type="button"
                onClick={handleReinicializarUsuarios}
                className="text-gray-600 hover:underline text-xs block w-full"
                disabled={loading}
              >
                🔄 Reinicializar usuarios del sistema
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-3">
              <p className="font-semibold mb-2">Usuarios de prueba:</p>
              <div className="space-y-2">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="font-medium text-blue-700">Administrador</p>
                  <p className="text-gray-600">Usuario: admin / admin123</p>
                  <p className="text-xs text-gray-500">Acceso: Todo el sistema</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="font-medium text-green-700">Recepción</p>
                  <p className="text-gray-600">Usuario: recepcion / recep123</p>
                  <p className="text-xs text-gray-500">Acceso: Turnos y alta de pacientes</p>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <p className="font-medium text-purple-700">Médico</p>
                  <p className="text-gray-600">Usuario: medico / medico123</p>
                  <p className="text-xs text-gray-500">Acceso: Historia clínica y honorarios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

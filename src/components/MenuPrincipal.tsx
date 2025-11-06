import { Button } from './ui/button';
import { tieneAccesoModulo, MODULOS, ROLES } from '../utils/roles';
import { Calendar, Users, Building2, UserCog, Shield, ShieldCheck, UserRound, Activity } from 'lucide-react';

type Screen = 
  | 'menu'
  | 'turnos'
  | 'pacientes'
  | 'profesionales'
  | 'consultorios'
  | 'diagnostico';

interface MenuPrincipalProps {
  onNavigate: (screen: Screen) => void;
  usuario: string;
  rol: string;
  onLogout: () => void;
}

interface MenuButton {
  screen: Screen;
  label: string;
  modulo: string;
  icon: React.ReactNode;
}

export function MenuPrincipal({ onNavigate, usuario, rol, onLogout }: MenuPrincipalProps) {
  const menuButtons: MenuButton[] = [
    {
      screen: 'turnos',
      label: 'Turnos',
      modulo: MODULOS.TURNOS,
      icon: <Calendar className="mr-2 h-5 w-5" />
    },
    {
      screen: 'pacientes',
      label: 'Pacientes',
      modulo: MODULOS.PACIENTES,
      icon: <Users className="mr-2 h-5 w-5" />
    },
    {
      screen: 'consultorios',
      label: 'Consultorios',
      modulo: MODULOS.CONSULTORIOS,
      icon: <Building2 className="mr-2 h-5 w-5" />
    },
    {
      screen: 'profesionales',
      label: 'Profesionales',
      modulo: MODULOS.PROFESIONALES,
      icon: <UserCog className="mr-2 h-5 w-5" />
    },
  ];

  const botonesPermitidos = menuButtons.filter(button => 
    tieneAccesoModulo(rol, button.modulo as any)
  );

  const getRolBadge = () => {
    if (rol === ROLES.ADMINISTRADOR) {
      return (
        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
          <Shield className="h-3 w-3" />
          <span>Acceso Total</span>
        </div>
      );
    } else if (rol === ROLES.RECEPCION) {
      return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
          <ShieldCheck className="h-3 w-3" />
          <span>Turnos y Pacientes</span>
        </div>
      );
    } else if (rol === ROLES.MEDICO) {
      return (
        <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
          <UserRound className="h-3 w-3" />
          <span>Historia y Honorarios</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="w-full max-w-4xl p-8">
        <div className="bg-white rounded-lg shadow-lg p-12">
          <div className="flex justify-between items-center mb-12">
            <div className="text-left">
              <span className="text-blue-600 text-sm">Bienvenido {usuario}</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-gray-600 text-xs">{rol}</div>
                {getRolBadge()}
              </div>
            </div>
            <h1 className="text-blue-600 text-3xl">Clínica SePrise</h1>
            <button 
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-1 rounded text-sm hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>

          <h2 className="text-blue-600 text-xl mb-8 text-center">Menú Principal</h2>

          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {botonesPermitidos.map((button) => (
              <Button
                key={button.screen}
                onClick={() => onNavigate(button.screen)}
                className="bg-gray-800 hover:bg-gray-700 text-white h-12 flex items-center justify-center"
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>

          {botonesPermitidos.length === 0 && (
            <div className="text-center mt-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-red-600 mb-2">⚠️ No tienes permisos asignados</p>
                <p className="text-gray-600">Contacta al administrador del sistema.</p>
              </div>
            </div>
          )}

          {/* Botón de Diagnóstico del Sistema */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={() => onNavigate('diagnostico')}
              variant="outline"
              className="w-full max-w-md mx-auto flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600"
            >
              <Activity className="mr-2 h-4 w-4" />
              Diagnóstico del Sistema
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Verificar estado de conexión y probar funcionalidades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';

import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { MenuPrincipal } from './components/MenuPrincipal';
import { AgendaTurnos } from './components/AgendaTurnos';
import { RegistroTurno } from './components/RegistroTurno';
import { AcreditacionTurno } from './components/AcreditacionTurno';
import { GestionPacientes } from './components/GestionPacientes';
import { GestionProfesionales } from './components/GestionProfesionales';
import { GestionConsultorios } from './components/GestionConsultorios';
import { DiagnosticoSistema } from './components/DiagnosticoSistema';
import { inicializarDemo } from './utils/api';
import { Toaster } from './components/ui/sonner';
import { tieneAccesoModulo, MODULOS } from './utils/roles';
import { toast } from 'sonner';

type Screen = 
  | 'login'
  | 'menu'
  | 'turnos'
  | 'registro-turno'
  | 'acreditacion-turno'
  | 'pacientes'
  | 'profesionales'
  | 'consultorios'
  | 'diagnostico';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [usuario, setUsuario] = useState('');
  const [rol, setRol] = useState('');
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    // Inicializar datos de demostración al cargar la app
    const inicializar = async () => {
      if (!inicializado) {
        try {
          await inicializarDemo();
          setInicializado(true);
        } catch (err: any) {
          // Silenciar error de backend offline
          if (err?.message !== 'BACKEND_OFFLINE') {
            console.error('Error inicializando datos demo:', err);
          }
          setInicializado(true);
        }
      }
    };
    inicializar();
  }, []);

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(<App />);

  const handleLogin = (user: string, userRol: string) => {
    setUsuario(user);
    setRol(userRol);
    setCurrentScreen('menu');
  };

  const handleLogout = () => {
    setUsuario('');
    setRol('');
    setCurrentScreen('login');
  };

  // Función para navegar con validación de permisos
  const navegarConPermiso = (screen: Screen) => {
    // Mapeo de pantallas a módulos
    const screenToModule: Record<string, string> = {
      'turnos': MODULOS.TURNOS,
      'registro-turno': MODULOS.TURNOS,
      'acreditacion-turno': MODULOS.TURNOS,
      'pacientes': MODULOS.PACIENTES,
      'profesionales': MODULOS.PROFESIONALES,
      'consultorios': MODULOS.CONSULTORIOS,
    };

    const modulo = screenToModule[screen];
    
    if (modulo && !tieneAccesoModulo(rol, modulo as any)) {
      toast.error('Acceso denegado', {
        description: 'No tienes permisos para acceder a este módulo'
      });
      return;
    }

    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (currentScreen === 'login') {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case 'menu':
        return (
          <MenuPrincipal 
            onNavigate={navegarConPermiso} 
            usuario={usuario}
            rol={rol}
            onLogout={handleLogout}
          />
        );
      case 'turnos':
        if (!tieneAccesoModulo(rol, MODULOS.TURNOS)) {
          setCurrentScreen('menu');
          return null;
        }
        return (
          <AgendaTurnos 
            onBack={() => setCurrentScreen('menu')}
            onNuevoTurno={() => navegarConPermiso('registro-turno')}
            onAcreditar={() => navegarConPermiso('acreditacion-turno')}
          />
        );
      case 'registro-turno':
        if (!tieneAccesoModulo(rol, MODULOS.TURNOS)) {
          setCurrentScreen('menu');
          return null;
        }
        return <RegistroTurno onBack={() => setCurrentScreen('turnos')} />;
      case 'acreditacion-turno':
        if (!tieneAccesoModulo(rol, MODULOS.TURNOS)) {
          setCurrentScreen('menu');
          return null;
        }
        return <AcreditacionTurno onBack={() => setCurrentScreen('turnos')} />;
      case 'pacientes':
        if (!tieneAccesoModulo(rol, MODULOS.PACIENTES)) {
          setCurrentScreen('menu');
          return null;
        }
        return <GestionPacientes onBack={() => setCurrentScreen('menu')} rol={rol} />;
      case 'profesionales':
        if (!tieneAccesoModulo(rol, MODULOS.PROFESIONALES)) {
          setCurrentScreen('menu');
          return null;
        }
        return <GestionProfesionales onBack={() => setCurrentScreen('menu')} rol={rol} />;
      case 'consultorios':
        if (!tieneAccesoModulo(rol, MODULOS.CONSULTORIOS)) {
          setCurrentScreen('menu');
          return null;
        }
        return <GestionConsultorios onBack={() => setCurrentScreen('menu')} />;
      case 'diagnostico':
        return <DiagnosticoSistema onBack={() => setCurrentScreen('menu')} />;
      default:
        return (
          <MenuPrincipal 
            onNavigate={navegarConPermiso}
            usuario={usuario}
            rol={rol}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderScreen()}
      <Toaster />
    </div>
  );
}

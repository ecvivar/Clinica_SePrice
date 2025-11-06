import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle2, UserPlus, Search, AlertCircle } from 'lucide-react';
import { pacientesApi } from '../utils/api';

interface AltaPacienteProps {
  onBack: () => void;
  hideHeader?: boolean;
}

export function AltaPaciente({ onBack, hideHeader = false }: AltaPacienteProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const data = await pacientesApi.getAll();
      setPacientes(data);
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        // Cargar datos mock desde localStorage
        const pacientesLocal = localStorage.getItem('pacientes_mock');
        if (pacientesLocal) {
          setPacientes(JSON.parse(pacientesLocal));
        } else {
          // Datos mock iniciales
          const pacientesMock = [
            {
              id: 1,
              nombre: 'María',
              apellido: 'González',
              dni: '35123456',
              fechaNacimiento: '1990-05-15',
              correo: 'maria.gonzalez@email.com',
              telefono: '1145678901',
              direccion: 'Av. Corrientes 1234'
            },
            {
              id: 2,
              nombre: 'Juan',
              apellido: 'Pérez',
              dni: '28987654',
              fechaNacimiento: '1985-08-22',
              correo: 'juan.perez@email.com',
              telefono: '1156789012',
              direccion: 'Calle Rivadavia 567'
            },
            {
              id: 3,
              nombre: 'Ana',
              apellido: 'Martínez',
              dni: '42345678',
              fechaNacimiento: '1998-12-10',
              correo: 'ana.martinez@email.com',
              telefono: '1167890123',
              direccion: 'San Martín 890'
            }
          ];
          localStorage.setItem('pacientes_mock', JSON.stringify(pacientesMock));
          setPacientes(pacientesMock);
        }
      } else {
        console.error('Error cargando pacientes:', err);
      }
    }
  };

  const handleGuardar = async () => {
    setError('');

    // Validaciones
    if (!nombre || !apellido || !dni || !fechaNacimiento) {
      setError('Los campos Nombre, Apellido, DNI y Fecha de Nacimiento son obligatorios');
      return;
    }

    // Validar formato de correo
    if (correo && !correo.includes('@')) {
      setError('El formato del correo electrónico no es válido');
      return;
    }

    setLoading(true);
    try {
      await pacientesApi.create({
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        correo,
        telefono,
        direccion
      });

      setShowSuccess(true);
      await cargarPacientes();
      
      setTimeout(() => {
        setShowSuccess(false);
        // Limpiar formulario
        setNombre('');
        setApellido('');
        setDni('');
        setFechaNacimiento('');
        setCorreo('');
        setTelefono('');
        setDireccion('');
      }, 2000);
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        // Guardar en modo local
        const pacientesLocal = localStorage.getItem('pacientes_mock');
        const pacientesList = pacientesLocal ? JSON.parse(pacientesLocal) : [];
        
        const nuevoPaciente = {
          id: pacientesList.length > 0 ? Math.max(...pacientesList.map((p: any) => p.id)) + 1 : 1,
          nombre,
          apellido,
          dni,
          fechaNacimiento,
          correo,
          telefono,
          direccion
        };
        
        pacientesList.push(nuevoPaciente);
        localStorage.setItem('pacientes_mock', JSON.stringify(pacientesList));
        
        setShowSuccess(true);
        await cargarPacientes();
        
        setTimeout(() => {
          setShowSuccess(false);
          // Limpiar formulario
          setNombre('');
          setApellido('');
          setDni('');
          setFechaNacimiento('');
          setCorreo('');
          setTelefono('');
          setDireccion('');
        }, 2000);
      } else {
        console.error('Error guardando paciente:', err);
        setError(err.message || 'Error al guardar el paciente');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setNombre('');
    setApellido('');
    setDni('');
    setFechaNacimiento('');
    setCorreo('');
    setTelefono('');
    setDireccion('');
    setError('');
  };

  const pacientesFiltrados = busqueda
    ? pacientes.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.dni.includes(busqueda)
      )
    : pacientes;

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-gray-100 p-8"}>
      <div className={hideHeader ? "" : "max-w-7xl mx-auto"}>
        <div className={hideHeader ? "" : "bg-white rounded-lg shadow-lg p-8"}>
          {!hideHeader && (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">P4 - Alta de Paciente</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
          )}

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Paciente registrado exitosamente
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Registrar Nuevo Paciente
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ingrese nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      placeholder="Ingrese apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      placeholder="Sin puntos ni guiones"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="Ej: 1123456789"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    placeholder="Calle, número, piso, depto..."
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="text-sm text-gray-500">
                  * Campos obligatorios
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGuardar}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    onClick={handleCancelar}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="mb-2">Pacientes Registrados</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, apellido o DNI..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Contacto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacientesFiltrados.map((paciente) => (
                      <TableRow key={paciente.id}>
                        <TableCell>
                          {paciente.nombre} {paciente.apellido}
                        </TableCell>
                        <TableCell>{paciente.dni}</TableCell>
                        <TableCell>{calcularEdad(paciente.fechaNacimiento)} años</TableCell>
                        <TableCell className="text-sm">
                          {paciente.telefono && <div>{paciente.telefono}</div>}
                          {paciente.correo && <div className="text-gray-500">{paciente.correo}</div>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Total de pacientes: {pacientes.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

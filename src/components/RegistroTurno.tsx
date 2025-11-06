import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { pacientesApi, profesionalesApi, turnosApi } from '../utils/api';

interface RegistroTurnoProps {
  onBack: () => void;
}

const horariosDisponibles = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

// Datos de demostración para modo local
const pacientesMock = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', obraSocial: 'OSDE', telefono: '011-1234-5678' },
  { id: 2, nombre: 'María', apellido: 'González', dni: '23456789', obraSocial: 'Swiss Medical', telefono: '011-2345-6789' },
  { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', dni: '34567890', obraSocial: 'Galeno', telefono: '011-3456-7890' },
  { id: 4, nombre: 'Ana', apellido: 'Martínez', dni: '45678901', obraSocial: 'Medicus', telefono: '011-4567-8901' },
];

const profesionalesMock = [
  { id: 1, nombre: 'Dr. Luis', apellido: 'Fernández', especialidad: 'Cardiología', matricula: 'MP1234' },
  { id: 2, nombre: 'Dra. Laura', apellido: 'Sánchez', especialidad: 'Pediatría', matricula: 'MP2345' },
  { id: 3, nombre: 'Dr. Miguel', apellido: 'Torres', especialidad: 'Traumatología', matricula: 'MP3456' },
  { id: 4, nombre: 'Dra. Silvia', apellido: 'Vargas', especialidad: 'Clínica Médica', matricula: 'MP4567' },
];

export function RegistroTurno({ onBack }: RegistroTurnoProps) {
  const [paso, setPaso] = useState(1);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchPaciente, setSearchPaciente] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modoLocal, setModoLocal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pacientesData, profesionalesData] = await Promise.all([
        pacientesApi.getAll(),
        profesionalesApi.getAll()
      ]);
      setPacientes(pacientesData);
      setProfesionales(profesionalesData);
      setModoLocal(false);
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        // Usar datos de demostración en modo local
        setPacientes(pacientesMock);
        setProfesionales(profesionalesMock);
        setModoLocal(true);
      } else {
        console.error('Error cargando datos:', err);
      }
    }
  };

  const paciente = pacientes.find(p => p.id.toString() === pacienteSeleccionado);
  const profesional = profesionales.find(p => p.id.toString() === profesionalSeleccionado);

  const handleRegistrar = async () => {
    setLoading(true);
    try {
      if (!modoLocal) {
        await turnosApi.create({
          fecha,
          hora,
          pacienteId: paciente.id,
          pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
          profesionalId: profesional.id,
          profesionalNombre: `${profesional.nombre} ${profesional.apellido}`,
          especialidad: profesional.especialidad
        });
      }
      // En modo local, solo mostramos el mensaje de éxito sin guardar

      setShowSuccess(true);
      setTimeout(() => {
        setPaso(1);
        setPacienteSeleccionado('');
        setProfesionalSeleccionado('');
        setFecha('');
        setHora('');
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error registrando turno:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
    return nombreCompleto.includes(searchPaciente.toLowerCase()) ||
           p.dni.includes(searchPaciente);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">P6 - Registrar Turno</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Turno registrado exitosamente{modoLocal && ' (en modo local)'}
              </AlertDescription>
            </Alert>
          )}

          {modoLocal && !showSuccess && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                💡 Modo local: Los cambios se almacenan temporalmente en esta sesión. Datos de demostración disponibles para pruebas.
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    paso >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      paso > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Paciente</span>
              <span>Profesional</span>
              <span>Fecha/Hora</span>
              <span>Confirmar</span>
            </div>
          </div>

          <div className="space-y-6">
            {paso === 1 && (
              <div>
                <h3 className="mb-4">Paso 1: Seleccionar Paciente</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-paciente">Buscar Paciente</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search-paciente"
                        placeholder="Buscar por nombre o DNI..."
                        value={searchPaciente}
                        onChange={(e) => setSearchPaciente(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="paciente">Paciente</Label>
                    <Select value={pacienteSeleccionado} onValueChange={setPacienteSeleccionado}>
                      <SelectTrigger id="paciente">
                        <SelectValue placeholder="Seleccione un paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientesFiltrados.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.nombre} {p.apellido} - DNI: {p.dni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {paciente && (
                    <Alert>
                      <AlertDescription>
                        Paciente seleccionado: <span className="font-semibold">{paciente.nombre} {paciente.apellido}</span> (DNI: {paciente.dni})
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={() => setPaso(2)} disabled={!pacienteSeleccionado}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {paso === 2 && (
              <div>
                <h3 className="mb-4">Paso 2: Seleccionar Profesional y Especialidad</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profesional">Profesional</Label>
                    <Select value={profesionalSeleccionado} onValueChange={setProfesionalSeleccionado}>
                      <SelectTrigger id="profesional">
                        <SelectValue placeholder="Seleccione un profesional" />
                      </SelectTrigger>
                      <SelectContent>
                        {profesionales.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.nombre} {p.apellido} - {p.especialidad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {profesional && (
                    <Alert>
                      <AlertDescription>
                        <div><span className="font-semibold">Profesional:</span> {profesional.nombre} {profesional.apellido}</div>
                        <div><span className="font-semibold">Especialidad:</span> {profesional.especialidad}</div>
                        <div><span className="font-semibold">Matrícula:</span> {profesional.matricula}</div>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => setPaso(1)} variant="outline">Atrás</Button>
                    <Button onClick={() => setPaso(3)} disabled={!profesionalSeleccionado}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paso === 3 && (
              <div>
                <h3 className="mb-4">Paso 3: Confirmar Fecha y Hora</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hora">Horario Disponible</Label>
                    <Select value={hora} onValueChange={setHora}>
                      <SelectTrigger id="hora">
                        <SelectValue placeholder="Seleccione un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {horariosDisponibles.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {fecha && hora && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Horario disponible confirmado
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => setPaso(2)} variant="outline">Atrás</Button>
                    <Button onClick={() => setPaso(4)} disabled={!fecha || !hora}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paso === 4 && (
              <div>
                <h3 className="mb-4">Paso 4: Confirmar Registro</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">Paciente:</span>
                        <div>{paciente?.nombre} {paciente?.apellido}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">DNI:</span>
                        <div>{paciente?.dni}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Profesional:</span>
                        <div>{profesional?.nombre} {profesional?.apellido}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Especialidad:</span>
                        <div>{profesional?.especialidad}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <div>{fecha}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Hora:</span>
                        <div>{hora}</div>
                      </div>
                    </div>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Verifique que todos los datos sean correctos antes de confirmar el registro.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button onClick={() => setPaso(3)} variant="outline">Atrás</Button>
                    <Button 
                      onClick={handleRegistrar} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? 'Registrando...' : 'Registrar Turno'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

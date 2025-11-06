import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { profesionalesApi } from '../utils/api';

interface AltaProfesionalProps {
  onBack: () => void;
  hideHeader?: boolean;
}

const especialidadesMock = [
  'Cardiología',
  'Pediatría',
  'Traumatología',
  'Neurología',
  'Dermatología',
  'Oftalmología',
  'Ginecología',
  'Clínica Médica'
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Datos de demostración para modo local
const profesionalesMock = [
  { id: 1, nombre: 'Dr. Luis', apellido: 'Fernández', especialidad: 'Cardiología', matricula: 'MP1234', horarios: 'Lunes, Martes, Miércoles 09:00-13:00' },
  { id: 2, nombre: 'Dra. Laura', apellido: 'Sánchez', especialidad: 'Pediatría', matricula: 'MP2345', horarios: 'Martes, Jueves, Viernes 14:00-18:00' },
  { id: 3, nombre: 'Dr. Miguel', apellido: 'Torres', especialidad: 'Traumatología', matricula: 'MP3456', horarios: 'Lunes, Miércoles, Viernes 08:00-12:00' },
  { id: 4, nombre: 'Dra. Silvia', apellido: 'Vargas', especialidad: 'Clínica Médica', matricula: 'MP4567', horarios: 'Lunes, Martes, Jueves 15:00-19:00' },
];

export function AltaProfesional({ onBack, hideHeader = false }: AltaProfesionalProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [matricula, setMatricula] = useState('');
  const [diasAtencion, setDiasAtencion] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modoLocal, setModoLocal] = useState(false);

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const cargarProfesionales = async () => {
    try {
      const data = await profesionalesApi.getAll();
      setProfesionales(data);
      setModoLocal(false);
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        // Usar datos de demostración en modo local
        setProfesionales(profesionalesMock);
        setModoLocal(true);
      } else {
        console.error('Error cargando profesionales:', err);
      }
    }
  };

  const handleDiaToggle = (dia: string) => {
    if (diasAtencion.includes(dia)) {
      setDiasAtencion(diasAtencion.filter(d => d !== dia));
    } else {
      setDiasAtencion([...diasAtencion, dia]);
    }
  };

  const formatHorarios = (horarios: any) => {
    if (!horarios) return 'No configurado';
    if (typeof horarios === 'string') return horarios;
    if (Array.isArray(horarios)) {
      return horarios
        .filter(h => h.activo)
        .map(h => `${h.dia} ${h.horaInicio}-${h.horaFin}`)
        .join(', ') || 'No configurado';
    }
    return 'No configurado';
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const horariosTexto = `${diasAtencion.join(', ')} ${horaInicio}-${horaFin}`;
      const nuevoProfesional = {
        nombre,
        apellido,
        especialidad,
        matricula,
        horarios: horariosTexto
      };

      if (modoLocal) {
        // En modo local, agregar directamente al estado
        const nuevoId = Math.max(0, ...profesionales.map(p => p.id)) + 1;
        setProfesionales([...profesionales, { ...nuevoProfesional, id: nuevoId }]);
      } else {
        await profesionalesApi.create(nuevoProfesional);
        await cargarProfesionales();
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setNombre('');
        setApellido('');
        setEspecialidad('');
        setMatricula('');
        setDiasAtencion([]);
        setHoraInicio('');
        setHoraFin('');
      }, 2000);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error guardando profesional:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nombre && apellido && especialidad && matricula && diasAtencion.length > 0 && horaInicio && horaFin;

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-gray-100 p-8"}>
      <div className={hideHeader ? "" : "max-w-6xl mx-auto"}>
        <div className={hideHeader ? "" : "bg-white rounded-lg shadow-lg p-8"}>
          {!hideHeader && (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">P10 - Alta de Profesional</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
          )}

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Profesional registrado exitosamente{modoLocal && ' (en modo local)'}
              </AlertDescription>
            </Alert>
          )}

          {modoLocal && !showSuccess && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                💡 Modo local: Los cambios se almacenan temporalmente en esta sesión
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Registrar Nuevo Profesional
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

                <div>
                  <Label htmlFor="especialidad">Especialidad *</Label>
                  <Select value={especialidad} onValueChange={setEspecialidad}>
                    <SelectTrigger id="especialidad">
                      <SelectValue placeholder="Seleccione especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidadesMock.map((esp) => (
                        <SelectItem key={esp} value={esp}>
                          {esp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    placeholder="Ej: MP1234"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Días de Atención *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {diasSemana.map((dia) => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => handleDiaToggle(dia)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          diasAtencion.includes(dia)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaInicio">Hora Inicio *</Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFin">Hora Fin *</Label>
                    <Input
                      id="horaFin"
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGuardar}
                  disabled={!isFormValid || loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Guardando...' : 'Guardar Profesional'}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Profesionales Registrados</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Horarios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profesionales.map((prof) => (
                      <TableRow key={prof.id}>
                        <TableCell>
                          {prof.nombre} {prof.apellido}
                        </TableCell>
                        <TableCell>
                          <Badge>{prof.especialidad}</Badge>
                        </TableCell>
                        <TableCell>{prof.matricula}</TableCell>
                        <TableCell className="text-sm">{formatHorarios(prof.horarios)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

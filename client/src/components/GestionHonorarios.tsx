import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { DollarSign, Users, Calendar } from 'lucide-react';
import { profesionalesApi, turnosApi } from '../utils/api';

// Datos de demostración para modo local
const profesionalesMock = [
  { id: 1, nombre: 'Dr. Luis', apellido: 'Fernández', especialidad: 'Cardiología', matricula: 'MP1234' },
  { id: 2, nombre: 'Dra. Laura', apellido: 'Sánchez', especialidad: 'Pediatría', matricula: 'MP2345' },
  { id: 3, nombre: 'Dr. Miguel', apellido: 'Torres', especialidad: 'Traumatología', matricula: 'MP3456' },
  { id: 4, nombre: 'Dra. Silvia', apellido: 'Vargas', especialidad: 'Clínica Médica', matricula: 'MP4567' },
];

const turnosMock = [
  { id: 1, fecha: '2025-11-05', hora: '09:00', pacienteId: 1, pacienteNombre: 'Juan Pérez', profesionalId: 1, profesionalNombre: 'Dr. Luis Fernández', especialidad: 'Cardiología', estado: 'Acreditado' },
  { id: 2, fecha: '2025-11-05', hora: '10:00', pacienteId: 2, pacienteNombre: 'María González', profesionalId: 1, profesionalNombre: 'Dr. Luis Fernández', especialidad: 'Cardiología', estado: 'Acreditado' },
  { id: 3, fecha: '2025-11-06', hora: '09:30', pacienteId: 3, pacienteNombre: 'Carlos Rodríguez', profesionalId: 2, profesionalNombre: 'Dra. Laura Sánchez', especialidad: 'Pediatría', estado: 'Acreditado' },
  { id: 4, fecha: '2025-11-06', hora: '11:00', pacienteId: 4, pacienteNombre: 'Ana Martínez', profesionalId: 2, profesionalNombre: 'Dra. Laura Sánchez', especialidad: 'Pediatría', estado: 'Acreditado' },
  { id: 5, fecha: '2025-11-07', hora: '14:00', pacienteId: 1, pacienteNombre: 'Juan Pérez', profesionalId: 3, profesionalNombre: 'Dr. Miguel Torres', especialidad: 'Traumatología', estado: 'Acreditado' },
  { id: 6, fecha: '2025-11-08', hora: '15:00', pacienteId: 2, pacienteNombre: 'María González', profesionalId: 4, profesionalNombre: 'Dra. Silvia Vargas', especialidad: 'Clínica Médica', estado: 'Acreditado' },
  { id: 7, fecha: '2025-11-08', hora: '16:00', pacienteId: 3, pacienteNombre: 'Carlos Rodríguez', profesionalId: 4, profesionalNombre: 'Dra. Silvia Vargas', especialidad: 'Clínica Médica', estado: 'Acreditado' },
];

export function GestionHonorarios() {
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('todos');
  const [mesSeleccionado, setMesSeleccionado] = useState('2025-11');
  const [loading, setLoading] = useState(false);
  const [modoLocal, setModoLocal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [profData, turnosData] = await Promise.all([
        profesionalesApi.getAll(),
        turnosApi.getAll()
      ]);
      setProfesionales(profData);
      setTurnos(turnosData);
      setModoLocal(false);
    } catch (err: any) {
      if (err?.message === 'BACKEND_OFFLINE') {
        // Usar datos de demostración en modo local
        setProfesionales(profesionalesMock);
        setTurnos(turnosMock);
        setModoLocal(true);
      } else {
        console.error('Error cargando datos:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (profesionalId: string) => {
    const turnosProfesional = turnos.filter(
      t => t.profesionalId?.toString() === profesionalId && 
           t.estado === 'Acreditado' &&
           t.fecha.startsWith(mesSeleccionado)
    );

    return {
      totalAtendidos: turnosProfesional.length,
      turnosPorEspecialidad: turnosProfesional.reduce((acc: any, turno) => {
        acc[turno.especialidad] = (acc[turno.especialidad] || 0) + 1;
        return acc;
      }, {}),
      turnos: turnosProfesional
    };
  };

  const profesionalData = profesionalSeleccionado && profesionalSeleccionado !== 'todos'
    ? profesionales.find(p => p.id?.toString() === profesionalSeleccionado)
    : null;

  const estadisticas = profesionalSeleccionado && profesionalSeleccionado !== 'todos'
    ? calcularEstadisticas(profesionalSeleccionado)
    : null;

  // Calcular resumen general
  const resumenGeneral = profesionales.map(prof => {
    const stats = calcularEstadisticas(prof.id?.toString());
    return {
      ...prof,
      totalAtendidos: stats.totalAtendidos
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl text-blue-600 mb-4">Gestionar Honorarios</h2>
        <p className="text-gray-600 text-sm">
          Visualice la cantidad de pacientes atendidos por cada profesional para liquidar honorarios
        </p>
      </div>

      {modoLocal && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            💡 Modo local: Mostrando datos de demostración para pruebas
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg">
        <div>
          <Label htmlFor="mes">Mes/Año</Label>
          <Input
            id="mes"
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="profesional">Profesional</Label>
          <Select value={profesionalSeleccionado} onValueChange={setProfesionalSeleccionado}>
            <SelectTrigger id="profesional">
              <SelectValue placeholder="Todos los profesionales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los profesionales</SelectItem>
              {profesionales.map(prof => (
                <SelectItem key={prof.id} value={prof.id?.toString()}>
                  {prof.nombre} {prof.apellido} - {prof.especialidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumen General */}
      {(!profesionalSeleccionado || profesionalSeleccionado === 'todos') && (
        <div>
          <h3 className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Resumen General de Honorarios
          </h3>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="text-right">Pacientes Atendidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumenGeneral.map((prof) => (
                  <TableRow key={prof.id}>
                    <TableCell>{prof.nombre} {prof.apellido}</TableCell>
                    <TableCell>{prof.especialidad}</TableCell>
                    <TableCell>{prof.matricula}</TableCell>
                    <TableCell className="text-right">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {prof.totalAtendidos}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {resumenGeneral.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No hay profesionales registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Detalle por Profesional */}
      {profesionalSeleccionado && profesionalSeleccionado !== 'todos' && profesionalData && estadisticas && (
        <div className="space-y-6">
          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Profesional</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{profesionalData.nombre} {profesionalData.apellido}</div>
                <p className="text-xs text-muted-foreground">
                  {profesionalData.especialidad}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Atendidos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{estadisticas.totalAtendidos}</div>
                <p className="text-xs text-muted-foreground">
                  Pacientes en {mesSeleccionado}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Matrícula</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{profesionalData.matricula}</div>
                <p className="text-xs text-muted-foreground">
                  Número profesional
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de Turnos Atendidos */}
          <div>
            <h3 className="mb-4">Detalle de Turnos Atendidos</h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadisticas.turnos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No hay turnos acreditados en este período
                      </TableCell>
                    </TableRow>
                  ) : (
                    estadisticas.turnos.map((turno: any) => (
                      <TableRow key={turno.id}>
                        <TableCell>{turno.fecha}</TableCell>
                        <TableCell>{turno.hora}</TableCell>
                        <TableCell>{turno.pacienteNombre}</TableCell>
                        <TableCell>{turno.especialidad}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {turno.estado}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

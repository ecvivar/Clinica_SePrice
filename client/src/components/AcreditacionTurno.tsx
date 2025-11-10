import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, Search } from 'lucide-react';
import { turnosApi, pacientesApi } from '../utils/api';

interface AcreditacionTurnoProps {
  onBack: () => void;
}

const turnosMockOld = [
  {
    id: 1,
    fecha: '2025-11-01',
    hora: '09:00',
    paciente: 'Juan Pérez',
    dni: '12345678',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    estado: 'Confirmado'
  },
  {
    id: 2,
    fecha: '2025-11-01',
    hora: '10:30',
    paciente: 'María González',
    dni: '23456789',
    medico: 'Dra. Rodríguez',
    especialidad: 'Pediatría',
    estado: 'Confirmado'
  },
  {
    id: 3,
    fecha: '2025-11-01',
    hora: '11:00',
    paciente: 'Carlos López',
    dni: '34567890',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    estado: 'Pendiente'
  }
];

export function AcreditacionTurno({ onBack }: AcreditacionTurnoProps) {
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnoAcreditado, setTurnoAcreditado] = useState<number | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);

  useEffect(() => {
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      const [turnosData, pacientesData] = await Promise.all([
        turnosApi.getAll(),
        pacientesApi.getAll()
      ]);
      
      const turnosConDNI = turnosData.map((turno: any) => {
        const paciente = pacientesData.find((p: any) => p.id === turno.pacienteId);
        return {
          ...turno,
          paciente: turno.pacienteNombre,
          medico: turno.profesionalNombre,
          dni: paciente?.dni || 'N/A'
        };
      });
      
      setTurnos(turnosConDNI);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error cargando turnos:', err);
      }
    }
  };

  const handleAcreditar = async (id: number) => {
    try {
      await turnosApi.acreditar(id);
      await cargarTurnos();
      setTurnoAcreditado(id);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTurnoAcreditado(null);
      }, 2000);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error acreditando turno:', err);
      }
    }
  };

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const turnosHoy = turnos.filter(t => t.fecha >= fechaHoy);
  
  const turnosFiltrados = search 
    ? turnosHoy.filter(t => 
        t.paciente.toLowerCase().includes(search.toLowerCase()) ||
        t.dni.includes(search) ||
        t.id.toString().includes(search)
      )
    : turnosHoy;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">P8 - Acreditación de Turno</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          <Alert className="mb-6">
            <AlertDescription>
              Módulo de recepción para confirmar la asistencia del paciente. Solo se muestran los turnos del día de hoy.
            </AlertDescription>
          </Alert>

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Turno #{turnoAcreditado} acreditado exitosamente
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Label htmlFor="search">Buscar Paciente</Label>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Buscar por nombre, DNI o ID de turno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3>Turnos del día: {fechaHoy}</h3>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron turnos
                    </TableCell>
                  </TableRow>
                ) : (
                  turnosFiltrados.map((turno) => (
                    <TableRow key={turno.id} className={turno.estado === 'Acreditado' ? 'bg-green-50' : ''}>
                      <TableCell>{turno.id}</TableCell>
                      <TableCell>{turno.hora}</TableCell>
                      <TableCell>{turno.paciente}</TableCell>
                      <TableCell>{turno.dni}</TableCell>
                      <TableCell>{turno.medico}</TableCell>
                      <TableCell>{turno.especialidad}</TableCell>
                      <TableCell>
                        <Badge variant={turno.estado === 'Acreditado' ? 'secondary' : 'default'}>
                          {turno.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {turno.estado === 'Acreditado' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Acreditado</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleAcreditar(turno.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Acreditar Asistencia
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Total Turnos Hoy</div>
              <div className="text-2xl">{turnosHoy.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Acreditados</div>
              <div className="text-2xl">{turnosHoy.filter(t => t.estado === 'Acreditado').length}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600">Pendientes</div>
              <div className="text-2xl">{turnosHoy.filter(t => t.estado !== 'Acreditado').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

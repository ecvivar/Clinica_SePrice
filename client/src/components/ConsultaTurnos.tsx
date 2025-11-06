import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar } from 'lucide-react';

interface ConsultaTurnosProps {
  onBack: () => void;
}

const mockTurnos = [
  {
    id: 1,
    fecha: '2025-11-05',
    hora: '09:00',
    paciente: 'Juan Pérez',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    estado: 'Confirmado'
  },
  {
    id: 2,
    fecha: '2025-11-05',
    hora: '10:30',
    paciente: 'María González',
    medico: 'Dra. Rodríguez',
    especialidad: 'Pediatría',
    estado: 'Acreditado'
  },
  {
    id: 3,
    fecha: '2025-11-06',
    hora: '11:00',
    paciente: 'Carlos López',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    estado: 'Pendiente'
  },
  {
    id: 4,
    fecha: '2025-11-06',
    hora: '14:00',
    paciente: 'Ana Martínez',
    medico: 'Dra. Fernández',
    especialidad: 'Traumatología',
    estado: 'Cancelado'
  },
  {
    id: 5,
    fecha: '2025-11-07',
    hora: '09:30',
    paciente: 'Pedro Sánchez',
    medico: 'Dr. Gómez',
    especialidad: 'Neurología',
    estado: 'Confirmado'
  }
];

export function ConsultaTurnos({ onBack }: ConsultaTurnosProps) {
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const turnosFiltrados = mockTurnos.filter(turno => {
    const matchFecha = !filtroFecha || turno.fecha === filtroFecha;
    const matchPaciente = !filtroPaciente || turno.paciente.toLowerCase().includes(filtroPaciente.toLowerCase());
    const matchMedico = !filtroMedico || turno.medico.toLowerCase().includes(filtroMedico.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || turno.estado === filtroEstado;
    return matchFecha && matchPaciente && matchMedico && matchEstado;
  });

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Confirmado': 'default',
      'Acreditado': 'secondary',
      'Pendiente': 'outline',
      'Cancelado': 'destructive'
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">P5 - Consulta de Turnos</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="mb-4">Filtros de Búsqueda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <div className="relative">
                  <Input
                    id="fecha"
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="paciente">Paciente</Label>
                <Input
                  id="paciente"
                  placeholder="Buscar por nombre..."
                  value={filtroPaciente}
                  onChange={(e) => setFiltroPaciente(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="medico">Médico</Label>
                <Input
                  id="medico"
                  placeholder="Buscar por médico..."
                  value={filtroMedico}
                  onChange={(e) => setFiltroMedico(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Confirmado">Confirmado</SelectItem>
                    <SelectItem value="Acreditado">Acreditado</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltroFecha('');
                  setFiltroPaciente('');
                  setFiltroMedico('');
                  setFiltroEstado('todos');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron turnos con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  turnosFiltrados.map((turno) => (
                    <TableRow key={turno.id}>
                      <TableCell>{turno.id}</TableCell>
                      <TableCell>{turno.fecha}</TableCell>
                      <TableCell>{turno.hora}</TableCell>
                      <TableCell>{turno.paciente}</TableCell>
                      <TableCell>{turno.medico}</TableCell>
                      <TableCell>{turno.especialidad}</TableCell>
                      <TableCell>{getEstadoBadge(turno.estado)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-gray-600 text-sm">
            Mostrando {turnosFiltrados.length} de {mockTurnos.length} turnos
          </div>
        </div>
      </div>
    </div>
  );
}

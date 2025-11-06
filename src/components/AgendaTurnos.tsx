import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Calendar, Plus, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { turnosApi, pacientesApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface AgendaTurnosProps {
  onBack: () => void;
  onNuevoTurno: () => void;
  onAcreditar: () => void;
}

export function AgendaTurnos({ onBack, onNuevoTurno, onAcreditar }: AgendaTurnosProps) {
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [turnos, setTurnos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<any | null>(null);
  const [showCancelarDialog, setShowCancelarDialog] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [turnosData, pacientesData] = await Promise.all([
        turnosApi.getAll(),
        pacientesApi.getAll()
      ]);
      
      // Enriquecer turnos con DNI del paciente
      const turnosConDNI = turnosData.map((turno: any) => {
        const paciente = pacientesData.find((p: any) => p.id === turno.pacienteId);
        return {
          ...turno,
          dni: paciente?.dni || 'N/A'
        };
      });
      
      setTurnos(turnosConDNI);
      setPacientes(pacientesData);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error cargando datos:', err);
      }
      // Usar datos locales de respaldo si es necesario
      setTurnos([]);
      setPacientes([]);
    }
  };

  const turnosFiltrados = turnos.filter(turno => {
    const matchFecha = !filtroFecha || turno.fecha === filtroFecha;
    const matchPaciente = !filtroPaciente || turno.pacienteNombre.toLowerCase().includes(filtroPaciente.toLowerCase());
    const matchMedico = !filtroMedico || turno.profesionalNombre.toLowerCase().includes(filtroMedico.toLowerCase());
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

  const estadisticas = {
    total: turnosFiltrados.length,
    confirmados: turnosFiltrados.filter(t => t.estado === 'Confirmado').length,
    acreditados: turnosFiltrados.filter(t => t.estado === 'Acreditado').length,
    pendientes: turnosFiltrados.filter(t => t.estado === 'Pendiente').length,
    cancelados: turnosFiltrados.filter(t => t.estado === 'Cancelado').length
  };

  const handleCancelarTurno = async () => {
    if (!turnoSeleccionado) return;

    try {
      await turnosApi.delete(turnoSeleccionado.id);
      toast.success('Turno cancelado correctamente');
      setShowCancelarDialog(false);
      setTurnoSeleccionado(null);
      await cargarDatos();
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error cancelando turno:', err);
        toast.error('Error al cancelar el turno');
      }
    }
  };

  const handleAcreditarTurno = async (turno: any) => {
    if (turno.estado === 'Acreditado') {
      toast.info('Este turno ya está acreditado');
      return;
    }

    if (turno.estado === 'Cancelado') {
      toast.error('No se puede acreditar un turno cancelado');
      return;
    }

    try {
      await turnosApi.update(turno.id, { ...turno, estado: 'Acreditado' });
      toast.success('Turno acreditado correctamente');
      await cargarDatos();
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error acreditando turno:', err);
        toast.error('Error al acreditar el turno');
      }
    }
  };

  const handleSeleccionarTurno = (turno: any) => {
    if (turnoSeleccionado?.id === turno.id) {
      setTurnoSeleccionado(null);
    } else {
      setTurnoSeleccionado(turno);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">Gestión de Turnos</h1>
            <div className="flex gap-2">
              <Button onClick={onNuevoTurno} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Turno
              </Button>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl">{estadisticas.total}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600">Confirmados</div>
              <div className="text-2xl text-blue-600">{estadisticas.confirmados}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600">Acreditados</div>
              <div className="text-2xl text-green-600">{estadisticas.acreditados}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-600">Pendientes</div>
              <div className="text-2xl text-yellow-600">{estadisticas.pendientes}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Cancelados</div>
              <div className="text-2xl text-red-600">{estadisticas.cancelados}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros de Búsqueda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
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
                <Label htmlFor="medico">Profesional</Label>
                <Input
                  id="medico"
                  placeholder="Buscar por profesional..."
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

          {turnoSeleccionado && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800">
                    Turno seleccionado: <strong>{turnoSeleccionado.pacienteNombre}</strong> - {turnoSeleccionado.fecha} {turnoSeleccionado.hora} - {turnoSeleccionado.profesionalNombre}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcreditarTurno(turnoSeleccionado)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Acreditar Turno
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => setShowCancelarDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Turno
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron turnos con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  turnosFiltrados.map((turno) => (
                    <TableRow 
                      key={turno.id} 
                      className={`cursor-pointer ${turnoSeleccionado?.id === turno.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSeleccionarTurno(turno)}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          checked={turnoSeleccionado?.id === turno.id}
                          onChange={() => handleSeleccionarTurno(turno)}
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>{turno.fecha}</TableCell>
                      <TableCell>{turno.hora}</TableCell>
                      <TableCell>{turno.pacienteNombre}</TableCell>
                      <TableCell>{turno.dni}</TableCell>
                      <TableCell>{turno.profesionalNombre}</TableCell>
                      <TableCell>{turno.especialidad}</TableCell>
                      <TableCell>{getEstadoBadge(turno.estado)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-gray-600 text-sm">
            Mostrando {turnosFiltrados.length} de {turnos.length} turnos
          </div>
        </div>
      </div>

      {/* Dialog de confirmación para cancelar */}
      <Dialog open={showCancelarDialog} onOpenChange={setShowCancelarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Confirmar Cancelación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea cancelar el siguiente turno?
            </DialogDescription>
          </DialogHeader>
          {turnoSeleccionado && (
            <div className="py-4 space-y-2">
              <p><strong>Paciente:</strong> {turnoSeleccionado.pacienteNombre}</p>
              <p><strong>Fecha:</strong> {turnoSeleccionado.fecha}</p>
              <p><strong>Hora:</strong> {turnoSeleccionado.hora}</p>
              <p><strong>Profesional:</strong> {turnoSeleccionado.profesionalNombre}</p>
              <p><strong>Especialidad:</strong> {turnoSeleccionado.especialidad}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelarDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleCancelarTurno}>
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

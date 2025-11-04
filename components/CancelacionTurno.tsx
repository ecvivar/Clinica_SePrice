import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { CheckCircle2, XCircle } from 'lucide-react';
import { turnosApi } from '../utils/api';

interface CancelacionTurnoProps {
  onBack: () => void;
}

const turnosMockOld = [
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
    estado: 'Confirmado'
  },
  {
    id: 3,
    fecha: '2025-11-06',
    hora: '11:00',
    paciente: 'Carlos López',
    medico: 'Dr. García',
    especialidad: 'Cardiología',
    estado: 'Pendiente'
  }
];

export function CancelacionTurno({ onBack }: CancelacionTurnoProps) {
  const [searchId, setSearchId] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const [usuario] = useState('Admin Usuario');
  const [showDialog, setShowDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnos, setTurnos] = useState<any[]>([]);

  useEffect(() => {
    cargarTurnos();
  }, []);

  const cargarTurnos = async () => {
    try {
      const turnosData = await turnosApi.getAll();
      const turnosFormateados = turnosData.map((t: any) => ({
        ...t,
        paciente: t.pacienteNombre,
        medico: t.profesionalNombre
      }));
      setTurnos(turnosFormateados);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error cargando turnos:', err);
      }
    }
  };

  const turno = turnos.find(t => t.id === turnoSeleccionado);

  const handleCancelar = async () => {
    if (turnoSeleccionado) {
      try {
        await turnosApi.cancelar(turnoSeleccionado, motivo, usuario);
        await cargarTurnos();
        setShowDialog(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setTurnoSeleccionado(null);
          setMotivo('');
          setSearchId('');
        }, 2000);
      } catch (err: any) {
        if (err?.message !== 'BACKEND_OFFLINE') {
          console.error('Error cancelando turno:', err);
        }
      }
    }
  };

  const turnosFiltrados = searchId 
    ? turnos.filter(t => t.id.toString().includes(searchId))
    : turnos;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">P7 - Cancelación de Turno</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Turno cancelado exitosamente
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <Label htmlFor="search">Buscar Turno por ID</Label>
            <Input
              id="search"
              placeholder="Ingrese ID del turno..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="rounded-lg border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnosFiltrados.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.fecha}</TableCell>
                    <TableCell>{t.hora}</TableCell>
                    <TableCell>{t.paciente}</TableCell>
                    <TableCell>{t.medico}</TableCell>
                    <TableCell>
                      <Badge variant={t.estado === 'Cancelado' ? 'destructive' : 'default'}>
                        {t.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.estado !== 'Cancelado' ? (
                        <Button
                          onClick={() => setTurnoSeleccionado(t.id)}
                          variant="outline"
                          size="sm"
                        >
                          Seleccionar
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">Ya cancelado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {turnoSeleccionado && turno && turno.estado !== 'Cancelado' && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3>Cancelar Turno #{turno.id}</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded border">
                <div>
                  <span className="text-gray-600">Paciente:</span>
                  <div>{turno.paciente}</div>
                </div>
                <div>
                  <span className="text-gray-600">Médico:</span>
                  <div>{turno.medico}</div>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <div>{turno.fecha}</div>
                </div>
                <div>
                  <span className="text-gray-600">Hora:</span>
                  <div>{turno.hora}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo de Cancelación *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Ingrese el motivo de la cancelación..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <span className="text-gray-600">Usuario que cancela:</span>
                <div>{usuario}</div>
              </div>

              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta acción cancelará el turno. Asegúrese de haber ingresado el motivo correctamente.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setTurnoSeleccionado(null);
                    setMotivo('');
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setShowDialog(true)}
                  variant="destructive"
                  disabled={!motivo.trim()}
                >
                  Confirmar Cancelación
                </Button>
              </div>
            </div>
          )}

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción cancelará el turno #{turnoSeleccionado}. Esta operación no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, volver</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelar} className="bg-red-600 hover:bg-red-700">
                  Sí, cancelar turno
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

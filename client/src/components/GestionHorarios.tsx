import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface GestionHorariosProps {
  onBack: () => void;
  hideHeader?: boolean;
}

const profesionalesMock = [
  { id: 1, nombre: 'Dr. García', especialidad: 'Cardiología' },
  { id: 2, nombre: 'Dra. Rodríguez', especialidad: 'Pediatría' },
  { id: 3, nombre: 'Dra. Fernández', especialidad: 'Traumatología' },
  { id: 4, nombre: 'Dr. Gómez', especialidad: 'Neurología' }
];

const diasSemana = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
  { id: 'sabado', label: 'Sábado' }
];

interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export function GestionHorarios({ onBack, hideHeader = false }: GestionHorariosProps) {
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [horarios, setHorarios] = useState<Horario[]>([
    { dia: 'lunes', horaInicio: '09:00', horaFin: '13:00', activo: true },
    { dia: 'martes', horaInicio: '09:00', horaFin: '13:00', activo: true },
    { dia: 'miercoles', horaInicio: '14:00', horaFin: '18:00', activo: true },
    { dia: 'jueves', horaInicio: '09:00', horaFin: '13:00', activo: true },
    { dia: 'viernes', horaInicio: '09:00', horaFin: '13:00', activo: false },
    { dia: 'sabado', horaInicio: '09:00', horaFin: '12:00', activo: false }
  ]);

  const profesional = profesionalesMock.find(p => p.id.toString() === profesionalSeleccionado);

  const handleToggleDia = (dia: string, activo: boolean) => {
    setHorarios(horarios.map(h => 
      h.dia === dia ? { ...h, activo } : h
    ));
  };

  const handleUpdateHorario = (dia: string, field: 'horaInicio' | 'horaFin', value: string) => {
    setHorarios(horarios.map(h => 
      h.dia === dia ? { ...h, [field]: value } : h
    ));
  };

  const handleGuardar = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-gray-100 p-8"}>
      <div className={hideHeader ? "" : "max-w-5xl mx-auto"}>
        <div className={hideHeader ? "" : "bg-white rounded-lg shadow-lg p-8"}>
          {!hideHeader && (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">P11 - Gestión de Horarios</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
          )}

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Horarios actualizados exitosamente
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="profesional">Seleccionar Profesional</Label>
              <Select value={profesionalSeleccionado} onValueChange={setProfesionalSeleccionado}>
                <SelectTrigger id="profesional">
                  <SelectValue placeholder="Seleccione un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profesionalesMock.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} - {p.especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {profesional && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div><span className="font-semibold">Profesional:</span> {profesional.nombre}</div>
                      <div><span className="font-semibold">Especialidad:</span> {profesional.especialidad}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="mb-4">Configurar Horarios de Atención</h3>
                  <div className="space-y-4">
                    {diasSemana.map(({ id, label }) => {
                      const horario = horarios.find(h => h.dia === id);
                      return (
                        <div key={id} className="bg-white p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={horario?.activo || false}
                                onCheckedChange={(checked) => handleToggleDia(id, checked)}
                              />
                              <Label className="text-base">{label}</Label>
                            </div>
                            {horario?.activo && (
                              <span className="text-sm text-green-600">Activo</span>
                            )}
                          </div>
                          {horario?.activo && (
                            <div className="grid grid-cols-2 gap-4 ml-12">
                              <div>
                                <Label htmlFor={`${id}-inicio`} className="text-sm">Hora Inicio</Label>
                                <Input
                                  id={`${id}-inicio`}
                                  type="time"
                                  value={horario.horaInicio}
                                  onChange={(e) => handleUpdateHorario(id, 'horaInicio', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${id}-fin`} className="text-sm">Hora Fin</Label>
                                <Input
                                  id={`${id}-fin`}
                                  type="time"
                                  value={horario.horaFin}
                                  onChange={(e) => handleUpdateHorario(id, 'horaFin', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="mb-2">Resumen de Horarios</h4>
                  <div className="space-y-1 text-sm">
                    {horarios.filter(h => h.activo).map(h => (
                      <div key={h.dia} className="flex justify-between">
                        <span className="capitalize">{diasSemana.find(d => d.id === h.dia)?.label}:</span>
                        <span>{h.horaInicio} - {h.horaFin}</span>
                      </div>
                    ))}
                    {horarios.filter(h => h.activo).length === 0 && (
                      <div className="text-gray-500">No hay días activos configurados</div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGuardar}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Guardar Configuración
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

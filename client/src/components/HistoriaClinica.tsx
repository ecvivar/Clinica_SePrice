import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { CheckCircle2, Search, FileText } from 'lucide-react';

interface HistoriaClinicaProps {
  onBack: () => void;
  hideHeader?: boolean;
}

const pacientesMock = [
  { id: 1, nombre: 'Juan Pérez', dni: '12345678', fechaNacimiento: '1980-05-15' },
  { id: 2, nombre: 'María González', dni: '23456789', fechaNacimiento: '1975-08-22' },
  { id: 3, nombre: 'Carlos López', dni: '34567890', fechaNacimiento: '1990-03-10' }
];

const consultasPreviasMock = [
  {
    id: 1,
    fecha: '2025-09-15',
    profesional: 'Dr. García',
    especialidad: 'Cardiología',
    diagnostico: 'Control rutinario',
    observaciones: 'Presión arterial normal. Continuar con medicación actual.'
  },
  {
    id: 2,
    fecha: '2025-08-10',
    profesional: 'Dra. Rodríguez',
    especialidad: 'Clínica Médica',
    diagnostico: 'Gripe estacional',
    observaciones: 'Reposo por 5 días. Medicación sintomática.'
  }
];

export function HistoriaClinica({ onBack, hideHeader = false }: HistoriaClinicaProps) {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [profesional] = useState('Dr. García');
  const [showSuccess, setShowSuccess] = useState(false);

  const paciente = pacientesMock.find(p => p.id.toString() === pacienteSeleccionado);

  const handleGuardar = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setAntecedentes('');
      setDiagnostico('');
      setObservaciones('');
    }, 2000);
  };

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
      <div className={hideHeader ? "" : "max-w-6xl mx-auto"}>
        <div className={hideHeader ? "" : "bg-white rounded-lg shadow-lg p-8"}>
          {!hideHeader && (
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">P9 - Historia Clínica</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
          )}

          {showSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Registro guardado exitosamente
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div>
              <Label htmlFor="paciente">Seleccionar Paciente</Label>
              <Select value={pacienteSeleccionado} onValueChange={setPacienteSeleccionado}>
                <SelectTrigger id="paciente">
                  <SelectValue placeholder="Seleccione un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesMock.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} - DNI: {p.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paciente && (
              <>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Datos del Paciente
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Nombre:</span>
                      <div>{paciente.nombre}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">DNI:</span>
                      <div>{paciente.dni}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Fecha Nacimiento:</span>
                      <div>{paciente.fechaNacimiento}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Edad:</span>
                      <div>{calcularEdad(paciente.fechaNacimiento)} años</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4">Consultas Anteriores</h3>
                  <div className="space-y-4">
                    {consultasPreviasMock.map((consulta) => (
                      <div key={consulta.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm text-gray-600">Fecha: </span>
                            <span>{consulta.fecha}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Profesional: </span>
                            <span>{consulta.profesional}</span>
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Especialidad: </span>
                          <span>{consulta.especialidad}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-sm text-gray-600">Diagnóstico: </span>
                          <span>{consulta.diagnostico}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Observaciones: </span>
                          <span className="text-sm">{consulta.observaciones}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="mb-4">Nueva Consulta</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Profesional</Label>
                      <Input value={profesional} disabled />
                    </div>

                    <div>
                      <Label htmlFor="antecedentes">Antecedentes</Label>
                      <Textarea
                        id="antecedentes"
                        placeholder="Antecedentes del paciente relevantes para esta consulta..."
                        value={antecedentes}
                        onChange={(e) => setAntecedentes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="diagnostico">Diagnóstico</Label>
                      <Textarea
                        id="diagnostico"
                        placeholder="Diagnóstico de la consulta actual..."
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="observaciones">Observaciones</Label>
                      <Textarea
                        id="observaciones"
                        placeholder="Observaciones, tratamiento, indicaciones..."
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleGuardar}
                      disabled={!diagnostico.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Guardar Registro
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

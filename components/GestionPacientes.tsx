import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AltaPaciente } from './AltaPaciente';
import { HistoriaClinica } from './HistoriaClinica';
import { tieneAccesoSubModulo, SUB_MODULOS } from '../utils/roles';

interface GestionPacientesProps {
  onBack: () => void;
  rol?: string;
}

export function GestionPacientes({ onBack, rol = 'Administrador' }: GestionPacientesProps) {
  const puedeVerAltaPaciente = tieneAccesoSubModulo(rol, SUB_MODULOS.ALTA_PACIENTE);
  const puedeVerHistoriaClinica = tieneAccesoSubModulo(rol, SUB_MODULOS.HISTORIA_CLINICA);

  // Si el usuario solo puede ver historia clínica, mostrarla directamente
  if (!puedeVerAltaPaciente && puedeVerHistoriaClinica) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">Historia Clínica</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
            <HistoriaClinica onBack={() => {}} hideHeader={true} />
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso a ambos o solo a alta paciente, mostrar con pestañas
  const defaultTab = puedeVerAltaPaciente ? "alta" : "historia";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">Gestión de Pacientes</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={`grid w-full ${puedeVerAltaPaciente && puedeVerHistoriaClinica ? 'grid-cols-2' : 'grid-cols-1'} mb-6`}>
              {puedeVerAltaPaciente && (
                <TabsTrigger value="alta">Alta de Paciente</TabsTrigger>
              )}
              {puedeVerHistoriaClinica && (
                <TabsTrigger value="historia">Historia Clínica</TabsTrigger>
              )}
            </TabsList>
            {puedeVerAltaPaciente && (
              <TabsContent value="alta">
                <AltaPaciente onBack={() => {}} hideHeader={true} />
              </TabsContent>
            )}
            {puedeVerHistoriaClinica && (
              <TabsContent value="historia">
                <HistoriaClinica onBack={() => {}} hideHeader={true} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AltaProfesional } from './AltaProfesional';
import { GestionHorarios } from './GestionHorarios';
import { GestionHonorarios } from './GestionHonorarios';
import { tieneAccesoSubModulo, SUB_MODULOS } from '../utils/roles';

interface GestionProfesionalesProps {
  onBack: () => void;
  rol?: string;
}

export function GestionProfesionales({ onBack, rol = 'Administrador' }: GestionProfesionalesProps) {
  const puedeVerAltaProfesional = tieneAccesoSubModulo(rol, SUB_MODULOS.ALTA_PROFESIONAL);
  const puedeVerHorarios = tieneAccesoSubModulo(rol, SUB_MODULOS.GESTION_HORARIOS);
  const puedeVerHonorarios = tieneAccesoSubModulo(rol, SUB_MODULOS.GESTION_HONORARIOS);

  // Si el usuario solo puede ver honorarios, mostrarlos directamente
  if (!puedeVerAltaProfesional && !puedeVerHorarios && puedeVerHonorarios) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-blue-600 text-2xl">Gestionar Honorarios</h1>
              <Button onClick={onBack} variant="outline">Volver al Menú</Button>
            </div>
            <GestionHonorarios />
          </div>
        </div>
      </div>
    );
  }

  const defaultTab = puedeVerAltaProfesional ? "alta" : puedeVerHorarios ? "horarios" : "honorarios";
  const pestañasActivas = [puedeVerAltaProfesional, puedeVerHorarios, puedeVerHonorarios].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">Gestionar Profesionales</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-${pestañasActivas} mb-6`}>
              {puedeVerAltaProfesional && (
                <TabsTrigger value="alta">Alta de Profesional</TabsTrigger>
              )}
              {puedeVerHorarios && (
                <TabsTrigger value="horarios">Gestión de Horarios</TabsTrigger>
              )}
              {puedeVerHonorarios && (
                <TabsTrigger value="honorarios">Gestión de Honorarios</TabsTrigger>
              )}
            </TabsList>
            {puedeVerAltaProfesional && (
              <TabsContent value="alta">
                <AltaProfesional onBack={() => {}} hideHeader={true} />
              </TabsContent>
            )}
            {puedeVerHorarios && (
              <TabsContent value="horarios">
                <GestionHorarios onBack={() => {}} hideHeader={true} />
              </TabsContent>
            )}
            {puedeVerHonorarios && (
              <TabsContent value="honorarios">
                <GestionHonorarios />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

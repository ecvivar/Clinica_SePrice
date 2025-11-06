import { Shield, ShieldCheck, UserRound, Calendar, Users, Building2, UserCog, FileText, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Info } from 'lucide-react';

export function InfoRoles() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Información de Roles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sistema de Roles y Permisos</DialogTitle>
          <DialogDescription>
            Control de acceso basado en roles para la Clínica SePrise
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Administrador */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-blue-900">Administrador</h3>
              <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                Acceso Total
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">Tiene acceso completo a todos los módulos del sistema:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 bg-white p-2 rounded">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>Agenda de Turnos</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>Gestión de Pacientes</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span>Gestión de Consultorios</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded">
                  <UserCog className="h-4 w-4 text-gray-600" />
                  <span>Gestión de Profesionales</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Usuario de prueba:</strong> admin / admin123
              </p>
            </div>
          </div>

          {/* Recepción */}
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h3 className="text-green-900">Recepción</h3>
              <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                Acceso Limitado
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">Acceso restringido solo a:</p>
              <div className="space-y-2 mt-2">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Agenda de Turnos</span>
                  </div>
                  <ul className="text-xs text-gray-600 ml-6 space-y-1">
                    <li>• Consulta de turnos</li>
                    <li>• Registro de nuevos turnos</li>
                    <li>• Acreditación de turnos</li>
                    <li>• Cancelación de turnos</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Alta de Pacientes</span>
                  </div>
                  <ul className="text-xs text-gray-600 ml-6 space-y-1">
                    <li>• Registro de nuevos pacientes</li>
                    <li>• Consulta de datos de pacientes</li>
                  </ul>
                  <p className="text-xs text-orange-600 mt-2 ml-6">
                    ⚠️ No tiene acceso a historias clínicas
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Usuario de prueba:</strong> recepcion / recep123
              </p>
            </div>
          </div>

          {/* Médico */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <UserRound className="h-5 w-5 text-purple-600" />
              <h3 className="text-purple-900">Médico</h3>
              <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                Acceso Específico
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">Acceso restringido solo a:</p>
              <div className="space-y-2 mt-2">
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Historia Clínica</span>
                  </div>
                  <ul className="text-xs text-gray-600 ml-6 space-y-1">
                    <li>• Consulta de historias clínicas</li>
                    <li>• Registro de nuevas consultas</li>
                    <li>• Actualización de diagnósticos</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Gestión de Honorarios</span>
                  </div>
                  <ul className="text-xs text-gray-600 ml-6 space-y-1">
                    <li>• Consulta de honorarios</li>
                    <li>• Liquidación de pagos</li>
                    <li>• Reporte de pacientes atendidos</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Usuario de prueba:</strong> medico / medico123
              </p>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Notas Importantes</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Los permisos se validan tanto en el frontend como en las navegaciones</li>
              <li>• Si un usuario intenta acceder a un módulo sin permisos, será redirigido al menú</li>
              <li>• Los administradores pueden gestionar todos los aspectos del sistema</li>
              <li>• Cada rol tiene una vista personalizada de los módulos a los que tiene acceso</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

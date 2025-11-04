import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Building2, Plus, Trash2, ChevronDown, ChevronUp, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { profesionalesApi, consultoriosApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface Consultorio {
  id: number;
  numero: string;
  piso: string;
  profesionalId?: number;
  profesionalNombre?: string;
  insumosDisponibles?: string[];
}

interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  insumos?: string[];
}

interface GestionConsultoriosProps {
  onBack: () => void;
}

export function GestionConsultorios({ onBack }: GestionConsultoriosProps) {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [nuevoConsultorio, setNuevoConsultorio] = useState({ numero: '', piso: '' });
  const [asignacionActiva, setAsignacionActiva] = useState<number | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState('');
  const [profesionalNuevoConsultorio, setProfesionalNuevoConsultorio] = useState('');
  const [filaExpandida, setFilaExpandida] = useState<number | null>(null);
  const [consultorioEditandoInsumos, setConsultorioEditandoInsumos] = useState<number | null>(null);
  const [insumosTemporales, setInsumosTemporales] = useState<string[]>([]);

  // Insumos comunes para sugerir
  const insumosComunes = [
    'Estetoscopio',
    'Tensiómetro',
    'Termómetro',
    'Guantes descartables',
    'Alcohol en gel',
    'Gasas estériles',
    'Algodón',
    'Vendas',
    'Jeringas descartables',
    'Camilla',
    'Lámpara de examen',
    'Básculas',
    'Otoscopio',
    'Depresor lingual',
    'Cinta métrica'
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Intentar cargar profesionales
      let dataProfesionales;
      try {
        dataProfesionales = await profesionalesApi.getAll();
        setProfesionales(dataProfesionales || []);
      } catch (err: any) {
        if (err?.message !== 'BACKEND_OFFLINE') {
          console.error('Error cargando profesionales:', err);
        }
        // Usar datos de respaldo de profesionales
        setProfesionales([
          { id: 1, nombre: 'Carlos', apellido: 'García', especialidad: 'Cardiología', matricula: 'MP1234', horarios: 'Lunes 09:00-13:00' },
          { id: 2, nombre: 'Laura', apellido: 'Rodríguez', especialidad: 'Pediatría', matricula: 'MP2345', horarios: 'Martes 14:00-18:00' },
          { id: 3, nombre: 'Ana', apellido: 'Fernández', especialidad: 'Traumatología', matricula: 'MP3456', horarios: '' },
          { id: 4, nombre: 'Roberto', apellido: 'Gómez', especialidad: 'Neurología', matricula: 'MP4567', horarios: '' }
        ]);
      }
      
      // Intentar cargar consultorios
      let dataConsultorios;
      try {
        dataConsultorios = await consultoriosApi.getAll();
      } catch (err: any) {
        if (err?.message !== 'BACKEND_OFFLINE') {
          console.error('Error cargando consultorios:', err);
        }
        dataConsultorios = [];
      }
      
      // Si no hay consultorios en el backend, usar datos iniciales
      if (!dataConsultorios || dataConsultorios.length === 0) {
        const consultoriosIniciales = [
          { id: 1, numero: '101', piso: '1', profesionalId: 1, profesionalNombre: 'Dr. Carlos García', insumosDisponibles: ['Estetoscopio', 'Tensiómetro', 'Electrocardiograma', 'Camilla'] },
          { id: 2, numero: '102', piso: '1', profesionalId: 2, profesionalNombre: 'Dra. Laura Rodríguez', insumosDisponibles: ['Estetoscopio', 'Termómetro', 'Otoscopio', 'Depresor lingual'] },
          { id: 3, numero: '201', piso: '2', profesionalId: 3, profesionalNombre: 'Dra. Ana Fernández', insumosDisponibles: ['Camilla', 'Vendas', 'Guantes descartables'] },
          { id: 4, numero: '202', piso: '2', insumosDisponibles: [] },
          { id: 5, numero: '301', piso: '3', insumosDisponibles: [] },
        ];
        setConsultorios(consultoriosIniciales);
      } else {
        setConsultorios(dataConsultorios);
      }
    } catch (err) {
      console.error('Error inesperado cargando datos:', err);
      
      // Usar datos de respaldo si todo falla
      const consultoriosRespaldo = [
        { id: 1, numero: '101', piso: '1', insumosDisponibles: [] },
        { id: 2, numero: '102', piso: '1', insumosDisponibles: [] },
        { id: 3, numero: '201', piso: '2', insumosDisponibles: [] },
      ];
      setConsultorios(consultoriosRespaldo);
    }
  };

  const guardarConsultorio = async (consultorio: Consultorio) => {
    try {
      await consultoriosApi.save(consultorio);
    } catch (err: any) {
      // Silenciar solo el error de backend offline, reportar otros errores
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error guardando consultorio:', err);
      }
      // El consultorio ya está guardado en el estado local, funciona correctamente
    }
  };

  const agregarConsultorio = async () => {
    if (!nuevoConsultorio.numero || !nuevoConsultorio.piso) {
      toast.error('Complete todos los campos');
      return;
    }

    const existe = consultorios.find(c => c.numero === nuevoConsultorio.numero);
    if (existe) {
      toast.error('Ya existe un consultorio con ese número');
      return;
    }

    // Preparar el nuevo consultorio
    const nuevo: Consultorio = {
      id: Math.max(...consultorios.map(c => c.id), 0) + 1,
      numero: nuevoConsultorio.numero,
      piso: nuevoConsultorio.piso,
      insumosDisponibles: []
    };

    // Si se seleccionó un profesional, asignarlo y precargar insumos
    if (profesionalNuevoConsultorio && profesionalNuevoConsultorio !== 'sin-asignar') {
      const profesional = profesionales.find(p => p.id?.toString() === profesionalNuevoConsultorio);
      if (profesional) {
        nuevo.profesionalId = profesional.id;
        nuevo.profesionalNombre = `${profesional.nombre} ${profesional.apellido}`;
        
        // Precargar insumos según la especialidad
        const insumosRequeridos = obtenerInsumosRequeridos(profesional.id);
        nuevo.insumosDisponibles = [...insumosRequeridos]; // Autocompleta con todos los insumos necesarios
      }
    }

    setConsultorios([...consultorios, nuevo]);
    setNuevoConsultorio({ numero: '', piso: '' });
    setProfesionalNuevoConsultorio('');
    
    if (profesionalNuevoConsultorio && profesionalNuevoConsultorio !== 'sin-asignar') {
      toast.success('Consultorio agregado con profesional asignado e insumos precargados');
    } else {
      toast.success('Consultorio agregado correctamente');
    }
    
    // Guardar en el backend de forma asíncrona
    try {
      await guardarConsultorio(nuevo);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error al sincronizar con el backend:', err);
      }
    }
  };

  const eliminarConsultorio = async (id: number) => {
    const consultorio = consultorios.find(c => c.id === id);
    if (consultorio?.profesionalId) {
      toast.error('No se puede eliminar un consultorio asignado');
      return;
    }

    setConsultorios(consultorios.filter(c => c.id !== id));
    toast.success('Consultorio eliminado correctamente');
    
    // Eliminar del backend de forma asíncrona
    try {
      await consultoriosApi.delete(id);
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error al sincronizar eliminación con el backend:', err);
      }
    }
  };

  const iniciarAsignacion = (consultorioId: number) => {
    setAsignacionActiva(consultorioId);
    setProfesionalSeleccionado('');
  };

  const asignarProfesional = async () => {
    if (!profesionalSeleccionado || !asignacionActiva) {
      toast.error('Seleccione un profesional');
      return;
    }

    const profesional = profesionales.find(p => p.id?.toString() === profesionalSeleccionado);
    
    const consultoriosActualizados = consultorios.map(c => 
      c.id === asignacionActiva 
        ? { 
            ...c, 
            profesionalId: profesional!.id,
            profesionalNombre: `${profesional!.nombre} ${profesional!.apellido}` 
          }
        : c
    );

    setConsultorios(consultoriosActualizados);
    const consultorioActualizado = consultoriosActualizados.find(c => c.id === asignacionActiva);
    if (consultorioActualizado) {
      await guardarConsultorio(consultorioActualizado);
    }

    setAsignacionActiva(null);
    setProfesionalSeleccionado('');
    toast.success('Profesional asignado correctamente');
  };

  const desasignarProfesional = async (consultorioId: number) => {
    const consultoriosActualizados = consultorios.map(c => 
      c.id === consultorioId 
        ? { ...c, profesionalId: undefined, profesionalNombre: undefined }
        : c
    );
    setConsultorios(consultoriosActualizados);
    
    const consultorioActualizado = consultoriosActualizados.find(c => c.id === consultorioId);
    if (consultorioActualizado) {
      await guardarConsultorio(consultorioActualizado);
    }
    
    toast.success('Asignación eliminada correctamente');
  };

  const toggleFilaExpandida = (id: number) => {
    setFilaExpandida(filaExpandida === id ? null : id);
  };

  const iniciarEdicionInsumos = (consultorioId: number) => {
    const consultorio = consultorios.find(c => c.id === consultorioId);
    setConsultorioEditandoInsumos(consultorioId);
    setInsumosTemporales(consultorio?.insumosDisponibles || []);
  };

  const toggleInsumoTemporal = (insumo: string) => {
    if (insumosTemporales.includes(insumo)) {
      setInsumosTemporales(insumosTemporales.filter(i => i !== insumo));
    } else {
      setInsumosTemporales([...insumosTemporales, insumo]);
    }
  };

  const guardarInsumos = async () => {
    if (consultorioEditandoInsumos === null) return;

    const consultoriosActualizados = consultorios.map(c => 
      c.id === consultorioEditandoInsumos 
        ? { ...c, insumosDisponibles: insumosTemporales }
        : c
    );

    setConsultorios(consultoriosActualizados);
    
    try {
      await consultoriosApi.updateInsumos(consultorioEditandoInsumos, insumosTemporales);
      toast.success('Insumos actualizados correctamente');
    } catch (err: any) {
      if (err?.message !== 'BACKEND_OFFLINE') {
        console.error('Error guardando insumos:', err);
        toast.error('Error al guardar insumos');
      } else {
        // En modo local, los insumos ya están guardados en el estado
        toast.success('Insumos actualizados correctamente (modo local)');
      }
    }

    setConsultorioEditandoInsumos(null);
    setInsumosTemporales([]);
  };

  const obtenerInsumosRequeridos = (profesionalId?: number): string[] => {
    if (!profesionalId) return [];
    const profesional = profesionales.find(p => p.id === profesionalId);
    
    // Si el profesional tiene insumos definidos, usarlos
    if (profesional?.insumos && profesional.insumos.length > 0) {
      return profesional.insumos;
    }
    
    // Insumos por defecto según especialidad
    const insumosPorEspecialidad: Record<string, string[]> = {
      'Cardiología': ['Estetoscopio', 'Tensiómetro', 'Electrocardiograma', 'Camilla'],
      'Pediatría': ['Estetoscopio', 'Termómetro', 'Otoscopio', 'Depresor lingual', 'Báscula'],
      'Traumatología': ['Camilla', 'Vendas', 'Guantes descartables', 'Gasas estériles', 'Férulas'],
      'Neurología': ['Estetoscopio', 'Lámpara de examen', 'Martillo de reflejos', 'Camilla']
    };
    
    return insumosPorEspecialidad[profesional?.especialidad || ''] || ['Estetoscopio', 'Termómetro', 'Guantes descartables'];
  };

  const calcularEstadoInsumos = (consultorio: Consultorio) => {
    if (!consultorio.profesionalId) {
      return { completos: 0, faltantes: 0, total: 0 };
    }

    const requeridos = obtenerInsumosRequeridos(consultorio.profesionalId);
    const disponibles = consultorio.insumosDisponibles || [];
    
    const completos = requeridos.filter(r => disponibles.includes(r)).length;
    const faltantes = requeridos.length - completos;
    
    return { completos, faltantes, total: requeridos.length };
  };

  const consultoriosAsignados = consultorios.filter(c => c.profesionalId);
  const consultoriosDisponibles = consultorios.filter(c => !c.profesionalId);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-blue-600 text-2xl">Gestión de Consultorios</h1>
            <Button onClick={onBack} variant="outline">Volver al Menú</Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Consultorios</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{consultorios.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Asignados</CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">{consultoriosAsignados.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Disponibles</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-600">{consultoriosDisponibles.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Insumos Completos</CardTitle>
                <Package className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-purple-600">
                  {consultoriosAsignados.filter(c => {
                    const estado = calcularEstadoInsumos(c);
                    return estado.faltantes === 0 && estado.total > 0;
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agregar Nuevo Consultorio */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Nuevo Consultorio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="numero">Número de Consultorio</Label>
                <Input
                  id="numero"
                  placeholder="Ej: 101"
                  value={nuevoConsultorio.numero}
                  onChange={(e) => setNuevoConsultorio({ ...nuevoConsultorio, numero: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="piso">Piso</Label>
                <Input
                  id="piso"
                  placeholder="Ej: 1"
                  value={nuevoConsultorio.piso}
                  onChange={(e) => setNuevoConsultorio({ ...nuevoConsultorio, piso: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="profesional-nuevo">Profesional (opcional)</Label>
                <Select value={profesionalNuevoConsultorio} onValueChange={setProfesionalNuevoConsultorio}>
                  <SelectTrigger id="profesional-nuevo">
                    <SelectValue placeholder="Seleccione profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {profesionales.map(prof => (
                      <SelectItem key={prof.id} value={prof.id?.toString()}>
                        {prof.nombre} {prof.apellido} - {prof.especialidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={agregarConsultorio} className="w-full bg-gray-800 hover:bg-gray-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
            
            {/* Mostrar insumos que se precargarán */}
            {profesionalNuevoConsultorio && profesionalNuevoConsultorio !== 'sin-asignar' && (() => {
              const profesional = profesionales.find(p => p.id?.toString() === profesionalNuevoConsultorio);
              const insumosRequeridos = profesional ? obtenerInsumosRequeridos(profesional.id) : [];
              
              return insumosRequeridos.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm text-blue-900 mb-2">
                        Insumos que se precargarán automáticamente según especialidad ({profesional?.especialidad}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {insumosRequeridos.map((insumo, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {insumo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Lista de Consultorios */}
          <div>
            <h3 className="mb-4">Consultorios Registrados</h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Piso</TableHead>
                    <TableHead>Profesional Asignado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Insumos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultorios.map((consultorio) => {
                    const estadoInsumos = calcularEstadoInsumos(consultorio);
                    const insumosRequeridos = obtenerInsumosRequeridos(consultorio.profesionalId);
                    const insumosDisponibles = consultorio.insumosDisponibles || [];
                    
                    return (
                      <React.Fragment key={consultorio.id}>
                        <TableRow className={filaExpandida === consultorio.id ? 'bg-gray-50' : ''}>
                          <TableCell>
                            {consultorio.profesionalId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFilaExpandida(consultorio.id)}
                              >
                                {filaExpandida === consultorio.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>Consultorio {consultorio.numero}</TableCell>
                          <TableCell>Piso {consultorio.piso}</TableCell>
                          <TableCell>
                            {asignacionActiva === consultorio.id ? (
                              <div className="flex gap-2">
                                <Select value={profesionalSeleccionado} onValueChange={setProfesionalSeleccionado}>
                                  <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Seleccione un profesional" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {profesionales.map(prof => (
                                      <SelectItem key={prof.id} value={prof.id?.toString()}>
                                        {prof.nombre} {prof.apellido} - {prof.especialidad}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button size="sm" onClick={asignarProfesional}>Confirmar</Button>
                                <Button size="sm" variant="outline" onClick={() => setAsignacionActiva(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              consultorio.profesionalNombre || '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {consultorio.profesionalId ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                Asignado
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                Disponible
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {consultorio.profesionalId ? (
                              <div className="flex items-center gap-2">
                                {estadoInsumos.faltantes === 0 && estadoInsumos.total > 0 ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completo
                                  </Badge>
                                ) : estadoInsumos.faltantes > 0 ? (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Faltan {estadoInsumos.faltantes}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Sin insumos
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {consultorio.profesionalId ? (
                                <>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => iniciarEdicionInsumos(consultorio.id)}
                                      >
                                        <Package className="h-4 w-4 mr-1" />
                                        Insumos
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Gestionar Insumos - Consultorio {consultorio.numero}</DialogTitle>
                                        <DialogDescription>
                                          Marque los insumos que están disponibles en este consultorio
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 mt-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                          <h4 className="text-sm mb-2">Insumos sugeridos (comunes):</h4>
                                          <div className="grid grid-cols-2 gap-2">
                                            {insumosComunes.map(insumo => (
                                              <label key={insumo} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={insumosTemporales.includes(insumo)}
                                                  onChange={() => toggleInsumoTemporal(insumo)}
                                                  className="rounded"
                                                />
                                                <span className="text-sm">{insumo}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                          <Button variant="outline" onClick={() => setConsultorioEditandoInsumos(null)}>
                                            Cancelar
                                          </Button>
                                          <Button onClick={guardarInsumos}>
                                            Guardar Insumos
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => desasignarProfesional(consultorio.id)}
                                  >
                                    Desasignar
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {asignacionActiva !== consultorio.id && (
                                    <Button
                                      size="sm"
                                      onClick={() => iniciarAsignacion(consultorio.id)}
                                      className="bg-gray-800 hover:bg-gray-700"
                                    >
                                      Asignar Profesional
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => eliminarConsultorio(consultorio.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Fila expandida con detalles de insumos */}
                        {filaExpandida === consultorio.id && consultorio.profesionalId && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="mb-3 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Detalle de Insumos Requeridos
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {insumosRequeridos.map(insumo => {
                                      const disponible = insumosDisponibles.includes(insumo);
                                      return (
                                        <div 
                                          key={insumo}
                                          className={`flex items-center gap-3 p-3 rounded-lg ${
                                            disponible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                          }`}
                                        >
                                          {disponible ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                          )}
                                          <span className={disponible ? 'text-green-800' : 'text-red-800'}>
                                            {insumo}
                                          </span>
                                          {disponible && (
                                            <Badge className="ml-auto bg-green-100 text-green-800">Disponible</Badge>
                                          )}
                                          {!disponible && (
                                            <Badge className="ml-auto bg-red-100 text-red-800">Faltante</Badge>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                {estadoInsumos.faltantes > 0 && (
                                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                      <div>
                                        <p className="text-orange-800">
                                          <strong>Advertencia:</strong> Faltan {estadoInsumos.faltantes} insumo(s) requerido(s) para este profesional.
                                        </p>
                                        <p className="text-xs text-orange-700 mt-1">
                                          Por favor, complete los insumos antes de que el profesional comience a atender.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {consultorios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No hay consultorios registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

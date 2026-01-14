
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  PlusCircle,
  ClipboardList,
  Flame,
  Calendar,
  RefreshCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Inbox,
  Check,
  PackageSearch,
  Navigation,
  Filter,
  User,
  Hash
} from 'lucide-react';
import { Unit, Personnel } from '../types';
import { sendInspectionToWebhook } from '../services/n8nService';
import { fetchPendientesData, PendingTask } from '../services/dataService';

interface PendientesFormProps {
  units: Unit[];
  currentUser: Personnel;
  onBack: () => void;
}

const PendientesForm: React.FC<PendientesFormProps> = ({ units, currentUser, onBack }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [pendingList, setPendingList] = useState<PendingTask[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtros
  const [filterUnit, setFilterUnit] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario de Registro
  const [newUnit, setNewUnit] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'Baja' | 'Media' | 'Alta'>('Media');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchPendientes = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchPendientesData();
      setPendingList(data);
    } catch (error) {
      console.error("Error al cargar pendientes:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    setUpdatingId(taskId);
    try {
      const task = pendingList.find(t => t.id === taskId);
      const result = await sendInspectionToWebhook({
        id: taskId,
        type: 'pendientes',
        status: status,
        driver: currentUser.name,
        date: new Date().toLocaleDateString('es-AR'),
        unit: task?.unit || '',
        odometer: 0,
        notes: `Estado actualizado a: ${status}`,
        tasks: {},
        extraData: { 
          action: 'update_status', 
          newStatus: status,
          originalTask: task
        }
      });

      if (result.status === 'success') {
        setPendingList(prev => prev.map(item => 
          item.id === taskId ? { ...item, status } : item
        ));
      } else {
        alert("Error de sincronización: " + result.message);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert("Error de conexión: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreatePending = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await sendInspectionToWebhook({
      id: `PEND-${Date.now()}`,
      date: new Date(newDate).toLocaleDateString('es-AR'),
      driver: currentUser.name,
      unit: newUnit,
      odometer: 0,
      type: 'pendientes',
      status: 'Pendiente',
      taskDescription: newDescription,
      notes: `Prioridad: ${newPriority}`,
      tasks: {},
      extraData: { priority: newPriority, action: 'create' }
    });

    setIsSubmitting(false);
    if (result.status === 'success') {
      setSubmitStatus({ type: 'success', message: 'REGISTRO SINCRONIZADO' });
      setTimeout(() => {
        setSubmitStatus(null);
        setNewUnit('');
        setNewDescription('');
        setView('list');
        fetchPendientes();
      }, 3000);
    } else {
      setSubmitStatus({ type: 'error', message: result.message });
    }
  };

  const filteredList = useMemo(() => {
    return pendingList.filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = filterUnit === '' || item.unit === filterUnit;
      
      let matchesDate = true;
      if (filterDate) {
        const [y, m, d] = filterDate.split('-');
        const formattedFilterDate = `${d}/${m}/${y}`;
        matchesDate = item.date === formattedFilterDate;
      }

      return matchesSearch && matchesUnit && matchesDate;
    });
  }, [pendingList, searchTerm, filterUnit, filterDate]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-[#0c121e] rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20">
        <div className="p-6 md:p-10">
          
          {/* Cabecera */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white italic">
                  PENDIENTES
                </h2>
              </div>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] ml-14">Control Operativo de Reparaciones</p>
            </div>
            
            <button 
              onClick={() => setView(view === 'list' ? 'form' : 'list')}
              className="bg-orange-600/10 border border-orange-500/30 px-6 py-4 rounded-2xl flex items-center justify-center gap-4 backdrop-blur-sm hover:bg-orange-500/20 transition-all group"
            >
              {view === 'list' ? <PlusCircle className="text-orange-500 group-hover:scale-110 transition-transform" /> : <ClipboardList className="text-orange-500 group-hover:scale-110 transition-transform" />}
              <div className="flex flex-col items-start text-left">
                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Sección</span>
                <span className="text-white font-bold text-sm tracking-tighter uppercase">{view === 'list' ? 'Cargar Tarea' : 'Ver Bitácora'}</span>
              </div>
            </button>
          </div>

          {!submitStatus ? (
            <>
              {view === 'list' ? (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                  
                  {/* Panel de Filtros */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Unidad</label>
                      <div className="relative">
                        <select 
                          value={filterUnit} 
                          onChange={(e) => setFilterUnit(e.target.value)} 
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3.5 px-10 text-white focus:border-orange-500 outline-none font-bold text-xs appearance-none"
                        >
                          <option value="">TODAS LAS UNIDADES</option>
                          {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-10 text-white focus:border-orange-500 outline-none font-bold text-xs"
                        />
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Buscador</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Filtro rápido..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-10 text-white focus:border-orange-500 outline-none font-bold text-xs"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <button onClick={fetchPendientes} className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors group">
                      <RefreshCcw size={14} className={isLoadingList ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} /> Actualizar Matriz
                    </button>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{filteredList.length} Registros</span>
                  </div>

                  {/* Listado de Tareas */}
                  {isLoadingList ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                      <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                      <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Sincronizando con Sheet...</p>
                    </div>
                  ) : filteredList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-6 bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-800/50">
                      <Inbox size={60} className="text-slate-800" />
                      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sin pendientes para los filtros aplicados</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredList.map((item) => {
                        const isExpanded = expandedId === item.id;
                        const isUpdating = updatingId === item.id;
                        
                        return (
                          <div 
                            key={item.id}
                            className={`bg-slate-950/40 border transition-all duration-300 rounded-3xl overflow-hidden ${isExpanded ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.05)]' : 'border-slate-800/60 hover:border-orange-500/30'}`}
                          >
                            <button 
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="w-full p-5 md:p-7 flex items-center justify-between text-left group"
                            >
                              <div className="flex items-center gap-6">
                                {/* Icono de CAMIÓN solicitado */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${item.status === 'Realizado' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-slate-900 border-slate-800 text-orange-500 shadow-lg shadow-orange-500/5'}`}>
                                  {item.status === 'Realizado' ? <CheckCircle2 size={28} /> : <Truck size={28} />}
                                </div>
                                <div className="space-y-1.5">
                                  {/* UNIDAD e ID con la misma fuente que la fecha */}
                                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                                    <div className="flex items-center gap-1.5">
                                      <Truck size={12} className="text-orange-500" />
                                      <span className="text-[11px] font-black text-white uppercase tracking-widest italic">{item.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Hash size={12} className="text-slate-500" />
                                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">{item.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Calendar size={12} className="text-slate-500" />
                                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border whitespace-nowrap ${item.status === 'Realizado' ? 'bg-green-500/20 text-green-400 border-green-500/30' : item.status === 'Espera repuesto' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : item.status === 'Controlado puede viajar' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                      {item.status}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${item.priority === 'Alta' ? 'text-red-500' : 'text-slate-600'}`}>
                                      <Flame size={12} className={item.priority === 'Alta' ? 'animate-pulse' : ''} /> {item.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className={`${isExpanded ? 'text-orange-500 rotate-180' : 'text-slate-700'} transition-all duration-500`}>
                                <ChevronDown size={28} />
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-7 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
                                  <div className="flex items-center gap-2 mb-3">
                                    <ClipboardList size={16} className="text-orange-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnóstico</span>
                                  </div>
                                  <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                                    {item.description}
                                  </p>
                                </div>

                                {/* ACCIONES DE ESTADO */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <button 
                                    onClick={() => handleUpdateStatus(item.id, "Realizado")}
                                    disabled={isUpdating}
                                    className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border ${item.status === "Realizado" ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-600/20' : 'bg-green-600/5 text-green-500 border-green-500/20 hover:bg-green-600 hover:text-white'}`}
                                  >
                                    {isUpdating && updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                                    Realizado
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleUpdateStatus(item.id, "Espera repuesto")}
                                    disabled={isUpdating}
                                    className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border ${item.status === "Espera repuesto" ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20' : 'bg-orange-600/5 text-orange-500 border-orange-500/20 hover:bg-orange-600 hover:text-white'}`}
                                  >
                                    {isUpdating && updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <PackageSearch size={14} />} 
                                    Espera repuesto
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleUpdateStatus(item.id, "Controlado puede viajar")}
                                    disabled={isUpdating}
                                    className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all border ${item.status === "Controlado puede viajar" ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-blue-600/5 text-blue-500 border-blue-500/20 hover:bg-blue-600 hover:text-white'}`}
                                  >
                                    {isUpdating && updatingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} 
                                    Controlado
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreatePending} className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Fecha de Registro</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={newDate} 
                          onChange={(e) => setNewDate(e.target.value)} 
                          required 
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-orange-500 outline-none font-bold shadow-inner" 
                        />
                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Unidad Afectada</label>
                      <div className="relative">
                        <select 
                          value={newUnit} 
                          onChange={(e) => setNewUnit(e.target.value)} 
                          required 
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-orange-500 outline-none font-bold appearance-none shadow-inner"
                        >
                          <option value="">SELECCIONE UNIDAD...</option>
                          {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        <Truck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Prioridad</label>
                      <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                        {(['Baja', 'Media', 'Alta'] as const).map((p) => (
                          <button 
                            key={p}
                            type="button"
                            onClick={() => setNewPriority(p)}
                            className={`flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${newPriority === p ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            {p === 'Alta' && <Flame size={12} className={newPriority === p ? 'animate-pulse' : ''} />} {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 ml-1">
                        <ClipboardList size={14} className="text-orange-500" />
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Descripción Operativa</label>
                      </div>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        required
                        placeholder="DETALLE LA TAREA O REPARACIÓN PENDIENTE..."
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-6 px-6 text-white focus:border-orange-500 outline-none min-h-[220px] text-sm leading-relaxed shadow-inner"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newUnit || !newDescription}
                    className="w-full py-6 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:bg-orange-500 hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 size={24} /> REGISTRAR EN BITÁCORA</>}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className={`p-14 rounded-3xl flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500 border-2 ${submitStatus.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]'}`}>
              {submitStatus.type === 'success' ? <CheckCircle2 size={80} className="mb-2" /> : <AlertCircle size={80} className="mb-2" />}
              <p className="text-3xl font-black uppercase tracking-[0.2em] text-center italic">
                {submitStatus.message}
              </p>
              
              <div className="w-full flex flex-col gap-4 mt-8">
                <button 
                  type="button"
                  onClick={onBack}
                  className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  VOLVER AL PANEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendientesForm;

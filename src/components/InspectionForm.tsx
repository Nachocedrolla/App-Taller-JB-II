
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Navigation, 
  CheckCircle2, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Droplets,
  Wind,
  Settings2,
  Disc,
  Activity,
  Zap,
  Waves,
  Check,
  Calendar,
  ArrowLeft,
  PlusCircle,
  LogOut,
  Home,
  Building2
} from 'lucide-react';
import { MAINTENANCE_TASKS } from '../constants';
import { InspectionData, Unit, Personnel } from '../types';
import { sendInspectionToWebhook } from '../services/n8nService';

interface InspectionFormProps {
  units: Unit[];
  currentUser: Personnel;
  onBack: () => void;
}

const TaskIcon = ({ name, size = 20 }: { name: string, size?: number }) => {
  switch (name) {
    case 'oil': return <Droplets size={size} className="text-green-400" />;
    case 'filter': return <Wind size={size} className="text-green-400" />;
    case 'gear': return <Settings2 size={size} className="text-green-400" />;
    case 'tire': return <Disc size={size} className="text-green-400" />;
    case 'belt': return <Activity size={size} className="text-green-400" />;
    case 'battery': return <Zap size={size} className="text-green-400" />;
    case 'water': return <Waves size={size} className="text-green-400" />;
    default: return <Settings2 size={size} className="text-green-400" />;
  }
};

const InspectionForm: React.FC<InspectionFormProps> = ({ units, currentUser, onBack }) => {
  const [step, setStep] = useState(1);
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<string>('');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  
  const [tallerType, setTallerType] = useState<'interno' | 'externo'>('interno');
  const [tallerName, setTallerName] = useState('Taller Jota Be');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const otNumber = useMemo(() => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PV-${dateStr}-${rand}`;
  }, []);

  const formatDate = (val: string) => {
    const [year, month, day] = val.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleTallerTypeChange = (type: 'interno' | 'externo') => {
    setTallerType(type);
    setTallerName(type === 'interno' ? 'Taller Jota Be' : '');
  };

  const resetForm = () => {
    setStep(1);
    setUnit('');
    setOdometer('');
    setCompletedTasks(new Set());
    setNotes('');
    setTallerType('interno');
    setTallerName('Taller Jota Be');
    setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !odometer || !date) return;
    setIsSubmitting(true);
    const inspectionData: InspectionData = {
      id: `PREV-${Date.now()}`,
      otNumber: otNumber,
      date: formatDate(date),
      driver: currentUser.name,
      unit,
      odometer: parseInt(odometer),
      type: 'preventivo',
      status: 'completed',
      workshop: tallerName,
      tasks: Object.fromEntries(MAINTENANCE_TASKS.map(t => [t.id, completedTasks.has(t.id) ? parseInt(odometer) : null])),
      notes
    };
    const result = await sendInspectionToWebhook(inspectionData);
    setIsSubmitting(false);
    setSubmitStatus({ 
      type: result.status === 'success' ? 'success' : 'error', 
      message: result.status === 'success' ? 'OPERACIÓN EXITOSA' : result.message 
    });
    
    if (result.status === 'success') {
      setTimeout(() => {
        onBack();
      }, 5000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-[#0c121e] rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50">
        <div className="p-8 md:p-12">
          {/* HEADER ESTILO IMAGEN ADJUNTA */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white italic">
                  PREVENTIVO
                </h2>
              </div>
              {/* DASHES DE PROGRESO (Imagen adjunta) */}
              <div className="flex gap-2 ml-10">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-300 ${s <= (step + 1) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-800'}`}></div>
                ))}
              </div>
            </div>
            
            {/* CAJA OT ASIGNADA (Imagen adjunta) */}
            <div className="bg-slate-900/40 border border-green-500/20 px-6 py-4 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[160px] backdrop-blur-sm">
                <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">OT ASIGNADA</span>
                <span className="text-white font-mono font-bold text-lg tracking-tighter">{otNumber}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {!submitStatus && (
              <>
                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                    {/* SELECTOR DE TALLER (Botones de opción solicitados) */}
                    <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800 space-y-6">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Centro de Reparación</label>
                        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                          <button 
                            type="button"
                            onClick={() => handleTallerTypeChange('interno')}
                            className={`flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tallerType === 'interno' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            <Home size={16} /> INTERNO
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleTallerTypeChange('externo')}
                            className={`flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tallerType === 'externo' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-600 hover:text-slate-400'}`}
                          >
                            <Building2 size={16} /> EXTERNO
                          </button>
                        </div>
                      </div>

                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {tallerType === 'interno' ? (
                          <div className="w-full bg-slate-950/40 border border-green-500/20 rounded-xl py-5 px-6 text-green-400 font-black italic uppercase tracking-widest text-base flex items-center gap-3">
                             <CheckCircle2 size={18} /> {tallerName}
                          </div>
                        ) : (
                          <div className="relative group">
                            <input 
                              type="text" 
                              value={tallerName} 
                              onChange={(e) => setTallerName(e.target.value)} 
                              placeholder="ESCRIBA EL NOMBRE DEL TALLER..." 
                              required={tallerType === 'externo'}
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500/30 font-bold text-sm tracking-wide outline-none transition-all" 
                            />
                            <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 pointer-events-none group-focus-within:text-green-500 transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Fecha Inspección</label>
                        <div className="relative">
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-green-500 outline-none font-bold" />
                          <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Unidad de Flota</label>
                        <div className="relative">
                          <select value={unit} onChange={(e) => setUnit(e.target.value)} required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-green-500 outline-none font-bold appearance-none">
                            <option value="">SELECCIONE UNIDAD...</option>
                            {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                          </select>
                          <Truck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 w-5" />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Lectura de Odómetro</label>
                        <div className="relative">
                          <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="000000" required className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-5 px-6 text-white focus:border-green-500 outline-none font-mono text-2xl tracking-tighter" />
                          <Navigation className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 w-6" />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => setStep(2)} 
                      disabled={!unit || !odometer || (tallerType === 'externo' && !tallerName)} 
                      className="w-full py-6 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:bg-green-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      SIGUIENTE FASE <ChevronRight size={24} className="animate-pulse" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MAINTENANCE_TASKS.map(task => {
                        const isDone = completedTasks.has(task.id);
                        return (
                          <button key={task.id} type="button" onClick={() => {
                            const next = new Set(completedTasks);
                            isDone ? next.delete(task.id) : next.add(task.id);
                            setCompletedTasks(next);
                          }} className={`p-5 rounded-xl border transition-all flex items-center gap-4 ${isDone ? 'bg-green-600/20 border-green-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}>
                            <div className={`p-2.5 rounded-lg ${isDone ? 'bg-green-500' : 'bg-slate-900 border border-slate-800'}`}>
                              {isDone ? <Check size={20} className="text-white" /> : <TaskIcon name={task.iconName} size={20} />}
                            </div>
                            <span className={`text-[12px] font-black uppercase tracking-wide ${isDone ? 'text-green-400' : 'text-slate-400'}`}>{task.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest border border-slate-700">ATRÁS</button>
                      <button type="button" onClick={() => setStep(3)} className="flex-[2] py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-600/20">CONTINUAR</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                    <div className="bg-slate-900/30 rounded-2xl p-8 border border-slate-800 flex flex-col space-y-4">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Observaciones Finales</label>
                      <textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="INGRESE COMENTARIOS ADICIONALES..."
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-6 px-6 text-white focus:border-green-500 outline-none min-h-[200px] text-sm leading-relaxed" 
                      />
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest border border-slate-700">ATRÁS</button>
                      <button type="submit" disabled={isSubmitting} className="flex-[2.5] py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:bg-green-500 transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : 'SINCRONIZAR PROTOCOLO'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {submitStatus && (
              <div className={`p-12 rounded-3xl flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500 border-2 ${submitStatus.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-500'}`}>
                {submitStatus.type === 'success' ? <CheckCircle2 size={80} className="mb-2" /> : <AlertCircle size={80} className="mb-2" />}
                <p className="text-3xl font-black uppercase tracking-[0.2em] text-center">
                  {submitStatus.message}
                </p>

                <div className="w-full flex flex-col gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={onBack}
                    className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    VOLVER AL MENÚ
                  </button>
                  {submitStatus.type === 'success' && (
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="w-full py-6 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 hover:bg-green-500 transition-all active:scale-[0.98]"
                    >
                      <PlusCircle size={24} /> NUEVO REGISTRO
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;

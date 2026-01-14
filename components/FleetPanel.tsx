
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BrainCircuit,
  Database,
  Hash,
  Cpu,
  CalendarDays
} from 'lucide-react';
import { FleetUnit, InspectionData, Personnel } from '../types';
import { sendInspectionToWebhook } from '../services/n8nService';
import { GoogleGenAI } from "@google/genai";

interface FleetPanelProps {
  fleetUnits: FleetUnit[];
  currentUser: Personnel;
  onBack: () => void;
  onRefresh: () => void;
}

const FleetPanel: React.FC<FleetPanelProps> = ({ fleetUnits, currentUser, onBack, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  
  // AI States
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State
  const [newUnit, setNewUnit] = useState({
    id: '',
    plate: '',
    model: '',
    year: '',
    chassisNumber: '',
    engineNumber: '',
    type: 'Tractor'
  });

  const filteredUnits = useMemo(() => {
    return fleetUnits.filter(u => 
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fleetUnits, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const altaData: InspectionData = {
      id: `ALTA-${Date.now()}`,
      date: new Date().toLocaleDateString('es-AR'),
      driver: currentUser.name,
      unit: newUnit.id,
      odometer: 0,
      type: 'alta_unidad',
      status: 'completed',
      tasks: {},
      notes: `Alta técnica: ${newUnit.id} - ${newUnit.model}. Chasis: ${newUnit.chassisNumber}, Motor: ${newUnit.engineNumber}`,
      extraData: newUnit
    };

    const result = await sendInspectionToWebhook(altaData);
    setIsSubmitting(false);
    
    if (result.status === 'success') {
      setSubmitStatus({ type: 'success', message: 'UNIDAD REGISTRADA CON ÉXITO' });
      setTimeout(() => {
        setIsAdding(false);
        setSubmitStatus(null);
        onRefresh();
      }, 3000);
    } else {
      setSubmitStatus({ type: 'error', message: result.message });
    }
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analiza la flota Jota Be con ${fleetUnits.length} unidades registradas en el sheet. Genera un consejo breve sobre gestión de chasis y motores. Responde en 2 líneas.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiSummary(response.text || "Integridad de flota verificada según base de datos.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Error de conexión con el estratega de flota.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedUnit(expandedUnit === id ? null : id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
      {/* Header - Color Ámbar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Maestro de <span className="text-amber-500">Flota</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base de Datos Técnica (Realtime Sheet)</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
        >
          <Plus size={18} /> Nueva Unidad
        </button>
      </div>

      {/* AI Strategist */}
      <div className="mb-8">
        {!aiSummary ? (
          <button 
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="w-full py-4 bg-slate-900/40 border border-amber-500/20 hover:border-amber-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <BrainCircuit className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
              {isAnalyzing ? 'Leyendo Base de Datos...' : 'Consultar Diagnóstico IA de Flota'}
            </span>
          </button>
        ) : (
          <div className="bg-amber-950/20 border border-amber-500/30 p-6 rounded-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setAiSummary(null)} className="absolute top-4 right-4 text-amber-700 hover:text-amber-400">
              <X size={16} />
            </button>
            <div className="flex items-start gap-4">
              <Sparkles className="text-amber-400 shrink-0 mt-1" size={20} />
              <div className="text-amber-100 text-sm leading-relaxed italic font-medium whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-3 relative">
          <input 
            type="text" 
            placeholder="Filtrar por Interno, Dominio o Modelo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 px-14 text-white focus:border-amber-500 outline-none font-bold text-sm shadow-inner transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={22} />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unidades en Sheet</span>
          <span className="text-3xl font-black text-white italic tracking-tighter">{fleetUnits.length}</span>
        </div>
      </div>

      {/* Units List - Data from Sheet */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800/50">
            <Truck size={40} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No se encontraron unidades con ese criterio</p>
          </div>
        ) : (
          filteredUnits.map((unit, idx) => {
            const isExpanded = expandedUnit === unit.id;
            return (
              <div 
                key={idx} 
                className={`bg-[#0c121e] border transition-all duration-300 rounded-3xl overflow-hidden ${isExpanded ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-slate-800/60 hover:border-amber-500/30'}`}
              >
                <button 
                  onClick={() => toggleExpand(unit.id)}
                  className="w-full p-6 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isExpanded ? 'bg-amber-500 text-white border-amber-400 scale-105 shadow-lg shadow-amber-500/20' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                      <Truck size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{unit.id}</h3>
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-black text-amber-500 uppercase">{unit.plate}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                        {unit.model}
                      </p>
                    </div>
                  </div>
                  <div className={`${isExpanded ? 'text-amber-500 rotate-180' : 'text-slate-700'} transition-all duration-500`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <CalendarDays size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Año Modelo</span>
                      </div>
                      <p className="text-lg font-black text-white italic tracking-tight uppercase">
                        {unit.year}
                      </p>
                    </div>
                    
                    <div className="space-y-1 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Hash size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Número de Chasis</span>
                      </div>
                      <p className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
                        {unit.chassisNumber}
                      </p>
                    </div>

                    <div className="space-y-1 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Cpu size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Número de Motor</span>
                      </div>
                      <p className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
                        {unit.engineNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Alta - Se mantiene para envío a Webhook */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[#0c121e] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Incorporar a <span className="text-amber-500">Matriz</span></h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {!submitStatus ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interno</label>
                      <input 
                        type="text" required placeholder="Ej: T-24"
                        value={newUnit.id} onChange={e => setNewUnit({...newUnit, id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dominio</label>
                      <input 
                        type="text" required placeholder="ABC-123"
                        value={newUnit.plate} onChange={e => setNewUnit({...newUnit, plate: e.target.value.toUpperCase()})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-bold uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo</label>
                      <input 
                        type="text" required placeholder="Ej: Scania G310"
                        value={newUnit.model} onChange={e => setNewUnit({...newUnit, model: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Año</label>
                      <input 
                        type="text" placeholder="2024"
                        value={newUnit.year} onChange={e => setNewUnit({...newUnit, year: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Número de Chasis</label>
                      <input 
                        type="text" required placeholder="CHASIS..."
                        value={newUnit.chassisNumber} onChange={e => setNewUnit({...newUnit, chassisNumber: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Número de Motor</label>
                      <input 
                        type="text" required placeholder="MOTOR..."
                        value={newUnit.engineNumber} onChange={e => setNewUnit({...newUnit, engineNumber: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-white focus:border-amber-500 outline-none font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 mt-4"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck size={20} /> Registrar en Sistema Central</>}
                  </button>
                </form>
              ) : (
                <div className={`p-12 rounded-3xl flex flex-col items-center justify-center gap-6 text-center ${submitStatus.type === 'success' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                  {submitStatus.type === 'success' ? <CheckCircle2 size={70} /> : <AlertCircle size={70} />}
                  <h4 className="text-3xl font-black uppercase tracking-widest italic">{submitStatus.message}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Enviando requerimiento a n8n...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetPanel;

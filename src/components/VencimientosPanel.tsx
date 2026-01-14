
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarClock, 
  Search, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  FileText,
  Clock,
  ShieldAlert,
  CalendarCheck,
  Truck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
  X,
  Loader2
} from 'lucide-react';
import { UnitExpiration } from '../types';
import { fetchUnitExpirations, fetchPersonnelExpirations } from '../services/dataService';
import { GoogleGenAI } from "@google/genai";

interface VencimientosPanelProps {
  onBack: () => void;
}

const VencimientosPanel: React.FC<VencimientosPanelProps> = ({ onBack }) => {
  const [data, setData] = useState<UnitExpiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'unidades' | 'choferes'>('unidades');
  const [filterMode, setFilterMode] = useState<'todos' | 'urgente' | 'proximo'>('todos');
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadData = async (tab: 'unidades' | 'choferes') => {
    setLoading(true);
    setError(null);
    setAiSummary(null);
    try {
      const expirations = tab === 'unidades' 
        ? await fetchUnitExpirations() 
        : await fetchPersonnelExpirations();
      
      setData(expirations);
    } catch (err) {
      setError("Error crítico al intentar obtener la información.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const statusPriority = { critical: 0, warning: 1, ok: 2 };

  const processedData = useMemo(() => {
    let filtered = data.filter(u => 
      u.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterMode === 'urgente') {
      filtered = filtered.filter(u => u.expirations.some(e => e.status === 'critical'));
    } else if (filterMode === 'proximo') {
      filtered = filtered.filter(u => u.expirations.some(e => e.status === 'warning'));
    }

    return filtered.sort((a, b) => {
      const aMinStatus = a.expirations.length > 0 
        ? Math.min(...a.expirations.map(i => statusPriority[i.status])) 
        : 3;
      const bMinStatus = b.expirations.length > 0 
        ? Math.min(...b.expirations.map(i => statusPriority[i.status])) 
        : 3;
      
      if (aMinStatus !== bMinStatus) {
        return aMinStatus - bMinStatus;
      }
      
      const aCritCount = a.expirations.filter(i => i.status === 'critical').length;
      const bCritCount = b.expirations.filter(i => i.status === 'critical').length;
      
      if (aCritCount !== bCritCount) return bCritCount - aCritCount;

      return a.unit.localeCompare(b.unit);
    });
  }, [data, searchTerm, filterMode]);

  const toggleUnit = (unit: string) => {
    setExpandedUnit(expandedUnit === unit ? null : unit);
  };

  const getStatusCounts = (items: UnitExpiration['expirations']) => {
    return {
      critical: items.filter(i => i.status === 'critical').length,
      warning: items.filter(i => i.status === 'warning').length,
      ok: items.filter(i => i.status === 'ok').length,
    };
  };

  const runAiAnalysis = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analiza los vencimientos de ${activeTab} del taller Jota Be. Identifica riesgos inmediatos de documentación. Datos: ${JSON.stringify(data.filter(d => d.expirations.some(e => e.status !== 'ok')).slice(0, 10))}. Responde en máximo 3 puntos muy directos y profesionales.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiSummary(response.text || "No se detectaron riesgos críticos inmediatos.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Error al conectar con la inteligencia operativa.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Panel de <span className="text-cyan-500">Vencimientos</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado legal de {activeTab}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('unidades')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'unidades' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Truck size={14} /> Unidades
          </button>
          <button 
            onClick={() => setActiveTab('choferes')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'choferes' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <UserCheck size={14} /> Choferes
          </button>
        </div>
      </div>

      <div className="mb-8 group">
        {!aiSummary ? (
          <button 
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="w-full py-4 bg-slate-900/40 border border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group-hover:bg-slate-900/60"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
            ) : (
              <BrainCircuit className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
              {isAnalyzing ? 'Procesando Inteligencia Flota...' : 'Generar Reporte IA de Riesgos'}
            </span>
          </button>
        ) : (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-6 rounded-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setAiSummary(null)} className="absolute top-4 right-4 text-cyan-700 hover:text-cyan-400">
              <X size={16} />
            </button>
            <div className="flex items-start gap-4">
              <Sparkles className="text-cyan-400 shrink-0 mt-1" size={20} />
              <div className="text-cyan-100 text-sm leading-relaxed italic font-medium whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setFilterMode('todos')} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterMode === 'todos' ? 'bg-slate-800 border-slate-700 text-white shadow-xl' : 'bg-slate-950 border-slate-900 text-slate-500'}`}>
          Todos ({data.length})
        </button>
        <button onClick={() => setFilterMode('urgente')} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${filterMode === 'urgente' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-slate-950 border-slate-900 text-red-500/60'}`}>
          <ShieldAlert size={12} /> Urgentes ({data.filter(u => u.expirations.some(e => e.status === 'critical')).length})
        </button>
        <button onClick={() => setFilterMode('proximo')} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${filterMode === 'proximo' ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg' : 'bg-slate-950 border-slate-900 text-yellow-500/60'}`}>
          <AlertTriangle size={12} /> Próximos ({data.filter(u => u.expirations.some(e => e.status === 'warning')).length})
        </button>
      </div>

      <div className="relative mb-8">
        <input type="text" placeholder={`Buscar ${activeTab === 'unidades' ? 'unidad' : 'chofer'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 px-14 text-white focus:border-cyan-500 outline-none font-bold text-sm shadow-inner" />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={22} />
        <button onClick={() => loadData(activeTab)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-14 h-14 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Matriz Jota Be...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {processedData.map((unitData, idx) => {
            const counts = getStatusCounts(unitData.expirations);
            const isExpanded = expandedUnit === unitData.unit;
            const sortedExpirations = [...unitData.expirations].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

            return (
              <div key={idx} className={`bg-[#0c121e] rounded-3xl border transition-all duration-300 overflow-hidden ${counts.critical > 0 ? 'border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.08)]' : counts.warning > 0 ? 'border-yellow-500/30' : 'border-slate-800/60'}`}>
                <button onClick={() => toggleUnit(unitData.unit)} className="w-full p-7 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${counts.critical > 0 ? 'bg-red-500/10 border-red-500/30 text-red-500' : counts.warning > 0 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>
                      {counts.critical > 0 ? <ShieldAlert size={32} className="animate-pulse" /> : <CalendarCheck size={32} />}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{unitData.unit}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${counts.critical > 0 ? 'bg-red-500 animate-ping' : 'bg-slate-800'}`}></div>
                          <span className={`text-[11px] font-black ${counts.critical > 0 ? 'text-red-500' : 'text-slate-600'}`}>{counts.critical} CRÍTICO</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${counts.warning > 0 ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
                          <span className={`text-[11px] font-black ${counts.warning > 0 ? 'text-yellow-500' : 'text-slate-600'}`}>{counts.warning} PRÓXIMO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${isExpanded ? 'text-cyan-400 rotate-180' : 'text-slate-700'} transition-all duration-500`}>
                    <ChevronDown size={28} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-8 pb-8 pt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-500">
                    {sortedExpirations.map((item, iIdx) => (
                      <div key={iIdx} className={`p-5 rounded-2xl border flex flex-col gap-3 relative overflow-hidden transition-all duration-300 ${item.status === 'critical' ? 'bg-red-500/10 border-red-500/40 shadow-lg' : item.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-slate-900/40 border-slate-800'}`}>
                        <div className="flex justify-between items-start z-10">
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${item.status === 'critical' ? 'text-red-400' : item.status === 'warning' ? 'text-yellow-400' : 'text-slate-500'}`}>{item.document}</span>
                          <FileText size={16} className="text-slate-700" />
                        </div>
                        <div className="flex flex-col z-10">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-mono font-black italic tracking-tighter ${item.status === 'critical' ? 'text-red-500' : item.status === 'warning' ? 'text-yellow-500' : 'text-green-500'}`}>{item.daysLeft <= 0 ? 'VENCIDO' : item.daysLeft}</span>
                            {item.daysLeft > 0 && <span className="text-[10px] font-bold text-slate-600 uppercase">DÍAS RESTANTES</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Clock size={12} />
                            <span className="text-[10px] font-mono font-bold tracking-widest">{item.expiryDate}</span>
                          </div>
                        </div>
                        <div className={`absolute -right-4 -top-4 w-20 h-20 blur-3xl rounded-full opacity-10 ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-cyan-500'}`}></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VencimientosPanel;

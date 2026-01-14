
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  ArrowLeft, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Gauge,
  CircleAlert,
  ShieldCheck,
  History,
  CheckCircle2,
  BrainCircuit,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { MaintenanceAlert } from '../types';
import { fetchAlerts } from '../services/dataService';
import { GoogleGenAI } from "@google/genai";

interface AlertsPanelProps {
  onBack: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ onBack }) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);
  
  // Estados IA
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    setAiSummary(null);
    const data = await fetchAlerts();
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const statusPriority = { critical: 0, warning: 1, ok: 2 };

  const processedAlerts = useMemo(() => {
    let filtered = alerts.filter(a => 
      a.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aMinStatus = Math.min(...a.items.map(i => statusPriority[i.status]));
      const bMinStatus = Math.min(...b.items.map(i => statusPriority[i.status]));
      
      if (aMinStatus !== bMinStatus) return aMinStatus - bMinStatus;
      
      const aCritCount = a.items.filter(i => i.status === 'critical').length;
      const bCritCount = b.items.filter(i => i.status === 'critical').length;
      return bCritCount - aCritCount;
    });
  }, [alerts, searchTerm]);

  const toggleUnit = (unit: string) => {
    setExpandedUnit(expandedUnit === unit ? null : unit);
  };

  const getStatusCounts = (items: MaintenanceAlert['items']) => {
    return {
      critical: items.filter(i => i.status === 'critical').length,
      warning: items.filter(i => i.status === 'warning').length,
      ok: items.filter(i => i.status === 'ok').length,
    };
  };

  const runAiAnalysis = async () => {
    if (alerts.length === 0) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analiza los siguientes estados de mantenimiento predictivo de la flota Jota Be. Identifica qué unidades requieren ingreso al taller URGENTE hoy basándote en los KM restantes críticos. Datos: ${JSON.stringify(alerts.filter(a => a.items.some(i => i.status !== 'ok')).slice(0, 10))}. Responde en máximo 3 bullets muy directos.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiSummary(response.text || "Flota operativa dentro de parámetros normales.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Error de conexión con la IA predictiva.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Radar de <span className="text-blue-500">Mantenimiento</span></h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Análisis predictivo de flota en tiempo real</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Buscar unidad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-10 text-white focus:border-blue-500 font-bold text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <button onClick={loadAlerts} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* IA ANALYZER BAR */}
      <div className="mb-8 group">
        {!aiSummary ? (
          <button 
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="w-full py-4 bg-slate-900/40 border border-blue-500/20 hover:border-blue-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group-hover:bg-slate-900/60"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <BrainCircuit className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
              {isAnalyzing ? 'Analizando Telemetría...' : 'Generar Reporte IA de Riesgos'}
            </span>
          </button>
        ) : (
          <div className="bg-blue-950/20 border border-blue-500/30 p-6 rounded-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setAiSummary(null)} className="absolute top-4 right-4 text-blue-700 hover:text-blue-400">
              <X size={16} />
            </button>
            <div className="flex items-start gap-4">
              <Sparkles className="text-blue-400 shrink-0 mt-1" size={20} />
              <div className="text-blue-100 text-sm leading-relaxed italic font-medium whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-400 font-black uppercase tracking-widest text-xs">Escaneando base de datos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {processedAlerts.map((alert, idx) => {
            const counts = getStatusCounts(alert.items);
            const isExpanded = expandedUnit === alert.unit;
            const sortedItems = [...alert.items].sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

            return (
              <div key={idx} className={`bg-[#0c121e] rounded-3xl border transition-all duration-300 overflow-hidden ${counts.critical > 0 ? 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-slate-800 hover:border-blue-500/30'}`}>
                <button onClick={() => toggleUnit(alert.unit)} className="w-full p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${counts.critical > 0 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {counts.critical > 0 ? <CircleAlert size={28} className="animate-pulse" /> : <ShieldCheck size={28} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight">{alert.unit}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge size={12} className="text-slate-500" />
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{alert.currentKm.toLocaleString()} KM</span>
                      </div>
                      <div className="flex items-center gap-4 mt-0.5">
                        <span className={`text-[12px] font-black italic ${counts.critical > 0 ? "text-red-500" : "text-slate-700"}`}>{counts.critical} CRÍTICOS</span>
                        <span className={`text-[12px] font-black italic ${counts.warning > 0 ? "text-yellow-500" : "text-slate-700"}`}>{counts.warning} PRÓXIMOS</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-600">
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-300">
                    {sortedItems.map((item, iIdx) => (
                      <div key={iIdx} className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden group ${item.status === 'critical' ? 'bg-red-500/5 border-red-500/20' : item.status === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
                        <div className="flex justify-between items-start z-10">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'critical' ? 'text-red-400' : item.status === 'warning' ? 'text-yellow-400' : 'text-slate-500'}`}>{item.task}</span>
                          <History size={14} className="text-slate-700" />
                        </div>
                        <div className="flex items-baseline gap-1 z-10">
                          <span className={`text-2xl font-mono font-black italic ${item.status === 'critical' ? 'text-red-500' : item.status === 'warning' ? 'text-yellow-500' : 'text-white'}`}>{item.remainingKm.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase">KM REST.</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.max(5, Math.min(100, (item.remainingKm / 10000) * 100))}%` }} />
                        </div>
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

export default AlertsPanel;

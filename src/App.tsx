
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InspectionForm from './components/InspectionForm';
import CorrectiveForm from './components/CorrectiveForm';
import PendientesForm from './components/PendientesForm';
import AlertsPanel from './components/AlertsPanel';
import VencimientosPanel from './components/VencimientosPanel';
import FleetPanel from './components/FleetPanel';
import Login from './components/Login';
import { ShieldCheck, Cpu, HardDrive, Loader2, Settings, AlertTriangle, ChevronRight, Bell, CalendarClock, Database, Clock } from 'lucide-react';
import { fetchUnits, fetchPersonnel, fetchRubros, fetchInsumos, fetchFleetData } from './services/dataService';
import { Unit, Personnel, Rubro, Insumo, FleetUnit } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Personnel | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [menuChoice, setMenuChoice] = useState<'preventivo' | 'correctivo' | 'pendientes' | 'alertas' | 'vencimientos' | 'flota' | null>(null);

  const loadData = async () => {
    setIsLoadingData(true);
    const [fetchedUnits, fetchedPersonnel, fetchedRubros, fetchedInsumos, fetchedFleet] = await Promise.all([
      fetchUnits(),
      fetchPersonnel(),
      fetchRubros(),
      fetchInsumos(),
      fetchFleetData()
    ]);
    setUnits(fetchedUnits);
    setPersonnel(fetchedPersonnel);
    setRubros(fetchedRubros);
    setInsumos(fetchedInsumos);
    setFleetUnits(fetchedFleet);
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (user: Personnel) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMenuChoice(null);
  };

  if (isLoadingData && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-cyber-dark flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">
          Accediendo a la Matriz JB...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-cyber-dark">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col z-10">
        <Header />
        
        <main className="flex-grow flex flex-col py-4">
          {!isLoggedIn ? (
            <Login personnel={personnel} onLogin={handleLogin} />
          ) : !menuChoice ? (
            <div className="flex flex-col items-center justify-center p-6 gap-8 animate-in fade-in zoom-in duration-500 mt-10">
              <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter text-center">
                Protocolo <span className="text-blue-500">Operativo</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full max-w-7xl">
                {/* Preventivo */}
                <button 
                  onClick={() => setMenuChoice('preventivo')}
                  className="group relative overflow-hidden bg-cyber-card border border-green-500/20 rounded-3xl p-6 hover:border-green-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Settings size={100} className="text-green-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
                      <Settings className="text-green-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Preventivo</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Kilometraje operativo.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-green-400 font-black text-[9px] uppercase tracking-widest">
                      Ingresar <ChevronRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Correctivo */}
                <button 
                  onClick={() => setMenuChoice('correctivo')}
                  className="group relative overflow-hidden bg-cyber-card border border-red-500/20 rounded-3xl p-6 hover:border-red-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <AlertTriangle size={100} className="text-red-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 border border-red-500/30">
                      <AlertTriangle className="text-red-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Correctivo</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Averías técnicas.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-red-400 font-black text-[9px] uppercase tracking-widest">
                      Protocolo <ChevronRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Pendientes - NUEVO */}
                <button 
                  onClick={() => setMenuChoice('pendientes')}
                  className="group relative overflow-hidden bg-cyber-card border border-orange-500/20 rounded-3xl p-6 hover:border-orange-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Clock size={100} className="text-orange-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/30">
                      <Clock className="text-orange-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Pendientes</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Tareas a futuro.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-orange-400 font-black text-[9px] uppercase tracking-widest">
                      Gestionar <ChevronRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Alertas */}
                <button 
                  onClick={() => setMenuChoice('alertas')}
                  className="group relative overflow-hidden bg-cyber-card border border-blue-500/20 rounded-3xl p-6 hover:border-blue-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Bell size={100} className="text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                      <Bell className="text-blue-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Alertas IA</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Radar predictivo.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-blue-400 font-black text-[9px] uppercase tracking-widest">
                      Ver Radar <ChevronRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Vencimientos */}
                <button 
                  onClick={() => setMenuChoice('vencimientos')}
                  className="group relative overflow-hidden bg-cyber-card border border-cyan-500/20 rounded-3xl p-6 hover:border-cyan-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <CalendarClock size={100} className="text-cyan-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
                      <CalendarClock className="text-cyan-400 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Vencimientos</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Vigencias legales.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-widest">
                      Documentación <ChevronRight size={14} />
                    </div>
                  </div>
                </button>

                {/* Flota - Color Ámbar */}
                <button 
                  onClick={() => setMenuChoice('flota')}
                  className="group relative overflow-hidden bg-cyber-card border border-amber-500/20 rounded-3xl p-6 hover:border-amber-500/60 transition-all text-left shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Database size={100} className="text-amber-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                      <Database className="text-amber-400 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">FLOTA</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Maestro técnico.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-amber-400 font-black text-[9px] uppercase tracking-widest">
                      Administrar <ChevronRight size={14} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : menuChoice === 'preventivo' ? (
            <InspectionForm 
              units={units} 
              currentUser={currentUser!} 
              onBack={() => setMenuChoice(null)}
            />
          ) : menuChoice === 'correctivo' ? (
            <CorrectiveForm
              units={units}
              rubros={rubros}
              insumos={insumos}
              currentUser={currentUser!}
              onBack={() => setMenuChoice(null)}
            />
          ) : menuChoice === 'pendientes' ? (
            <PendientesForm 
              units={units} 
              currentUser={currentUser!} 
              onBack={() => setMenuChoice(null)}
            />
          ) : menuChoice === 'alertas' ? (
            <AlertsPanel onBack={() => setMenuChoice(null)} />
          ) : menuChoice === 'flota' ? (
            <FleetPanel 
              fleetUnits={fleetUnits} 
              currentUser={currentUser!}
              onRefresh={loadData}
              onBack={() => setMenuChoice(null)} 
            />
          ) : (
            <VencimientosPanel onBack={() => setMenuChoice(null)} />
          )}
        </main>

        <footer className="p-12 mt-auto border-t border-slate-900/50 w-full">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex items-center justify-center gap-8 opacity-40">
              <HardDrive className="text-slate-400" size={20} />
              <Cpu className="text-slate-400" size={20} />
              <ShieldCheck className="text-slate-400" size={20} />
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase">
                © {new Date().getFullYear()} TALLER JOTA BE IA • GIOVANNI SERVICIOS IA
              </p>
              <p className="text-[9px] font-bold tracking-[0.15em] text-slate-500/50 uppercase italic">
                Desarrollado por Juan Ignacio Cedrolla
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

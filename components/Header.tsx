
import React from 'react';
import { Cpu, RefreshCcw } from 'lucide-react';
import { APP_CONFIG } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/30 shadow-cyber-glow">
          <Cpu className="text-blue-400 w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic">
            {APP_CONFIG.COMPANY_NAME} <span className="text-blue-500">IA</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-[0.2em]">
            {APP_CONFIG.TAGLINE}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Sincronizado con CRM IA
          </span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
        >
          <RefreshCcw size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;

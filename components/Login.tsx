
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Personnel } from '../types';
import { APP_CONFIG } from '../constants';

interface LoginProps {
  personnel: Personnel[];
  onLogin: (user: Personnel) => void;
}

const Login: React.FC<LoginProps> = ({ personnel, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    // Pequeña pausa para feedback visual de seguridad
    setTimeout(() => {
      const user = personnel.find(p => 
        p.name.trim() === selectedUser.trim() && 
        p.code.toString().trim() === code.trim()
      );
      
      if (user) {
        onLogin(user);
      } else {
        setError('CÓDIGO DE ACCESO INCORRECTO');
        setIsVerifying(false);
      }
    }, 600);
  };

  const isListEmpty = personnel.length === 0;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[60vh]">
      <div className="w-full max-w-md bg-cyber-card rounded-3xl p-8 border border-blue-500/20 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30 shadow-cyber-glow">
            <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">
            Control de <span className="text-blue-500">Acceso</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 text-center">
            SISTEMA DE SEGURIDAD {APP_CONFIG.COMPANY_NAME}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Personal Autorizado</label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                disabled={isListEmpty}
                className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl py-4 px-5 appearance-none text-white focus:outline-none focus:border-blue-500 transition-all font-bold ${isListEmpty ? 'opacity-50' : ''}`}
              >
                {isListEmpty ? (
                  <option value="">Cargando base de datos...</option>
                ) : (
                  <>
                    <option value="">Seleccione su nombre...</option>
                    {personnel.map((p, idx) => (
                      <option key={`${p.name}-${idx}`} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {isListEmpty ? (
                <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 animate-spin" />
              ) : (
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5 pointer-events-none" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">PIN de Seguridad</label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-blue-500 transition-all font-mono text-xl tracking-[0.5em]"
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 animate-pulse">
              <AlertCircle size={18} />
              <span className="text-[10px] font-black tracking-tighter uppercase">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !selectedUser || !code || isListEmpty}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all shadow-cyber-glow ${
              isVerifying || isListEmpty ? 'bg-slate-800 text-slate-500' : 'btn-cyber-primary text-white'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                VERIFICANDO...
              </>
            ) : (
              <>
                ACCEDER AL SISTEMA
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-1">
          <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">
            ENCRYPTED CONNECTION ACTIVE
          </span>
          {isListEmpty && (
            <span className="text-[9px] text-red-500/50 font-bold uppercase animate-pulse">
              Error de sincronización: Verifique conexión o publicación web
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

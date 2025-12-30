import React from 'react';
import { HistoryEntry } from '../types';

interface HistoryLogProps {
  history: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-[#09090b] border border-zinc-800/50 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/20">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-100 font-sans">
              Registro de Sobrevivência
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Timeline de Eventos e Decisões</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {history.length === 0 ? (
            <div className="text-center py-12">
               <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                  <span className="text-zinc-600 text-xl">?</span>
               </div>
               <p className="text-zinc-500 text-sm font-medium">O registro está vazio.</p>
            </div>
          ) : (
            history.map((entry, idx) => (
              <div key={idx} className="relative pl-8 group">
                {/* Timeline Line */}
                {idx !== history.length - 1 && (
                  <div className="absolute left-[11px] top-3 bottom-[-32px] w-px bg-zinc-800/50 group-hover:bg-zinc-700/50 transition-colors"></div>
                )}
                
                {/* Timeline Dot */}
                <div className={`
                  absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-[3px] border-[#09090b] z-10 flex items-center justify-center
                  ${entry.survivalState.toLowerCase().includes('crítico') || entry.survivalState.toLowerCase().includes('ferido')
                    ? 'bg-red-500/20' 
                    : 'bg-emerald-500/20'}
                `}>
                   <div className={`w-2 h-2 rounded-full ${
                      entry.survivalState.toLowerCase().includes('crítico') || entry.survivalState.toLowerCase().includes('ferido')
                      ? 'bg-red-500' 
                      : 'bg-emerald-500'
                   }`}></div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded-full border border-zinc-800">
                      T+{entry.gameTime}h
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {entry.currentLocation}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4 font-sans">
                      {entry.situation}
                    </p>
                    
                    <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/30">
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-600 mt-0.5 min-w-[60px]">Ação</span>
                        <p className="text-amber-500/90 text-sm font-medium">{entry.action}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-600 mt-0.5 min-w-[60px]">Resultado</span>
                        <p className="text-zinc-400 text-sm italic">{entry.feedback}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20 text-center">
           <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Grupo Santo Humberto // Arquivo Confidencial</p>
        </div>
      </div>
    </div>
  );
};

export default HistoryLog;
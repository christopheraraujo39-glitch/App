import React, { useState, useEffect } from 'react';
import { GameStatus } from '../types';

interface ControlsProps {
  status: GameStatus;
  opts: { id: string; text: string }[];
  onSend: (t: string) => void;
  onAction: (type: 'restart' | 'start') => void;
  onHist: () => void;
  cover?: string | null;
}

export default ({ status, opts, onSend, onAction, onHist, cover }: ControlsProps) => {
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  // Reseta o modo custom quando novas opções chegam
  useEffect(() => {
    setCustomMode(false);
    setCustomText("");
  }, [opts]);

  if (status === GameStatus.IDLE) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-50 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-md w-full flex flex-col items-center space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700 py-8">
          {cover && (
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl mb-2 md:mb-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img src={cover} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          )}
          
          <div className="text-center space-y-2 md:space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter">Colapso</h1>
            <p className="text-zinc-500 text-xs md:text-sm font-medium tracking-wide uppercase">Sobrevivência Urbana // Rio de Janeiro</p>
          </div>

          <button 
            onClick={() => onAction('start')} 
            className="w-full py-3 md:py-4 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-zinc-100/10 uppercase tracking-widest text-[10px] md:text-xs"
          >
             Iniciar Simulação
          </button>
          
          <div className="text-[10px] md:text-xs text-zinc-700 font-mono pt-4 md:pt-8">v.1.1.0 &bull; Grupo Santo Humberto</div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="w-full bg-[#09090b] border-t border-zinc-800 p-3 md:p-6 pb-6 md:pb-8">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button 
             onClick={() => onAction('restart')} 
             className="flex-1 py-3 md:py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 uppercase tracking-widest text-[10px] md:text-xs"
          >
             Reiniciar
          </button>
          <button 
             onClick={onHist} 
             className="flex-1 py-3 md:py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-all border border-zinc-700 uppercase tracking-widest text-[10px] md:text-xs"
          >
             Ver Relatório
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800/80 p-3 md:p-6 pb-6 md:pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">
      <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
        
        {opts.length > 0 ? (
           <>
             {!customMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {/* Opções Automáticas (Geralmente 3) */}
                  {opts.slice(0, 3).map((opt) => (
                    <button 
                      key={opt.id} 
                      onClick={() => onSend(opt.text)} 
                      disabled={status === GameStatus.LOADING} 
                      className="group relative flex items-center text-left p-3 md:p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 disabled:opacity-50 active:scale-[0.99] active:bg-zinc-800/80"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-emerald-500 mr-3 transition-colors flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-zinc-300 group-hover:text-white leading-tight">
                          {opt.text}
                        </span>
                    </button>
                  ))}
                  
                  {/* 4ª Opção: Botão para abrir modo de escrita */}
                  <button 
                    onClick={() => setCustomMode(true)} 
                    disabled={status === GameStatus.LOADING} 
                    className="group relative flex items-center text-left p-3 md:p-4 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-xl hover:bg-zinc-800 hover:border-emerald-500/50 transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
                  >
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-emerald-500 mr-3 transition-colors flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium text-zinc-400 group-hover:text-emerald-400 leading-tight italic">
                        Outra ação (Escrever...)
                      </span>
                  </button>
                </div>
             ) : (
                /* Modo de Input Customizado */
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="relative">
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Descreva o que você quer fazer..."
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl p-3 md:p-4 text-zinc-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600 text-xs md:text-sm font-medium resize-none h-20 md:h-24"
                        autoFocus
                      />
                      <div className="flex gap-2 md:gap-3 mt-2 md:mt-3">
                         <button 
                            onClick={() => setCustomMode(false)}
                            className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-[10px] md:text-xs uppercase hover:bg-zinc-700 transition-colors"
                         >
                            Cancelar
                         </button>
                         <button 
                            onClick={() => { if(customText.trim()) onSend(customText); }}
                            disabled={!customText.trim() || status === GameStatus.LOADING}
                            className="flex-1 py-2 md:py-3 rounded-xl bg-emerald-600 text-white font-bold text-[10px] md:text-xs uppercase hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                         >
                            Confirmar Ação
                         </button>
                      </div>
                   </div>
                </div>
             )}
           </>
        ) : (
          <div className="w-full flex items-center justify-center py-2 md:py-4">
             <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest">Aguardando resposta...</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
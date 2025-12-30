import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

export default ({ msgs, dead }: { msgs: ChatMessage[], dead: boolean }) => {
  const endRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  return (
    <div className="w-full max-w-4xl mx-auto h-full overflow-y-auto scrollbar-thin px-3 py-4 md:px-4 md:py-8 space-y-4 md:space-y-6">
      {msgs.map((m, i) => {
        const u = m.role === 'user';
        
        if (u) {
            return (
                <div key={i} className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-zinc-800 text-zinc-200 px-3 py-2 md:px-4 md:py-3 rounded-2xl rounded-tr-sm border border-zinc-700 max-w-[90%] md:max-w-[85%] text-xs md:text-sm font-medium shadow-sm">
                        {m.text}
                    </div>
                </div>
            );
        }

        return (
          <div key={i} className="flex flex-col gap-1.5 md:gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Informação de Contexto (Local/Risco) se disponível e for a última ou importante */}
            {m.location && (
               <div className="flex items-center gap-2 pl-1 mb-0.5">
                  <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono truncate max-w-[200px]">
                      {m.location}
                  </span>
                  {m.isRisky && (
                      <span className="px-1.5 py-0.5 rounded-sm bg-red-900/20 border border-red-900/30 text-[8px] md:text-[9px] font-bold text-red-500 uppercase tracking-wider animate-pulse whitespace-nowrap">
                          Risco Elevado
                      </span>
                  )}
               </div>
            )}

            <div className={`
                p-4 md:p-6 rounded-2xl rounded-tl-sm border shadow-sm relative overflow-hidden
                ${m.isDeath 
                    ? 'bg-red-950/10 border-red-900/50 text-red-100' 
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'}
            `}>
              {/* Imagem Inline se houver - Estilo Tático Bodycam */}
              {m.imageUrl && (
                  <div className="mb-4 md:mb-6 rounded-xl overflow-hidden border border-zinc-700 shadow-2xl relative group bg-black">
                      {/* Overlay REC */}
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-red-500/30">
                         <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_5px_red]" />
                         <span className="text-[8px] md:text-[9px] font-black text-red-500 tracking-widest">REC</span>
                      </div>
                      
                      {/* Overlay Data/Hora Fictícia */}
                      <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10 text-[8px] md:text-[9px] font-mono text-zinc-400/80 tracking-widest bg-black/40 px-1 rounded">
                         CAM-0{Math.floor(Math.random() * 9) + 1}
                      </div>

                      <img 
                        src={m.imageUrl} 
                        alt="Visualização Tática" 
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 scale-100 group-hover:scale-105 transition-transform" 
                      />
                      
                      {/* Scanlines sobre a imagem */}
                      <div className="absolute inset-0 pointer-events-none opacity-20" 
                           style={{background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%'}} 
                      />
                  </div>
              )}

              <div className="prose prose-invert prose-sm max-w-none font-sans leading-relaxed space-y-2 md:space-y-3 text-xs md:text-sm">
                {m.text.split('\n\n').map((p, j) => (
                    <p key={j} className="first:mt-0 last:mb-0">{p}</p>
                ))}
              </div>
              
              {m.isDeath && (
                  <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-red-900/30 text-center">
                      <span className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-[0.2em]">Sinal Vital Perdido</span>
                  </div>
              )}
            </div>
          </div>
        );
      })}
      
      {dead && (
        <div className="py-6 md:py-8 text-center animate-in zoom-in duration-500">
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2 tracking-tight">FIM DE JOGO</h2>
            <p className="text-zinc-500 text-xs md:text-sm">Sua jornada terminou nas ruínas do Rio de Janeiro.</p>
        </div>
      )}
      
      <div ref={endRef} className="h-2 md:h-4" />
    </div>
  );
};
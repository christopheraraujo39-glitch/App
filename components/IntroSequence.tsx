import React, { useEffect } from 'react';

const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 12000); 
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') onComplete();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 md:p-8 text-center cursor-none">
      
      <div className="max-w-4xl w-full border-t-2 border-b-2 border-emerald-900 py-8 md:py-12 animate-in fade-in duration-1000 space-y-6 md:space-y-8">
        
        <h1 className="text-2xl md:text-6xl font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4 md:mb-8 font-mono">
          TACTICAL BRIEFING
        </h1>
        
        <div className="space-y-3 md:space-y-4 text-emerald-200 font-mono text-sm md:text-xl text-left max-w-2xl mx-auto leading-relaxed">
            <p>
              <span className="text-emerald-600 font-bold mr-2">>>></span>
              DATA: <span className="text-white">HOJE. 17:45 HORAS.</span>
            </p>
            <p>
              <span className="text-emerald-600 font-bold mr-2">>>></span>
              LOCAL: <span className="text-white">RIO DE JANEIRO, BRASIL</span>
            </p>
            <p>
              <span className="text-emerald-600 font-bold mr-2">>>></span>
              STATUS DA REDE: <span className="text-amber-500 animate-pulse">INSTÁVEL / INTERMITENTE</span>
            </p>

            <div className="pt-6 md:pt-8 text-xs md:text-sm text-emerald-500 border-t border-emerald-900/50 mt-6 md:mt-8 space-y-2 md:space-y-4">
                <p>O dia segue sua rotina normal. O calor é intenso. O trânsito está parado.</p>
                <p>Relatórios isolados indicam falhas simultâneas em sistemas de energia e comunicação.</p>
                <p>Ninguém sabe a causa. Apenas boatos.</p>
                <p>Press <span className="text-white border border-emerald-600 px-1 text-[10px] md:text-xs">ENTER</span> to start simulation.</p>
            </div>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-emerald-800 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors"
      >
        SKIP_SEQ >>
      </button>

    </div>
  );
};

export default IntroSequence;
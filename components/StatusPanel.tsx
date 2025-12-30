import React, { useState } from 'react';
import TacticalMap from './TacticalMap';

export default ({ hp, inv, state, weather, time = 0 }: { hp: number, inv: string[], state: string, weather?: string, time?: number }) => {
  const [showInv, setShowInv] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Lógica de cores e brilho para HP
  const isCritical = hp < 30;
  // Cores sólidas e lógicas para o LIFE GAUGE
  const hpWidth = `${hp}%`;

  return (
    <>
      <div className="bg-black border-b-2 border-emerald-900/50 sticky top-0 z-30 w-full shadow-lg">
        <div className="max-w-5xl mx-auto p-2 md:p-3">
          
          <div className="flex items-end justify-between gap-3">
            
            {/* LIFE GAUGE */}
            <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                <div className="flex justify-between text-[8px] md:text-[10px] font-bold text-emerald-600 mb-0.5 md:mb-1 tracking-widest">
                    <span>LIFE</span>
                    <span className="truncate max-w-[100px] text-right">{state?.toUpperCase() || "NORMAL"}</span>
                </div>
                <div className="h-4 md:h-6 w-full bg-emerald-950 border-2 border-emerald-800 relative">
                    <div 
                        className={`h-full transition-all duration-300 ease-linear ${isCritical ? 'bg-red-600' : 'bg-amber-400'}`} 
                        style={{ width: hpWidth, maxWidth: '100%' }} 
                    />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 w-full h-full flex" style={{ backgroundImage: 'linear-gradient(to right, transparent 90%, black 10%)', backgroundSize: '5% 100%' }}></div>
                </div>
            </div>

            {/* INFO BLOCK */}
            <div className="flex items-center md:items-end gap-2 md:gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-[8px] md:text-[10px] text-emerald-800 font-bold uppercase">TIME</div>
                    <div className="text-base md:text-xl text-emerald-400 font-bold tracking-widest">{String(time).padStart(4, '0')}H</div>
                </div>
                
                <div className="text-right border-l-2 border-emerald-900 pl-3 hidden md:block">
                    <div className="text-[10px] text-emerald-800 font-bold uppercase">WEATHER</div>
                    <div className="text-sm text-emerald-500 font-bold uppercase truncate max-w-[100px]">{weather || "UNKNOWN"}</div>
                </div>

                <div className="flex gap-1 md:gap-2">
                    <button 
                        onClick={() => setShowMap(true)}
                        className="h-8 md:h-10 px-2 md:px-4 bg-emerald-950 border-2 border-emerald-700 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-colors flex items-center justify-center gap-1.5 group"
                    >
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider group-hover:text-black text-emerald-400">MAP</span>
                    </button>

                    <button 
                        onClick={() => setShowInv(true)}
                        className="h-8 md:h-10 px-2 md:px-4 bg-emerald-950 border-2 border-emerald-700 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-colors flex items-center justify-center gap-1.5 group"
                    >
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider group-hover:text-black text-emerald-400 hidden md:inline">ITEM</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider group-hover:text-black text-emerald-400 md:hidden">INV</span>
                        <span className="bg-black text-emerald-500 px-1 py-0.5 text-[9px] md:text-xs font-bold border border-emerald-800 group-hover:border-black group-hover:text-emerald-400 min-w-[18px] text-center">
                            {inv.length}
                        </span>
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Inventory Window Style MGS */}
      {showInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200 backdrop-blur-sm">
           <div 
             className="bg-black w-full max-w-2xl border-4 border-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex flex-col max-h-[70vh] md:max-h-[80vh]"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="flex items-center justify-between p-2 md:p-3 bg-emerald-900/30 border-b-2 border-emerald-700">
                 <h3 className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-emerald-400">Equipment</h3>
                 <button onClick={() => setShowInv(false)} className="text-xs md:text-base text-emerald-700 hover:text-emerald-400 font-bold uppercase">
                    [CLOSE]
                 </button>
              </div>
              
              <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 overflow-y-auto">
                 {inv.length === 0 ? (
                    <div className="col-span-full h-24 md:h-32 flex items-center justify-center border-2 border-dashed border-emerald-900">
                       <p className="text-xs md:text-sm text-emerald-800 font-bold uppercase tracking-widest">NO ITEMS</p>
                    </div>
                 ) : (
                    inv.map((item, idx) => (
                       <div key={idx} className="aspect-square bg-emerald-950/30 border-2 border-emerald-800 hover:border-emerald-400 hover:bg-emerald-900/50 flex flex-col items-center justify-center p-2 text-center group cursor-default transition-all">
                          <span className="text-[10px] text-emerald-700 font-bold absolute top-1 left-2">0{idx + 1}</span>
                          <span className="text-xs md:text-sm text-emerald-300 font-bold uppercase group-hover:text-white leading-tight">{item}</span>
                       </div>
                    ))
                 )}
              </div>
           </div>
           <div className="absolute inset-0 -z-10" onClick={() => setShowInv(false)} />
        </div>
      )}

      {/* Map Window Style MGS */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 animate-in fade-in duration-200">
           <div 
             className="bg-black w-full max-w-4xl h-[70vh] md:h-[80vh] border-4 border-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="flex items-center justify-between p-2 md:p-3 bg-emerald-900/30 border-b-2 border-emerald-700">
                 <h3 className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-emerald-400">Tactical Radar</h3>
                 <button onClick={() => setShowMap(false)} className="text-xs md:text-base text-emerald-700 hover:text-emerald-400 font-bold uppercase">
                    [CLOSE]
                 </button>
              </div>
              
              <div className="flex-1 overflow-hidden relative p-1 md:p-4">
                 <TacticalMap />
              </div>
              
              <div className="p-2 border-t-2 border-emerald-900 bg-black flex justify-between items-center">
                 <div className="flex gap-2 md:gap-4 text-[8px] md:text-[10px] text-emerald-600 uppercase tracking-widest">
                    <span>RIO DE JANEIRO</span>
                    <span className="animate-pulse text-emerald-400">ONLINE</span>
                 </div>
              </div>
           </div>
           <div className="absolute inset-0 -z-10" onClick={() => setShowMap(false)} />
        </div>
      )}
    </>
  );
};
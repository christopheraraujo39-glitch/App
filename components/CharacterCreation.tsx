import React, { useState, useEffect, useMemo } from 'react';

interface CharacterCreationProps {
  onConfirm: (name: string, location: string, tools: string[]) => void;
  onCancel: () => void;
}

// Pool expandido com itens táticos e itens comuns/inúteis
const TOOL_POOL = [
  // TÁTICO / SOBREVIVÊNCIA
  { id: "Lanterna Tática", desc: "Focal. Requer bateria.", type: "tac" },
  { id: "Canivete Suíço", desc: "Lâmina multiuso.", type: "tac" },
  { id: "Pé-de-cabra", desc: "Arrombamento.", type: "tac" },
  { id: "Corda (15m)", desc: "Escalada e resgate.", type: "tac" },
  { id: "Bússola", desc: "Navegação sem GPS.", type: "tac" },
  { id: "Fita Silver Tape", desc: "Reparos urgentes.", type: "tac" },
  { id: "Mochila Militar", desc: "+Espaço inv.", type: "tac" },
  { id: "Rádio Pilha", desc: "Ouvir estática/SOS.", type: "tac" },
  { id: "Máscara PFF2", desc: "Proteção viral.", type: "tac" },
  { id: "Sinalizador", desc: "Visível a 5km.", type: "tac" },
  { id: "Pastilhas Cloro", desc: "Purificar água suja.", type: "tac" },
  { id: "Manta Térmica", desc: "Evita hipotermia.", type: "tac" },
  
  // COMUM / URBANO / ALEATÓRIO
  { id: "Garrafa PET 2L", desc: "Vazia. Para água.", type: "com" },
  { id: "Isqueiro BIC", desc: "Gás pela metade.", type: "com" },
  { id: "Guarda-Chuva", desc: "Proteção chuva/sol.", type: "com" },
  { id: "Mapa Rodoviário", desc: "Antigo e rasgado.", type: "com" },
  { id: "Álcool em Gel", desc: "Higiene ou fogo.", type: "com" },
  { id: "Baralho", desc: "Passar o tempo.", type: "com" },
  { id: "Colher de Pau", desc: "Cozinhar/Arma ruim.", type: "com" },
  { id: "Cigarros (Maço)", desc: "Moeda de troca.", type: "com" },
  { id: "Cadeado Velho", desc: "Sem a chave.", type: "com" },
  { id: "Óculos Escuros", desc: "Esconder olhar.", type: "com" },
  { id: "Bateria 9V", desc: "Carga duvidosa.", type: "com" },
  { id: "Saco de Lixo", desc: "Impermeabilização.", type: "com" },
  { id: "Revista Velha", desc: "Jornal de 2023.", type: "com" },
  { id: "Chave de Fenda", desc: "Ponta chata.", type: "com" },
  { id: "Martelo", desc: "Construção civil.", type: "com" }
];

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  
  // Aleatoriza 15 itens da pool sempre que o componente monta
  const availableTools = useMemo(() => {
    const shuffled = [...TOOL_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 15);
  }, []);

  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(prev => prev.filter(t => t !== toolId));
    } else {
      if (selectedTools.length < 3) {
        setSelectedTools(prev => [...prev, toolId]);
      }
    }
  };

  const isValid = name.trim().length > 0 && location.trim().length > 0 && selectedTools.length === 3;
  const isFull = selectedTools.length === 3;

  return (
    <div className="absolute inset-0 bg-[#09090b] z-30 overflow-y-auto scrollbar-thin">
      <div className="min-h-full flex flex-col items-center justify-start p-4 md:p-8 pt-4 md:pt-12">
        
        <div className="max-w-2xl w-full space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center md:text-left space-y-1 md:space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tighter font-sans">Identificação</h2>
            <p className="text-xs md:text-sm text-zinc-500 font-medium">Preencha os dados e vasculhe o que sobrou.</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-4 md:p-8 shadow-2xl space-y-4 md:space-y-8">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-1 md:space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  placeholder="Ex: João Silva"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 md:p-4 text-zinc-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all placeholder:text-zinc-700 text-sm font-medium"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Local Inicial</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={40}
                  placeholder="Ex: Metrô da Carioca"
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 md:p-4 text-zinc-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:outline-none transition-all placeholder:text-zinc-700 text-sm font-medium"
                />
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2 md:space-y-4">
               <div className="flex justify-between items-end px-1 border-b border-zinc-800 pb-2">
                  <div className="flex flex-col">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                       Recursos
                    </label>
                    <span className="text-[9px] md:text-[10px] text-zinc-600 font-medium mt-0.5">Pegue 3 itens.</span>
                  </div>
                  <div className="flex items-center gap-4">
                     {selectedTools.length > 0 && (
                        <button onClick={() => setSelectedTools([])} className="text-[9px] text-zinc-500 hover:text-red-400 font-bold uppercase tracking-wider transition-colors pb-1">Limpar</button>
                     )}
                     <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded bg-zinc-950 border transition-all duration-300 ${isFull ? 'border-emerald-500/50 bg-emerald-900/10 scale-105' : 'border-zinc-800'}`}>
                        <span className={`text-[10px] md:text-xs font-mono font-bold ${isFull ? 'text-emerald-400' : 'text-zinc-500'}`}>
                           {selectedTools.length}/3
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                 {availableTools.map((tool) => {
                   const isSelected = selectedTools.includes(tool.id);
                   const isDisabled = !isSelected && isFull;
                   const isTactical = tool.type === 'tac';
                   
                   return (
                     <button
                       key={tool.id}
                       onClick={() => toggleTool(tool.id)}
                       disabled={isDisabled}
                       className={`
                         relative group p-2 md:p-3 rounded-xl border-2 text-left transition-all duration-200
                         ${isSelected 
                           ? 'bg-zinc-100 border-white shadow-lg shadow-white/10 z-10' 
                           : 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900'}
                         ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed border-transparent' : 'cursor-pointer'}
                       `}
                     >
                       <div className="flex flex-col gap-0.5">
                         <div className="flex justify-between w-full items-center">
                            <span className={`text-[10px] md:text-xs font-bold leading-tight ${isSelected ? 'text-black' : 'text-zinc-300 group-hover:text-white'}`}>
                            {tool.id}
                            </span>
                            {isTactical && !isSelected && <span className="text-[8px] text-emerald-900/40 font-black uppercase">TÁTICO</span>}
                         </div>
                         <span className={`text-[9px] md:text-[10px] leading-tight ${isSelected ? 'text-zinc-600' : 'text-zinc-500'} truncate`}>
                           {tool.desc}
                         </span>
                       </div>
                       {isSelected && (
                         <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 pt-2 md:pt-4 pb-8">
            <button 
              onClick={onCancel}
              className="w-full md:w-auto px-6 py-3 md:px-8 md:py-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors border border-transparent hover:border-zinc-800"
            >
              Voltar
            </button>
            <button 
              onClick={() => isValid && onConfirm(name, location, selectedTools)}
              disabled={!isValid}
              className={`
                w-full flex-1 py-3 md:py-4 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-xl
                ${isValid 
                  ? 'bg-zinc-100 text-black hover:bg-white hover:scale-[1.01] shadow-zinc-100/10' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'}
              `}
            >
              Confirmar Identidade
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
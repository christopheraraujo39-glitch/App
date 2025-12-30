import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- DATABASE DE SUB-REGIÕES (Geograficamente Precisas) ---
// O primeiro item de cada lista é o HUB visual que aparece em zoom baixo.

// ZONA OESTE (A maior área, dividida em 3 setores táticos)
const OESTE_EXTREMO = ["Santa Cruz", "Campo Grande", "Sepetiba", "Paciência", "Cosmos", "Inhoaíba", "Senador Camará", "Santíssimo", "Guaratiba", "Pedra de Guaratiba"];
const OESTE_INTERIOR = ["Bangu", "Realengo", "Deodoro", "Vila Militar", "Padre Miguel", "Sulacap", "Magalhães Bastos", "Gericinó", "Vila Valqueire", "Jardim Sulacap"];
const OESTE_LITORAL = ["Barra da Tijuca", "Jacarepaguá", "Recreio", "Freguesia (JPA)", "Taquara", "Tanque", "Pechincha", "Curicica", "Cidade de Deus", "Anil", "Itanhangá", "Joá", "Vargem Grande", "Vargem Pequena", "Grumari", "Camorim", "Gardênia Azul"];

// ZONA NORTE (Dividida em Tijuca/Central, Subúrbio e Ilha)
const NORTE_TIJUCA = ["Tijuca", "Maracanã", "Vila Isabel", "Grajaú", "Andaraí", "Alto da Boa Vista", "Praça da Bandeira", "São Francisco Xavier", "Rio Comprido"]; // Rio Comprido as vezes é centro, mas geograficamente colado aqui
const NORTE_SUBURBIO = ["Méier", "Madureira", "Engenho de Dentro", "Cachambi", "Del Castilho", "Inhaúma", "Pilares", "Abolição", "Piedade", "Cascadura", "Quintino", "Encantado", "Lins de Vasconcelos", "Rocha", "Riachuelo", "Sampaio"];
const NORTE_LEOPOLDINA = ["Penha", "Pavuna", "Ramos", "Bonsucesso", "Maré", "Olaria", "Complexo do Alemão", "Vigário Geral", "Parada de Lucas", "Cordovil", "Irajá", "Anchieta", "Guadalupe", "Ricardo de Albuquerque", "Coelho Neto", "Acari", "Rocha Miranda", "Honório Gurgel", "Vicente de Carvalho", "Vila da Penha", "Vista Alegre"];
const NORTE_ILHA = ["Ilha do Gov.", "Galeão", "Portuguesa", "Jardim Guanabara", "Cacuia", "Cocotá", "Cidade Universitária", "Ribeira", "Zumbi", "Bancários"];

// CENTRO (Núcleo denso)
const CENTRO_MAIN = ["Centro", "Lapa", "São Cristóvão", "Santa Teresa", "Glória", "Estácio", "Cidade Nova", "Gamboa", "Santo Cristo", "Saúde", "Caju", "Benfica", "Mangueira", "Catumbi", "Paquetá"];

// ZONA SUL (Faixa costeira)
const SUL_MAIN = ["Copacabana", "Ipanema", "Botafogo", "Leblon", "Flamengo", "Leme", "Urca", "Lagoa", "Jardim Botânico", "Gávea", "São Conrado", "Vidigal", "Rocinha", "Humaitá", "Laranjeiras", "Catete", "Cosme Velho"];

// Áreas Verdes / Marcos Estratégicos (Ajustados para coordenadas novas)
const PARKS = [
  { name: "PQ. FLAMENGO", x: 620, y: 230, color: "#4ade80" }, // Perto da Glória/Centro
  { name: "JARDIM BOTÂNICO", x: 590, y: 270, color: "#4ade80" }, // Acima da Lagoa
  { name: "QUINTA DA BOA VISTA", x: 580, y: 190, color: "#4ade80" }, // São Cristóvão
  { name: "PARQUE MADUREIRA", x: 420, y: 140, color: "#4ade80" }, // Coração do subúrbio
  { name: "FLORESTA DA TIJUCA", x: 500, y: 240, color: "#166534" }, // Divisor Norte/Sul/Oeste
  { name: "PEDRA BRANCA", x: 200, y: 280, color: "#166534" }, // Maciço Oeste
  { name: "RESERVA MARAPENDI", x: 300, y: 380, color: "#166534" }, // Barra/Recreio
];

// Cores Táticas
const ZONE_COLORS = {
  CENTRAL: "#e2e8f0", // Branco
  SUL: "#67e8f9",     // Cyan Claro
  NORTE: "#fcd34d",   // Amarelo
  OESTE: "#34d399",   // Verde Esmeralda
  ILHA: "#a78bfa"     // Roxo (Destaque Ilha)
};

const generatePositions = (items: string[], minX: number, maxX: number, minY: number, maxY: number) => {
  return items.map((item, i) => {
    // Distribuição em Grid orgânico
    const cols = Math.ceil(Math.sqrt(items.length * 1.5)); 
    const rows = Math.ceil(items.length / cols);
    const cellW = (maxX - minX) / cols;
    const cellH = (maxY - minY) / rows;
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Jitter para parecer menos artificial
    const x = minX + (col * cellW) + (cellW * 0.5) + (Math.random() - 0.5) * (cellW * 0.4);
    const y = minY + (row * cellH) + (cellH * 0.5) + (Math.random() - 0.5) * (cellH * 0.4);

    return { id: item, x, y, index: i }; // O índice aqui é relativo ao subgrupo! Importante para LOD distribuído.
  });
};

const TacticalMap: React.FC = () => {
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.9 }); // Zoom inicial menor para ver tudo
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [scanLine, setScanLine] = useState(0);

  const mapPoints = useMemo(() => {
    // Coordenadas baseadas em ViewBox 0 0 800 500
    // Oeste: Esquerda massiva. Norte: Topo Direita. Centro/Sul: Ponta Direita Baixo.
    
    return {
      oeste: [
        ...generatePositions(OESTE_EXTREMO, 20, 180, 220, 420), // Sta Cruz (Fundo Esq)
        ...generatePositions(OESTE_INTERIOR, 150, 280, 150, 250), // Bangu/Deodoro (Meio Esq Alto)
        ...generatePositions(OESTE_LITORAL, 250, 450, 300, 420), // Barra (Meio Baixo Litoral)
      ],
      norte: [
        ...generatePositions(NORTE_TIJUCA, 500, 560, 200, 240), // Tijuca (Perto do Centro/Sul)
        ...generatePositions(NORTE_SUBURBIO, 380, 500, 120, 190), // Méier/Madureira (Centro-Norte)
        ...generatePositions(NORTE_LEOPOLDINA, 450, 580, 60, 140), // Penha (Topo Direita)
      ],
      ilha: generatePositions(NORTE_ILHA, 580, 680, 30, 90), // Ilha (Extremo Topo Dir)
      central: generatePositions(CENTRO_MAIN, 580, 640, 180, 230), // Centro (Leste Baía)
      sul: generatePositions(SUL_MAIN, 580, 700, 250, 350) // Sul (Extremo Sudeste Litoral)
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setScanLine(p => (p + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    const delta = -Math.sign(e.deltaY);
    const newK = Math.min(Math.max(transform.k * (delta > 0 ? scaleFactor : 1 / scaleFactor), 0.6), 15);
    setTransform(prev => ({ ...prev, k: newK }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);
  const resetMap = () => setTransform({ x: 0, y: 0, k: 0.9 });

  // LOD: Mostra Hubs (index baixo) primeiro.
  const getVisibility = (index: number) => {
    const k = transform.k;
    if (index < 3) return true; // Hubs principais visíveis sempre
    if (index < 6) return k > 1.2; // Camada secundária
    if (index < 10) return k > 2.0; // Camada terciária
    return k > 4.0; // Detalhe máximo
  };

  const renderZonePoints = (points: {id: string, x: number, y: number, index: number}[], color: string) => {
    return points.map((p, uniqueIdx) => {
      const isVisible = getVisibility(p.index);
      // Pontos muito pequenos somem totalmente em zoom baixo para limpar a visão
      if (!isVisible && p.index > 8) return null; 

      const isHub = p.index < 3;

      return (
        <g key={`${p.id}-${uniqueIdx}`} transform={`translate(${p.x}, ${p.y})`}>
          {/* Marcador */}
          <circle 
            r={isHub ? 4 / transform.k : 2 / transform.k} 
            fill={isVisible ? color : `${color}60`} 
            stroke="black" 
            strokeWidth={0.5 / transform.k}
          />
          
          {/* Texto */}
          {isVisible && (
            <g>
               {/* Background do texto para contraste */}
               <rect 
                  x={-(p.id.length * 3) / transform.k} 
                  y={-9 / transform.k} 
                  width={(p.id.length * 6) / transform.k} 
                  height={8 / transform.k} 
                  fill="black" 
                  opacity="0.7"
                  rx={2 / transform.k}
               />
               <text 
                  y={-2 / transform.k} 
                  textAnchor="middle" 
                  fill={color} 
                  fontWeight={isHub ? "bold" : "normal"}
                  className="select-none cursor-crosshair"
                  style={{ textShadow: '0 0 2px black' }}
               >
                  {p.id.toUpperCase()}
               </text>
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center border-2 border-emerald-900/50 cursor-grab active:cursor-grabbing group">
      
      {/* Grid Tático Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
            backgroundImage: 'linear-gradient(#333 0.5px, transparent 0.5px), linear-gradient(90deg, #333 0.5px, transparent 0.5px)', 
            backgroundSize: '50px 50px' 
        }} 
      />

      <svg 
        ref={svgRef}
        viewBox="0 0 800 500" 
        className="w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`} style={{ transition: isDragging ? 'none' : 'transform 0.1s ease-out', transformOrigin: 'center' }}>
            
            {/* --- GEOGRAFIA (POLÍGONOS APROXIMADOS) --- */}
            
            {/* OESTE: Grande massa à esquerda, subindo até Deodoro e descendo para Barra */}
            <path d="M 10,250 L 150,150 L 320,130 L 380,180 L 450,320 L 480,420 L 250,480 L 10,450 Z" 
                  fill={`${ZONE_COLORS.OESTE}15`} stroke={ZONE_COLORS.OESTE} strokeWidth="1" strokeOpacity="0.4" vectorEffect="non-scaling-stroke"/>

            {/* NORTE: Topo, contornando a baía (sem a ilha) */}
            <path d="M 320,130 L 350,50 L 580,50 L 550,150 L 520,230 L 380,180 Z" 
                  fill={`${ZONE_COLORS.NORTE}15`} stroke={ZONE_COLORS.NORTE} strokeWidth="1" strokeOpacity="0.4" vectorEffect="non-scaling-stroke"/>

            {/* ILHA: Separada no canto superior direito */}
            <path d="M 590,30 L 680,30 L 700,90 L 600,100 Z" 
                  fill={`${ZONE_COLORS.ILHA}20`} stroke={ZONE_COLORS.ILHA} strokeWidth="1" strokeOpacity="0.5" vectorEffect="non-scaling-stroke"/>

            {/* CENTRO: Pequeno, na borda da baía */}
            <path d="M 550,150 L 650,160 L 640,230 L 560,220 Z" 
                  fill={`${ZONE_COLORS.CENTRAL}20`} stroke={ZONE_COLORS.CENTRAL} strokeWidth="1" strokeOpacity="0.5" vectorEffect="non-scaling-stroke"/>

            {/* SUL: Faixa costeira inferior direita */}
            <path d="M 560,220 L 640,230 L 680,300 L 720,350 L 580,360 L 520,280 Z" 
                  fill={`${ZONE_COLORS.SUL}15`} stroke={ZONE_COLORS.SUL} strokeWidth="1" strokeOpacity="0.4" vectorEffect="non-scaling-stroke"/>


            {/* --- PONTOS E TEXTOS --- */}
            <g style={{ fontSize: `${10 / transform.k}px` }}>
                {renderZonePoints(mapPoints.oeste, ZONE_COLORS.OESTE)}
                {renderZonePoints(mapPoints.norte, ZONE_COLORS.NORTE)}
                {renderZonePoints(mapPoints.ilha, ZONE_COLORS.ILHA)}
                {renderZonePoints(mapPoints.central, ZONE_COLORS.CENTRAL)}
                {renderZonePoints(mapPoints.sul, ZONE_COLORS.SUL)}
            </g>

            {/* PARQUES (Camada Superior) */}
            <g style={{ fontSize: `${10 / transform.k}px` }}>
                {PARKS.map((park, i) => (
                   <g key={`pk-${i}`} transform={`translate(${park.x}, ${park.y})`} style={{ opacity: transform.k > 0.8 ? 1 : 0.6 }}>
                      <path d={`M 0,${-8/transform.k} L ${-5/transform.k},0 L ${5/transform.k},0 Z`} fill={park.color} stroke="white" strokeWidth={0.5/transform.k} />
                      {transform.k > 1.0 && (
                          <text y={10 / transform.k} textAnchor="middle" fill={park.color} className="select-none font-bold" style={{textShadow: '0 0 5px black'}}>
                              {park.name}
                          </text>
                      )}
                   </g>
                ))}
            </g>

            {/* LABELS DAS ZONAS (MACRO) */}
            <g className="font-mono font-bold select-none pointer-events-none tracking-widest" style={{ fontSize: `${50 / transform.k}px`, opacity: transform.k < 1.5 ? 0.15 : 0 }}>
                <text x="250" y="320" textAnchor="middle" fill={ZONE_COLORS.OESTE}>ZONA OESTE</text>
                <text x="450" y="100" textAnchor="middle" fill={ZONE_COLORS.NORTE}>ZONA NORTE</text>
                <text x="650" y="70" textAnchor="middle" fill={ZONE_COLORS.ILHA} style={{fontSize: `${30/transform.k}px`}}>ILHA</text>
                <text x="700" y="200" textAnchor="middle" writingMode="tb" fill={ZONE_COLORS.CENTRAL} style={{fontSize: `${40/transform.k}px`}}>CENTRO</text>
                <text x="650" y="320" textAnchor="middle" fill={ZONE_COLORS.SUL}>ZONA SUL</text>
            </g>

        </g>
        
        {/* Efeito Scanline */}
        <line x1={`${scanLine}%`} y1="0" x2={`${scanLine}%`} y2="100%" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" style={{ pointerEvents: 'none' }} />
      </svg>
      
      {/* Legenda Tática */}
      <div className="absolute top-2 left-2 p-3 bg-black/90 border border-zinc-800 backdrop-blur-sm pointer-events-none rounded-lg max-w-[200px] shadow-2xl">
         <div className="text-[10px] text-zinc-400 font-bold font-mono mb-2 uppercase tracking-widest border-b border-zinc-800 pb-1">Setores Regionais</div>
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{backgroundColor: ZONE_COLORS.CENTRAL, boxShadow: `0 0 5px ${ZONE_COLORS.CENTRAL}`}}></div><span className="text-[9px] text-zinc-300 font-bold">CENTRO / HISTÓRICO</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{backgroundColor: ZONE_COLORS.SUL, boxShadow: `0 0 5px ${ZONE_COLORS.SUL}`}}></div><span className="text-[9px] text-zinc-300 font-bold">ZONA SUL / COSTA</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{backgroundColor: ZONE_COLORS.NORTE, boxShadow: `0 0 5px ${ZONE_COLORS.NORTE}`}}></div><span className="text-[9px] text-zinc-300 font-bold">ZONA NORTE / SUBÚRBIO</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{backgroundColor: ZONE_COLORS.ILHA, boxShadow: `0 0 5px ${ZONE_COLORS.ILHA}`}}></div><span className="text-[9px] text-zinc-300 font-bold">ILHA DO GOVERNADOR</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{backgroundColor: ZONE_COLORS.OESTE, boxShadow: `0 0 5px ${ZONE_COLORS.OESTE}`}}></div><span className="text-[9px] text-zinc-300 font-bold">ZONA OESTE / EXPANSÃO</span></div>
         </div>
      </div>
      
      {/* Controles Zoom */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
         <div className="text-[9px] text-zinc-500 font-mono text-center mb-1">MAG: {transform.k.toFixed(1)}x</div>
         <button onClick={() => setTransform(p => ({ ...p, k: Math.min(p.k + 0.5, 15) }))} className="w-8 h-8 bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 flex items-center justify-center rounded">+</button>
         <button onClick={() => setTransform(p => ({ ...p, k: Math.max(p.k - 0.5, 0.6) }))} className="w-8 h-8 bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 flex items-center justify-center rounded">-</button>
         <button onClick={resetMap} className="w-8 h-8 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[9px] hover:bg-zinc-800 flex items-center justify-center rounded font-bold">RST</button>
      </div>

    </div>
  );
};

export default TacticalMap;
import React, { useState, useEffect } from 'react';
import { gameTurn, getCover } from './services/geminiService';
import { GameStatus, ChatMessage, GameState, HistoryEntry } from './types';
import Terminal from './components/Terminal';
import Controls from './components/Controls';
import HistoryLog from './components/HistoryLog';
import StatusPanel from './components/StatusPanel';
import CharacterCreation from './components/CharacterCreation';
import IntroSequence from './components/IntroSequence';

const App: React.FC = () => {
  const [status, setStatus] = useState(GameStatus.IDLE);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [opts, setOpts] = useState<{id:string, text:string}[]>([]);
  const [hist, setHist] = useState<HistoryEntry[]>([]);
  const [histOpen, setHistOpen] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  
  const [state, setState] = useState<GameState>({
    health: 100, inventory: [], currentLocation: "Rio de Janeiro", currentWeather: "", gameTime: 0, survivalState: "", lastSituation: ""
  });

  // Carrega capa inicial
  useEffect(() => { 
    getCover().then(url => {
      if (url) {
        setCover(url);
      }
    }); 
  }, []);

  const processTurn = async (payload: { action?: string, name?: string, loc?: string, tools?: string[] }) => {
    setStatus(GameStatus.LOADING);
    if (payload.action) setMsgs(p => [...p, { role: 'user', text: payload.action! }]);
    else { setMsgs([]); setHist([]); }

    try {
      const res = await gameTurn({ ...payload, state });
      const isDead = res.status === 'DEAD' || res.health <= 0;
      
      const text = isDead ? `${res.feedback}\n\n${res.situation}` : `${res.feedback}\n\n${res.situation}`;
      
      // Atualiza imagem de fundo se houver nova
      if (res.imageUrl) setBgImage(res.imageUrl);

      setMsgs(p => [...p, { role: 'model', text, isDeath: isDead, imageUrl: res.imageUrl, location: res.currentLocation, isRisky: res.isRisky }]);

      if (payload.action) {
        setHist(p => [...p, {
          turn: p.length + 1, action: payload.action!, feedback: res.feedback, situation: state.lastSituation,
          currentLocation: state.currentLocation, health: res.health, currentWeather: state.currentWeather, gameTime: state.gameTime, survivalState: res.survivalState, inventory: state.inventory, lastSituation: ""
        }]);
      }

      setState({
        health: res.health, inventory: res.inventory, currentLocation: res.currentLocation,
        currentWeather: res.currentWeather, gameTime: res.gameTime, survivalState: res.survivalState, lastSituation: res.situation
      });
      
      setOpts(isDead ? [] : res.options);
      setStatus(isDead ? GameStatus.GAME_OVER : GameStatus.PLAYING);
    } catch {
      setMsgs(p => [...p, { role: 'model', text: "ERRO DE CONEXÃO. REINICIANDO SISTEMA..." }]);
      setStatus(payload.action ? GameStatus.PLAYING : GameStatus.IDLE);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#09090b] text-zinc-100 overflow-hidden font-sans flex flex-col">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        {bgImage && (
            <img 
              src={bgImage} 
              className="w-full h-full object-cover grayscale transition-opacity duration-1000"
              alt="Background"
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#09090b]/90 to-[#09090b]" />
      </div>

      <HistoryLog history={hist} isOpen={histOpen} onClose={() => setHistOpen(false)} />

      {/* Camada Principal de Conteúdo */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Topo: Status Panel */}
        {[GameStatus.PLAYING, GameStatus.LOADING, GameStatus.GAME_OVER].includes(status) && (
           <StatusPanel hp={state.health} inv={state.inventory} state={state.survivalState} weather={state.currentWeather} time={state.gameTime} />
        )}

        {/* Centro: Terminal Chat */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {[GameStatus.PLAYING, GameStatus.LOADING, GameStatus.GAME_OVER].includes(status) && (
             <Terminal msgs={msgs} dead={status === GameStatus.GAME_OVER} />
          )}
        </div>

        {/* Rodapé: Controles / Modais */}
        <div className="flex-shrink-0">
            {status === GameStatus.IDLE && (
              <Controls status={status} opts={[]} onSend={() => {}} onAction={(type) => setStatus(type === 'start' ? GameStatus.INTRO : GameStatus.INTRO)} onHist={() => setHistOpen(true)} cover={cover} />
            )}
            
            {status === GameStatus.INTRO && (
              <IntroSequence onComplete={() => setStatus(GameStatus.CREATION)} />
            )}

            {status === GameStatus.CREATION && (
              <CharacterCreation onConfirm={(n, l, t) => processTurn({ name: n, loc: l, tools: t })} onCancel={() => setStatus(GameStatus.IDLE)} />
            )}
            
            {[GameStatus.PLAYING, GameStatus.LOADING, GameStatus.GAME_OVER].includes(status) && (
              <Controls status={status} opts={opts} onSend={(t) => processTurn({ action: t })} onAction={(type) => type === 'restart' ? setStatus(GameStatus.CREATION) : null} onHist={() => setHistOpen(true)} />
            )}
        </div>
      </div>

    </div>
  );
};
export default App;
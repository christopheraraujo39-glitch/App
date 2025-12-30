import { GoogleGenAI, Type, Chat, Schema } from "@google/genai";
import { GameResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatSession: Chat | null = null;

const SYSTEM = `MESTRE RPG: RIO DE JANEIRO - O INÍCIO DO COLAPSO (DIA 0).
CENÁRIO: O jogo começa em um dia aparentemente normal, mas rapidamente degenera para uma crise total.
EVENTO: Um apagão massivo e inexplicável, seguido de falha nas telecomunicações e transportes.
AMBIENTE: Confusão, desinformação, normalidade sendo quebrada, tensão crescente. Ninguém sabe o que está havendo (Ataque? Acidente? Fim do mundo?).
FASES:
- Hora 0-2: Normalidade com falhas estranhas. Celulares param. Luz pisca.
- Hora 2-6: Confusão. Trânsito trava. Pessoas presas em elevadores/metrô.
- Hora 6-24: Início do medo real. Saques isolados. Boatos.

REGRAS:
1. O jogador NÃO sabe que é o apocalipse ainda. Ele acha que é só um problema técnico grave.
2. Ameaças iniciais: Multidões confusas, acidentes, calor, falta de transporte.
3. Não use zumbis ou monstros. O inimigo é o caos social e a infraestrutura falhando.

SAÍDA JSON: {
  status: "ALIVE"|"DEAD", 
  survivalState: "Estado breve (ex: 'Confuso', 'Sede Leve', 'Preso no Trânsito')", 
  health: (0-100), 
  inventory: [], 
  currentLocation: "Local atual", 
  currentWeather: "Clima (afeta visibilidade/saúde)", 
  gameTime: (horas acumuladas), 
  feedback: "Consequência direta da ação anterior", 
  situation: "Descrição sensorial da nova cena. Mantenha o tom de mistério e confusão inicial.", 
  options: [{id, text}], 
  isRisky: boolean (true se local hostil)
}

IMPORTANTE: Gere sempre EXATAMENTE 3 (três) opções de ação no array 'options'. A quarta opção será preenchida pelo jogador manualmente.`;

const SCHEMA: Schema = {
  type: Type.OBJECT,
  required: ["status", "survivalState", "health", "inventory", "currentLocation", "currentWeather", "gameTime", "feedback", "situation", "options", "isRisky"],
  properties: {
    status: { type: Type.STRING, enum: ["ALIVE", "DEAD"] },
    survivalState: { type: Type.STRING },
    health: { type: Type.INTEGER },
    inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
    currentLocation: { type: Type.STRING },
    currentWeather: { type: Type.STRING },
    gameTime: { type: Type.INTEGER },
    feedback: { type: Type.STRING },
    situation: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING } } } },
    isRisky: { type: Type.BOOLEAN }
  }
};

const genImg = async (p: string) => {
  try {
    // Configuração explícita para 16:9 (Cinematic POV)
    const r = await ai.models.generateContent({ 
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ text: p }] },
      config: {
        imageConfig: { aspectRatio: '16:9' }
      }
    });
    const img = r.candidates?.[0]?.content?.parts?.find(pt => pt.inlineData);
    return img ? `data:image/jpeg;base64,${img.inlineData.data}` : undefined;
  } catch { return undefined; }
};

export const getCover = () => genImg(`Photorealistic tactical patch design 'Grupo Santo Humberto'. Brazilian flag colors desaturated. Knife and Compass symbol. Dark background. 4k resolution.`);

export const gameTurn = async (input: { name?: string, loc?: string, tools?: string[], action?: string, state?: any }): Promise<GameResponse> => {
  let prompt = "";
  if (input.action) {
    if (!chatSession) throw new Error("No Session");
    const { state } = input;
    const time = state.gameTime + Math.floor(Math.random() * 2) + 1; // Tempo passa mais devagar no início
    // Ajuste de fase para refletir colapso social progressivo
    const stage = time >= 48 ? "CAOS TOTAL" : time >= 12 ? "PÂNICO INICIAL" : "CONFUSÃO/INCERTEZA";
    prompt = `STATUS: ${state.currentLocation}|HP:${state.health}%|Inv:[${state.inventory}]. TEMPO CORRIDO:${time}h. FASE:${stage}. AÇÃO JOGADOR:"${input.action}"`;
  } else {
    chatSession = ai.chats.create({ model: 'gemini-3-pro-preview', config: { systemInstruction: SYSTEM, responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.7 } });
    
    // Prompt inicial focado na quebra da normalidade
    prompt = `START: Sobrevivente: ${input.name}, Local Inicial: ${input.loc} (Contexto urbano cotidiano), Equipamento na mochila: [${input.tools}]. CLIMA: Calor de 40 graus.
    
    INSTRUÇÃO INICIAL: Descreva o momento exato em que a normalidade quebra. O personagem estava fazendo algo comum (esperando ônibus, trabalhando, andando na rua) quando o evento ocorreu (luzes apagaram, sinal de celular morreu, som estranho). Ninguém sabe o que é. Apenas confusão. Não comece com violência extrema, comece com o mistério e a falha da infraestrutura.`;
  }

  const res = await chatSession!.sendMessage({ message: prompt });
  const data = JSON.parse(res.text!) as GameResponse;
  
  if (!data.gameTime) data.gameTime = input.state ? input.state.gameTime + 1 : 0;
  
  // Prompt POV Otimizado para Realismo (Bodycam/GoPro style)
  const imgContext = data.status === 'DEAD' 
    ? `BODYCAM FOOTAGE, PHOTOREALISTIC, WIDE ANGLE. Person falling on pavement, blurry vision, blood on lens. Urban Rio de Janeiro background out of focus. Scene: ${data.situation}`
    : `PHOTOREALISTIC, 4K, UNREAL ENGINE 5 STYLE, WIDE ANGLE LENS (GoPro). First Person POV. Urban Rio de Janeiro setting. Realistic lighting. No fantasy elements. Location: ${data.currentLocation}. Weather: ${data.currentWeather}. The scene shows: ${data.situation}. Atmosphere: Tension, Confusion, Crowds or Desolation.`;
  
  data.imageUrl = await genImg(imgContext);
  return data;
};
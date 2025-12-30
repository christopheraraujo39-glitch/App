export enum GameStatus { IDLE = 'IDLE', INTRO = 'INTRO', CREATION = 'CREATION', LOADING = 'LOADING', PLAYING = 'PLAYING', GAME_OVER = 'GAME_OVER' }

export interface GameState {
  health: number;
  inventory: string[];
  currentLocation: string;
  currentWeather: string;
  gameTime: number;
  survivalState: string;
  lastSituation: string;
}

export interface GameResponse extends GameState {
  status: 'ALIVE' | 'DEAD';
  feedback: string;
  situation: string;
  options: { id: string; text: string }[];
  imageUrl?: string;
  isRisky: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isDeath?: boolean;
  imageUrl?: string;
  location?: string;
  isRisky?: boolean;
}

export interface HistoryEntry extends GameState {
  turn: number;
  action: string;
  feedback: string;
  situation: string;
}
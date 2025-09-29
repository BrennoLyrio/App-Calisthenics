export interface User {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  idade: number;
  peso: number;
  altura: number;
  nivel_condicionamento: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino: 'superiores' | 'inferiores' | 'core' | 'completo';
  data_criacao: Date;
  data_ultima_sinc: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Exercise {
  id: number;
  nome: string;
  categoria: 'superiores' | 'inferiores' | 'core' | 'completo';
  descricao_textual: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  musculos_trabalhados: string[];
  video_url?: string;
  imagem_url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Workout {
  id: number;
  id_usuario: number;
  objetivo: 'forca' | 'resistencia' | 'hipertrofia' | 'perda_peso';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  data_criacao: Date;
  ativo: boolean;
  nome?: string;
  descricao?: string;
  duracao_estimada?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutExercise {
  id: number;
  id_treino: number;
  id_exercicio: number;
  series: number;
  repeticoes: number;
  tempo_execucao?: number;
  descanso?: number;
  ordem: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutHistory {
  id: number;
  id_usuario: number;
  id_treino: number;
  data_execucao: Date;
  duracao: number;
  series_realizadas: number;
  repeticoes_realizadas: number;
  notas?: string;
  avaliacao_dificuldade?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Goal {
  id: number;
  id_usuario: number;
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  valor_atual: number;
  data_inicio: Date;
  data_fim: Date;
  status: 'em_andamento' | 'concluida' | 'pausada';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ThematicProgram {
  id: number;
  nome: string;
  descricao: string;
  duracao_dias: number;
  certificado_url?: string;
  nivel_requerido: 'iniciante' | 'intermediario' | 'avancado';
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProgram {
  id: number;
  id_usuario: number;
  id_programa: number;
  progresso: number;
  status: 'ativo' | 'concluido' | 'pausado';
  data_inicio: Date;
  data_fim?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// MongoDB Types for Community Features
export interface Post {
  _id?: string;
  id_usuario: number;
  conteudo: string;
  midia_url?: string;
  data_postagem: Date;
  curtidas: number[];
  comentarios: Comment[];
  privacidade: 'publico' | 'privado';
  tipo: 'conquista' | 'duvida' | 'dica' | 'outro';
  tags: string[];
}

export interface Comment {
  id_usuario: number;
  texto: string;
  data: Date;
  curtidas: number[];
}

export interface Notification {
  _id?: string;
  id_usuario: number;
  tipo: 'lembrete_treino' | 'meta_alcancada' | 'comentario' | 'curtida' | 'sistema';
  mensagem: string;
  data_envio: Date;
  status: 'pendente' | 'lida' | 'enviada';
  dados_extras?: any;
}

export interface WearableData {
  _id?: string;
  id_usuario: number;
  fonte: 'Google Fit' | 'Apple Health' | 'Samsung Health' | 'Fitbit' | 'Garmin';
  batimentos: number[];
  calorias: number;
  tempo_atividade: number;
  data_sincronizacao: Date;
  dados_extras?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  idade: number;
  peso: number;
  altura: number;
  nivel_condicionamento: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino: 'superiores' | 'inferiores' | 'core' | 'completo';
}

export interface UpdateProfileRequest {
  nome?: string;
  idade?: number;
  peso?: number;
  altura?: number;
  nivel_condicionamento?: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino?: 'superiores' | 'inferiores' | 'core' | 'completo';
}

export interface CreateWorkoutRequest {
  objetivo: 'forca' | 'resistencia' | 'hipertrofia' | 'perda_peso';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  nome?: string;
  descricao?: string;
  exercicios: {
    id_exercicio: number;
    series: number;
    repeticoes: number;
    tempo_execucao?: number;
    descanso?: number;
    ordem: number;
  }[];
}

export interface CreateGoalRequest {
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  data_fim: Date;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  email: string;
  nivel_condicionamento: string;
}

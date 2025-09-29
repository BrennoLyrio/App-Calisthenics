// User Types
export interface User {
  id: number;
  nome: string;
  email: string;
  idade: number;
  peso: number;
  altura: number;
  nivel_condicionamento: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino: 'superiores' | 'inferiores' | 'core' | 'completo';
  data_criacao: string;
  data_ultima_sinc: string;
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

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

// Exercise Types
export interface Exercise {
  id: number;
  nome: string;
  categoria: 'superiores' | 'inferiores' | 'core' | 'completo';
  descricao_textual: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  musculos_trabalhados: string[];
  video_url?: string;
  imagem_url?: string;
  instrucoes: string[];
  dicas: string[];
  variacoes: string[];
  equipamentos_necessarios: string[];
  tempo_estimado: number;
  calorias_estimadas: number;
  ativo: boolean;
}

// Workout Types
export interface Workout {
  id: number;
  id_usuario: number;
  objetivo: 'forca' | 'resistencia' | 'hipertrofia' | 'perda_peso';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  nome?: string;
  descricao?: string;
  duracao_estimada?: number;
  calorias_estimadas?: number;
  data_criacao: string;
  ativo: boolean;
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
  exercise?: Exercise;
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

// Goal Types
export interface Goal {
  id: number;
  id_usuario: number;
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  valor_atual: number;
  data_inicio: string;
  data_fim: string;
  status: 'em_andamento' | 'concluida' | 'pausada';
  categoria: 'forca' | 'resistencia' | 'flexibilidade' | 'perda_peso' | 'ganho_massa' | 'outro';
  unidade_medida: string;
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

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  OnboardingGoal: undefined;
  OnboardingExperience: undefined;
  OnboardingResources: undefined;
  OnboardingPhysical: undefined;
  Main: undefined;
  Profile: undefined;
  Workouts: undefined;
  Exercises: undefined;
  ExercisePreview: {
    exercise: Exercise;
    duration?: number;
    reps?: number;
    restTime?: number;
    isFromWorkout?: boolean;
  };
  WorkoutSession: {
    workout?: {
      exercises: Array<{
        exercise: Exercise;
        duration?: number;
        reps?: number;
        sets: number;
        restTime: number;
      }>;
      totalDuration: number;
      totalCalories: number;
    };
    exercise?: Exercise;
    duration?: number;
    reps?: number;
    restTime?: number;
  };
  WorkoutCompleted: {
    totalExercises: number;
    completedExercises: number;
    totalDuration: number;
    totalCalories: number;
  };
  Progress: undefined;
};

// Onboarding Types
export interface OnboardingData {
  objetivo?: string;
  experiencia?: 'iniciante' | 'intermediario' | 'avancado';
  recursos?: string[];
  peso?: number;
  altura?: number;
  idade?: number;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Form Types
export interface LoginFormData {
  email: string;
  senha: string;
}

export interface RegisterFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  idade: string;
  peso: string;
  altura: string;
  nivel_condicionamento: 'iniciante' | 'intermediario' | 'avancado';
  foco_treino: 'superiores' | 'inferiores' | 'core' | 'completo';
}

export interface OnboardingGoalFormData {
  objetivo: string;
}

export interface OnboardingExperienceFormData {
  experiencia: 'iniciante' | 'intermediario' | 'avancado';
}

export interface OnboardingResourcesFormData {
  recursos: string[];
}

export interface OnboardingPhysicalFormData {
  peso: string;
  altura: string;
  idade: string;
}

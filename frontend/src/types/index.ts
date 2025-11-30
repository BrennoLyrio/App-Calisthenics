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
export type ExerciseType = 'timer' | 'reps';

export interface Exercise {
  id: number;
  nome: string;
  categoria: 'superiores' | 'inferiores' | 'core' | 'completo' | 'aquecimento' | 'alongamento';
  tipo: ExerciseType;
  descricao_textual: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
  musculos_trabalhados: string[];
  video_url?: string;
  imagem_url?: string;
  instrucoes: string[];
  dicas: string[];
  variacoes: string[];
  equipamentos_necessarios: string[];
  tempo_estimado?: number;
  repeticoes_estimadas?: number;
  calorias_estimadas: number;
  ativo: boolean;
}

export type ExerciseExecutionType = 'reps' | 'time';

export interface WorkoutExerciseDetail {
  exercise: Exercise;
  type: ExerciseExecutionType;
  duration?: number;
  reps?: number;
  sets: number;
  restTime: number;
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

// Custom Workout Types
export interface CustomWorkout {
  id: number;
  id_usuario: number;
  nome: string;
  descricao?: string;
  duracao_estimada?: number;
  calorias_estimadas?: number;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
  exercises?: CustomWorkoutExercise[];
}

export interface CustomWorkoutExercise {
  id: number;
  id_rotina: number;
  id_exercicio: number;
  series: number;
  repeticoes?: number;
  tempo_execucao?: number;
  descanso?: number;
  ordem: number;
  observacoes?: string;
  exercise?: Exercise;
}

export interface CreateCustomWorkoutRequest {
  nome: string;
  descricao?: string;
  exercicios: {
    id_exercicio: number;
    series: number;
    repeticoes?: number;
    tempo_execucao?: number;
    descanso?: number;
    ordem: number;
    observacoes?: string;
  }[];
}

export interface UpdateCustomWorkoutRequest {
  nome?: string;
  descricao?: string;
  exercicios?: {
    id_exercicio: number;
    series: number;
    repeticoes?: number;
    tempo_execucao?: number;
    descanso?: number;
    ordem: number;
    observacoes?: string;
  }[];
}

// Thematic Program / Challenge Types
export interface ThematicProgram {
  id: number;
  nome: string;
  descricao: string;
  duracao_dias: number;
  certificado_url?: string;
  nivel_requerido: 'iniciante' | 'intermediario' | 'avancado';
  ativo: boolean;
  categoria: 'desafio' | 'programa' | 'curso';
  objetivo_principal: string;
  exercicios_incluidos: number[];
  requisitos: string[];
  beneficios: string[];
  dificuldade_inicial: number;
  dificuldade_final: number;
  calorias_estimadas_total: number;
  tempo_estimado_diario: number;
  imagem_url?: string;
  video_apresentacao?: string;
  stats?: {
    total_participants?: number;
    avg_progress?: number;
    avg_rating?: number;
    completed_count?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProgram {
  id: number;
  id_usuario: number;
  id_programa: number;
  progresso: number;
  status: 'ativo' | 'concluido' | 'pausado';
  data_inicio: string;
  data_fim?: string;
  dias_concluidos: number;
  ultima_atividade?: string;
  notas?: string;
  avaliacao?: number;
  programa?: ThematicProgram;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkoutHistory {
  id: number;
  id_usuario: number;
  id_treino?: number;
  nome_treino?: string;
  data_execucao: string;
  duracao: number;
  series_realizadas: number;
  repeticoes_realizadas: number;
  notas?: string;
  avaliacao_dificuldade?: number;
  calorias_queimadas?: number;
  batimentos_medio?: number;
  satisfacao?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveWorkoutHistoryRequest {
  id_treino?: number;
  nome_treino?: string;
  duracao: number;
  series_realizadas: number;
  repeticoes_realizadas: number;
  notas?: string;
  avaliacao_dificuldade?: number;
  calorias_queimadas?: number;
  batimentos_medio?: number;
  satisfacao?: number;
}

export interface WorkoutStats {
  generalStats: {
    total_workouts?: number;
    avg_duration?: number;
    total_duration?: number;
    total_calories?: number;
    avg_difficulty?: number;
    avg_satisfaction?: number;
  };
  weeklyProgress: any[];
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
  meta_semanal?: number;
  observacoes?: string;
  progress?: number; // Calculated progress percentage
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalRequest {
  descricao: string;
  tipo: 'curto' | 'medio' | 'longo';
  valor_alvo: number;
  data_inicio?: string;
  data_fim: string;
  categoria: 'forca' | 'resistencia' | 'flexibilidade' | 'perda_peso' | 'ganho_massa' | 'outro';
  unidade_medida: string;
  meta_semanal?: number;
  observacoes?: string;
}

export interface UpdateGoalRequest {
  descricao?: string;
  valor_alvo?: number;
  valor_atual?: number;
  data_fim?: string;
  status?: 'em_andamento' | 'concluida' | 'pausada';
  meta_semanal?: number;
  observacoes?: string;
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
  MainTabs: undefined;
  Main: undefined;
  Profile: undefined;
  Workouts: undefined;
  Exercises: undefined;
  LibraryExercises: {
    selectMode?: boolean;
  } | undefined;
  Warmup: undefined;
  Cooldown: undefined;
  Progress: undefined;
  Goals: undefined;
  CreateGoal: undefined;
  GoalDetail: {
    goalId: number;
  };
  CustomWorkouts: undefined;
  CustomWorkoutEditor: {
    workoutId?: number;
    selectedExercise?: Exercise;
  };
  Challenges: undefined;
  ChallengeDetail: {
    programId: number;
  };
  Education: undefined;
  ArticleList: {
    category: 'articles' | 'nutrition' | 'progression' | 'recovery';
  };
  ArticleDetail: {
    articleId: string;
    category: 'articles' | 'nutrition' | 'progression' | 'recovery';
  };
  Community: undefined;
  VideoRecorder: {
    tipo: 'rank' | 'help';
    id_desafio_semanal?: number;
  };
  PostDetail: {
    postId: number;
  };
  ExercisePreview: {
    exercise: Exercise;
    duration?: number;
    reps?: number;
    restTime?: number;
    isFromWorkout?: boolean;
    workout?: {
      exercises: WorkoutExerciseDetail[];
      totalDuration: number;
      totalCalories: number;
    };
    exerciseIndex?: number;
  };
  WorkoutSession: {
    workout?: {
      exercises: WorkoutExerciseDetail[];
      totalDuration: number;
      totalCalories: number;
      workoutName?: string;
      isCustomWorkout?: boolean;
      customWorkoutId?: number;
    };
    initialExerciseIndex?: number;
    exercise?: Exercise;
    duration?: number;
    reps?: number;
    restTime?: number;
    skipSaveHistory?: boolean;
  };
  WorkoutCompleted: {
    totalExercises?: number;
    completedExercises?: number;
    totalDuration: number;
    totalCalories: number;
    totalSets?: number;
    completedSets?: number;
    sessionDurationSeconds?: number;
    workout?: {
      exercises: WorkoutExerciseDetail[];
      totalDuration: number;
      totalCalories: number;
      workoutName?: string;
      isCustomWorkout?: boolean;
      customWorkoutId?: number;
  };
    workoutName?: string;
    isCustomWorkout?: boolean;
    skipSaveHistory?: boolean;
  };
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

// Community Types
export interface WeeklyChallenge {
  id: number;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
}

export interface CommunityUser {
  id: number;
  nome: string;
  foto_perfil?: string;
}

export interface CommunityPost {
  id: number;
  id_usuario: number;
  tipo: 'rank' | 'help';
  titulo?: string;
  descricao?: string;
  duvida?: string;
  video_url: string;
  id_desafio_semanal?: number;
  curtidas_count: number;
  comentarios_count: number;
  data_postagem: string;
  status: 'ativo' | 'removido';
  user?: CommunityUser;
  weeklyChallenge?: WeeklyChallenge;
  userLiked?: boolean;
}

export interface PostComment {
  id: number;
  id_post: number;
  id_usuario: number;
  texto: string;
  createdAt: string;
  user?: CommunityUser;
}

export interface CreatePostRequest {
  tipo: 'rank' | 'help';
  titulo?: string;
  descricao?: string;
  duvida?: string;
  id_desafio_semanal?: number;
}

export interface CreateCommentRequest {
  texto: string;
}

export interface RankingEntry {
  position: number;
  postId: number;
  videoUrl: string;
  likesCount: number;
  user: CommunityUser;
  createdAt: string;
}

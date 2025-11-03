// API Configuration
// export const API_BASE_URL = ['http://192.168.15.9:3000/api/v1', 'http://172.20.10.2:3000/api/v1', 'http://192.168.15.6:3000/api/v1'];
export const API_BASE_URL = 'http://192.168.15.3:3000/api/v1';

// Colors
export const Colors = {
  primary: '#FF6B35', // Orange
  secondary: '#2C3E50', // Dark blue
  background: '#F8F9FA', // Light gray
  surface: '#FFFFFF', // White
  text: '#2C3E50', // Dark blue
  textSecondary: '#6C757D', // Gray
  success: '#28A745', // Green
  error: '#DC3545', // Red
  warning: '#FFC107', // Yellow
  info: '#17A2B8', // Blue
  light: '#F8F9FA',
  dark: '#343A40',
  transparent: 'transparent',
};

// Gradients
export const Gradients = {
  primary: ['#FF6B35', '#FF8C42', '#FFA726'],
  secondary: ['#2C3E50', '#34495E'],
  background: ['#F8F9FA', '#E9ECEF'],
  sunset: ['#FF6B35', '#FF8C42', '#FFA726', '#FFB74D'],
  ocean: ['#2C3E50', '#3498DB', '#5DADE2'],
  calisthenics: ['#FF6B35', '#FF8C42', '#FFA726', '#FFB74D'],
  modern: ['#FF6B35', '#FF8C42', '#FFA726'],
  vibrant: ['#FF6B35', '#FF8C42', '#FFA726', '#FFB74D', '#FFCC80'],
};

// Typography
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

// Exercise Categories
export const ExerciseCategories = [
  {
    id: 'superiores',
    name: 'Membros Superiores',
    description: 'Exercícios para braços, ombros e peito',
    icon: '💪',
  },
  {
    id: 'inferiores',
    name: 'Membros Inferiores',
    description: 'Exercícios para pernas e glúteos',
    icon: '🦵',
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Exercícios para abdômen e região central',
    icon: '🔥',
  },
  {
    id: 'completo',
    name: 'Treino Completo',
    description: 'Exercícios que trabalham todo o corpo',
    icon: '⚡',
  },
];

// Difficulty Levels
export const DifficultyLevels = [
  {
    id: 'iniciante',
    name: 'Iniciante',
    description: 'Para quem está começando na calistenia',
    color: Colors.success,
  },
  {
    id: 'intermediario',
    name: 'Intermediário',
    description: 'Para quem já tem alguma experiência',
    color: Colors.warning,
  },
  {
    id: 'avancado',
    name: 'Avançado',
    description: 'Para praticantes experientes',
    color: Colors.error,
  },
];

// Workout Objectives
export const WorkoutObjectives = [
  {
    id: 'forca',
    name: 'Força',
    description: 'Desenvolver força muscular',
    icon: '💪',
  },
  {
    id: 'resistencia',
    name: 'Resistência',
    description: 'Melhorar capacidade cardiovascular',
    icon: '❤️',
  },
  {
    id: 'hipertrofia',
    name: 'Hipertrofia',
    description: 'Aumentar massa muscular',
    icon: '🏋️',
  },
  {
    id: 'perda_peso',
    name: 'Perda de Peso',
    description: 'Queimar calorias e emagrecer',
    icon: '🔥',
  },
];

// Onboarding Goals
export const OnboardingGoals = [
  {
    id: 'A',
    text: 'Entrar em forma',
    description: 'Melhorar condicionamento físico geral',
  },
  {
    id: 'B',
    text: 'Ganho de músculo e força',
    description: 'Desenvolver massa muscular e força',
  },
  {
    id: 'C',
    text: 'Aprender habilidades de calistenia',
    description: 'Dominar movimentos avançados',
  },
  {
    id: 'D',
    text: 'Perda de peso',
    description: 'Queimar gordura e emagrecer',
  },
  {
    id: 'E',
    text: 'Resistência',
    description: 'Melhorar capacidade cardiovascular',
  },
  {
    id: 'F',
    text: 'Melhorar condicionamento',
    description: 'Aumentar condicionamento físico',
  },
  {
    id: 'G',
    text: 'Passar em um teste físico',
    description: 'Preparar para testes específicos',
  },
];

// Onboarding Experience Levels
export const OnboardingExperience = [
  {
    id: 'A',
    level: 'Zero',
    description: 'Você é novo na calistenia e nunca praticou outras atividades antes',
  },
  {
    id: 'B',
    level: 'Iniciante',
    description: 'Você é novo na calistenia e quer aprender o básico',
  },
  {
    id: 'C',
    level: 'Intermediário',
    description: 'Você tem alguma experiência com calistenia e quer melhorar suas habilidades',
  },
  {
    id: 'D',
    level: 'Avançado',
    description: 'Você é um atleta avançado de calistenia e quer superar seus limites',
  },
];

// Onboarding Resources
export const OnboardingResources = [
  {
    id: 'A',
    text: 'Acessar planos personalizados',
    description: 'Treinos adaptados ao seu nível',
  },
  {
    id: 'B',
    text: 'Acompanhar e analisar progresso',
    description: 'Métricas e evolução dos treinos',
  },
  {
    id: 'C',
    text: 'Criar treinos personalizados',
    description: 'Montar seus próprios treinos',
  },
  {
    id: 'D',
    text: 'Conectar com a comunidade',
    description: 'Interagir com outros praticantes',
  },
];

// Storage Keys
export const StorageKeys = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Animation Durations
export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Screen Dimensions
export const ScreenDimensions = {
  width: 0, // Will be set dynamically
  height: 0, // Will be set dynamically
};

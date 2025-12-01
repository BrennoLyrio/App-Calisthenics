import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { API_BASE_URL, StorageKeys } from '../constants';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
  ApiResponse,
  Exercise,
  Workout,
  CreateWorkoutRequest,
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  WorkoutHistory,
  SaveWorkoutHistoryRequest,
  WorkoutStats,
  CustomWorkout,
  CreateCustomWorkoutRequest,
  UpdateCustomWorkoutRequest,
  ThematicProgram,
  UserProgram,
  CommunityPost,
  PostComment,
  WeeklyChallenge,
  CreatePostRequest,
  CreateCommentRequest,
  RankingEntry,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('🌐 [API] BaseURL carregada:', API_BASE_URL);
    console.log('🌐 [API] Tipo da BaseURL:', typeof API_BASE_URL);
    
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem(StorageKeys.USER_TOKEN);
          await AsyncStorage.removeItem(StorageKeys.USER_DATA);
          // You might want to redirect to login here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      '/auth/register',
      userData
    );
    return response.data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      '/auth/login',
      credentials
    );
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get(
      '/auth/profile'
    );
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.put(
      '/auth/profile',
      userData
    );
    return response.data;
  }

  async changePassword(senha_atual: string, nova_senha: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(
      '/auth/change-password',
      {
        senha_atual,
        nova_senha,
      }
    );
    return response.data;
  }

  async changePassword(data: { senha_atual: string; nova_senha: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(
      '/auth/change-password',
      data
    );
    return response.data;
  }

  async deleteAccount(senha: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(
      '/auth/account',
      { data: { senha } }
    );
    return response.data;
  }

  // Exercise endpoints
  async getExercises(params?: {
    categoria?: string;
    nivel?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Exercise[]>> {
    const response: AxiosResponse<ApiResponse<Exercise[]>> = await this.api.get(
      '/exercises',
      { params }
    );
    return response.data;
  }

  async getExerciseById(id: number): Promise<ApiResponse<Exercise>> {
    const response: AxiosResponse<ApiResponse<Exercise>> = await this.api.get(
      `/exercises/${id}`
    );
    return response.data;
  }

  async getExercisesByCategory(categoria: string): Promise<ApiResponse<Exercise[]>> {
    const response: AxiosResponse<ApiResponse<Exercise[]>> = await this.api.get(
      `/exercises/category/${categoria}`
    );
    return response.data;
  }

  async getExercisesByDifficulty(nivel: string): Promise<ApiResponse<Exercise[]>> {
    const response: AxiosResponse<ApiResponse<Exercise[]>> = await this.api.get(
      `/exercises/difficulty/${nivel}`
    );
    return response.data;
  }

  async searchExercises(query: string): Promise<ApiResponse<Exercise[]>> {
    const response: AxiosResponse<ApiResponse<Exercise[]>> = await this.api.get(
      '/exercises/search',
      { params: { q: query } }
    );
    return response.data;
  }

  async getExerciseCategories(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      '/exercises/categories'
    );
    return response.data;
  }

  async getDifficultyLevels(): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      '/exercises/difficulty-levels'
    );
    return response.data;
  }

  async getExerciseAlternatives(exerciseId: number, limit: number = 3): Promise<ApiResponse<Exercise[]>> {
    const response: AxiosResponse<ApiResponse<Exercise[]>> = await this.api.get(
      `/exercises/${exerciseId}/alternatives`,
      { params: { limit } }
    );
    return response.data;
  }

  // Workout endpoints
  async createWorkout(workoutData: CreateWorkoutRequest): Promise<ApiResponse<{ workout: Workout }>> {
    const response: AxiosResponse<ApiResponse<{ workout: Workout }>> = await this.api.post(
      '/workouts',
      workoutData
    );
    return response.data;
  }

  async getUserWorkouts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Workout[]>> {
    const response: AxiosResponse<ApiResponse<Workout[]>> = await this.api.get(
      '/workouts',
      { params }
    );
    return response.data;
  }

  async getWorkoutById(id: number): Promise<ApiResponse<Workout>> {
    const response: AxiosResponse<ApiResponse<Workout>> = await this.api.get(
      `/workouts/${id}`
    );
    return response.data;
  }

  async updateWorkout(id: number, workoutData: Partial<Workout>): Promise<ApiResponse<Workout>> {
    const response: AxiosResponse<ApiResponse<Workout>> = await this.api.put(
      `/workouts/${id}`,
      workoutData
    );
    return response.data;
  }

  async deleteWorkout(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(
      `/workouts/${id}`
    );
    return response.data;
  }

  async getRecommendedWorkouts(params?: {
    objetivo?: string;
    nivel?: string;
  }): Promise<ApiResponse<Workout[]>> {
    const response: AxiosResponse<ApiResponse<Workout[]>> = await this.api.get(
      '/workouts/recommended',
      { params }
    );
    return response.data;
  }

  async startWorkout(id: number): Promise<ApiResponse<{ workout_id: number; start_time: string }>> {
    const response: AxiosResponse<ApiResponse<{ workout_id: number; start_time: string }>> = 
      await this.api.post(`/workouts/${id}/start`);
    return response.data;
  }

  // Goal endpoints
  async getGoals(status?: string): Promise<ApiResponse<Goal[]>> {
    const params = status ? { status } : {};
    const response: AxiosResponse<ApiResponse<Goal[]>> = await this.api.get('/goals', { params });
    return response.data;
  }

  async getGoalById(id: number): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.get(`/goals/${id}`);
    return response.data;
  }

  async getCompletedGoals(limit: number = 10): Promise<ApiResponse<Goal[]>> {
    const response: AxiosResponse<ApiResponse<Goal[]>> = await this.api.get('/goals/completed', {
      params: { limit }
    });
    return response.data;
  }

  async createGoal(goalData: CreateGoalRequest): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.post('/goals', goalData);
    return response.data;
  }

  async updateGoal(id: number, goalData: UpdateGoalRequest): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.put(`/goals/${id}`, goalData);
    return response.data;
  }

  async updateGoalProgress(id: number): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.patch(`/goals/${id}/progress`);
    return response.data;
  }

  async deleteGoal(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/goals/${id}`);
    return response.data;
  }

  // Custom Workout endpoints
  async getCustomWorkouts(): Promise<ApiResponse<CustomWorkout[]>> {
    const response: AxiosResponse<ApiResponse<CustomWorkout[]>> = await this.api.get('/custom-workouts');
    return response.data;
  }

  async getCustomWorkoutById(id: number): Promise<ApiResponse<CustomWorkout>> {
    const response: AxiosResponse<ApiResponse<CustomWorkout>> = await this.api.get(`/custom-workouts/${id}`);
    return response.data;
  }

  async createCustomWorkout(workoutData: CreateCustomWorkoutRequest): Promise<ApiResponse<CustomWorkout>> {
    const response: AxiosResponse<ApiResponse<CustomWorkout>> = await this.api.post('/custom-workouts', workoutData);
    return response.data;
  }

  async updateCustomWorkout(id: number, workoutData: UpdateCustomWorkoutRequest): Promise<ApiResponse<CustomWorkout>> {
    const response: AxiosResponse<ApiResponse<CustomWorkout>> = await this.api.put(`/custom-workouts/${id}`, workoutData);
    return response.data;
  }

  async deleteCustomWorkout(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/custom-workouts/${id}`);
    return response.data;
  }

  // Thematic Program / Challenge endpoints
  async getPrograms(categoria?: string, nivel?: string): Promise<ApiResponse<ThematicProgram[]>> {
    const params: any = {};
    if (categoria) params.categoria = categoria;
    if (nivel) params.nivel = nivel;
    
    const response: AxiosResponse<ApiResponse<ThematicProgram[]>> = await this.api.get('/programs', { params });
    return response.data;
  }

  async getProgramById(id: number): Promise<ApiResponse<ThematicProgram>> {
    const response: AxiosResponse<ApiResponse<ThematicProgram>> = await this.api.get(`/programs/${id}`);
    return response.data;
  }

  async searchPrograms(query: string): Promise<ApiResponse<ThematicProgram[]>> {
    const response: AxiosResponse<ApiResponse<ThematicProgram[]>> = await this.api.get('/programs/search', {
      params: { q: query }
    });
    return response.data;
  }

  async getUserPrograms(status?: 'ativo' | 'concluido' | 'pausado'): Promise<ApiResponse<UserProgram[]>> {
    const params: any = {};
    if (status) params.status = status;
    
    const response: AxiosResponse<ApiResponse<UserProgram[]>> = await this.api.get('/programs/user/my-programs', { params });
    return response.data;
  }

  async joinProgram(programId: number): Promise<ApiResponse<{ userProgram: UserProgram; programa: ThematicProgram }>> {
    const response: AxiosResponse<ApiResponse<{ userProgram: UserProgram; programa: ThematicProgram }>> = await this.api.post(`/programs/${programId}/join`);
    return response.data;
  }

  async updateUserProgramProgress(userProgramId: number, data: { progresso?: number; dias_concluidos?: number; notas?: string }): Promise<ApiResponse<UserProgram>> {
    const response: AxiosResponse<ApiResponse<UserProgram>> = await this.api.put(`/programs/user/${userProgramId}/progress`, data);
    return response.data;
  }

  async completeProgram(userProgramId: number, avaliacao?: number): Promise<ApiResponse<{ userProgram: UserProgram; programa: ThematicProgram }>> {
    const response: AxiosResponse<ApiResponse<{ userProgram: UserProgram; programa: ThematicProgram }>> = await this.api.put(`/programs/user/${userProgramId}/complete`, { avaliacao });
    return response.data;
  }

  async toggleProgramStatus(userProgramId: number, status: 'ativo' | 'pausado'): Promise<ApiResponse<UserProgram>> {
    const response: AxiosResponse<ApiResponse<UserProgram>> = await this.api.put(`/programs/user/${userProgramId}/status`, { status });
    return response.data;
  }

  async leaveProgram(userProgramId: number): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/programs/user/${userProgramId}`);
    return response.data;
  }

  // Utility methods
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.USER_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
  }

  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.USER_TOKEN);
    await AsyncStorage.removeItem(StorageKeys.USER_DATA);
  }

  async setUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(user));
  }

  async getUserData(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(StorageKeys.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  async clearUserData(): Promise<void> {
    await AsyncStorage.removeItem(StorageKeys.USER_DATA);
  }

  // Workout History Methods
  async saveWorkoutHistory(data: SaveWorkoutHistoryRequest): Promise<WorkoutHistory> {
    const response: AxiosResponse<ApiResponse<WorkoutHistory>> = await this.api.post(
      '/workout-history',
      data
    );
    return response.data.data!;
  }

  async getWorkoutHistory(page: number = 1, limit: number = 20, days?: number): Promise<ApiResponse<WorkoutHistory[]>> {
    const params: any = { page, limit };
    if (days) params.days = days;
    
    const response: AxiosResponse<ApiResponse<WorkoutHistory[]>> = await this.api.get(
      '/workout-history',
      { params }
    );
    return response.data;
  }

  async getWorkoutHistoryById(id: number): Promise<WorkoutHistory> {
    const response: AxiosResponse<ApiResponse<WorkoutHistory>> = await this.api.get(
      `/workout-history/${id}`
    );
    return response.data.data!;
  }

  async getWorkoutStats(days: number = 30, weeks: number = 12): Promise<WorkoutStats> {
    const params = { days, weeks };
    const response: AxiosResponse<ApiResponse<WorkoutStats>> = await this.api.get(
      '/workout-history/stats',
      { params }
    );
    return response.data.data!;
  }

  async deleteWorkoutHistory(id: number): Promise<void> {
    await this.api.delete(`/workout-history/${id}`);
  }

  // Community Methods
  async createPost(postData: CreatePostRequest, videoUri: string): Promise<CommunityPost> {
    try {
      console.log('📤 Iniciando upload do vídeo...');
      console.log('📤 Video URI:', videoUri);
      console.log('📤 Post data:', postData);
      
      // Get file info
      // Usando API legada até migrarmos para o novo filesystem
      const fileInfo = await FileSystemLegacy.getInfoAsync(videoUri);
      console.log('📤 File info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('Vídeo não encontrado');
      }

      if (!fileInfo.size || fileInfo.size === 0) {
        throw new Error('Vídeo está vazio');
      }

      // Get file extension from URI
      // Expo Camera typically returns URIs like: file:///path/to/video.mp4
      // or content:// URIs on Android
      let extension = 'mp4'; // Default
      let mimeType = 'video/mp4'; // Default
      
      // Try to extract extension from URI
      const uriParts = videoUri.split('.');
      if (uriParts.length > 1) {
        const possibleExt = uriParts[uriParts.length - 1]?.toLowerCase();
        if (possibleExt && ['mp4', 'mov', 'm4v', 'avi', 'webm'].includes(possibleExt)) {
          extension = possibleExt;
          mimeType = extension === 'mov' ? 'video/quicktime' : 
                     extension === 'm4v' ? 'video/mp4' :
                     extension === 'avi' ? 'video/x-msvideo' :
                     extension === 'webm' ? 'video/webm' : 'video/mp4';
        }
      }
      
      console.log('📤 File details:', {
        extension,
        mimeType,
        size: fileInfo.size,
        uri: videoUri,
      });

      const formData = new FormData();
      
      // Append video file - React Native FormData format
      const videoFile: any = {
        uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
        type: mimeType,
        name: `video.${extension}`,
      };
      
      formData.append('video', videoFile as any);
      formData.append('tipo', postData.tipo);
      if (postData.titulo) formData.append('titulo', postData.titulo);
      if (postData.descricao) formData.append('descricao', postData.descricao);
      if (postData.duvida) formData.append('duvida', postData.duvida);
      if (postData.id_desafio_semanal) formData.append('id_desafio_semanal', postData.id_desafio_semanal.toString());

      console.log('📤 Enviando requisição para o backend...');

      const response: AxiosResponse<ApiResponse<{ post: CommunityPost }>> = await this.api.post(
        '/community/posts',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 120 seconds timeout for video upload (aumentado)
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`📤 Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );
      
      console.log('✅ Upload concluído com sucesso!');
      return response.data.data!.post;
    } catch (error: any) {
      console.error('❌ Error in createPost:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async getPosts(tipo?: 'rank' | 'help', idDesafio?: number, page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: CommunityPost[]; page: number; limit: number }>> {
    const params: any = { page, limit };
    if (tipo) params.tipo = tipo;
    if (idDesafio) params.id_desafio = idDesafio;

    const response: AxiosResponse<ApiResponse<{ posts: CommunityPost[]; page: number; limit: number }>> = await this.api.get(
      '/community/posts',
      { params }
    );
    return response.data;
  }

  async getPostById(id: number): Promise<CommunityPost> {
    const response: AxiosResponse<ApiResponse<{ post: CommunityPost }>> = await this.api.get(
      `/community/posts/${id}`
    );
    return response.data.data!.post;
  }

  async deletePost(id: number): Promise<void> {
    await this.api.delete(`/community/posts/${id}`);
  }

  async toggleLike(postId: number): Promise<{ liked: boolean; likesCount: number }> {
    const response: AxiosResponse<ApiResponse<{ liked: boolean; likesCount: number }>> = await this.api.post(
      `/community/posts/${postId}/like`
    );
    return response.data.data!;
  }

  async getLikes(postId: number): Promise<{ likesCount: number; userLiked: boolean }> {
    const response: AxiosResponse<ApiResponse<{ likesCount: number; userLiked: boolean }>> = await this.api.get(
      `/community/posts/${postId}/likes`
    );
    return response.data.data!;
  }

  async createComment(postId: number, commentData: CreateCommentRequest): Promise<PostComment> {
    const response: AxiosResponse<ApiResponse<{ comment: PostComment }>> = await this.api.post(
      `/community/posts/${postId}/comments`,
      commentData
    );
    return response.data.data!.comment;
  }

  async getComments(postId: number, page: number = 1, limit: number = 50): Promise<ApiResponse<{ comments: PostComment[]; total: number; page: number; limit: number }>> {
    const params = { page, limit };
    const response: AxiosResponse<ApiResponse<{ comments: PostComment[]; total: number; page: number; limit: number }>> = await this.api.get(
      `/community/posts/${postId}/comments`,
      { params }
    );
    return response.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.api.delete(`/community/comments/${commentId}`);
  }

  async getCurrentChallenge(): Promise<WeeklyChallenge | null> {
    const response: AxiosResponse<ApiResponse<{ challenge: WeeklyChallenge | null }>> = await this.api.get(
      '/community/challenges/current'
    );
    return response.data.data?.challenge || null;
  }

  async getRanking(): Promise<{ challenge: WeeklyChallenge | null; ranking: RankingEntry[] }> {
    const response: AxiosResponse<ApiResponse<{ challenge: WeeklyChallenge | null; ranking: RankingEntry[] }>> = await this.api.get(
      '/community/challenges/ranking'
    );
    return response.data.data || { challenge: null, ranking: [] };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

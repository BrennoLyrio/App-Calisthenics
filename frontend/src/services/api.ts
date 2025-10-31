import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  WorkoutHistory,
  SaveWorkoutHistoryRequest,
  WorkoutStats,
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

  // Goal endpoints (for future implementation)
  async getGoals(): Promise<ApiResponse<Goal[]>> {
    const response: AxiosResponse<ApiResponse<Goal[]>> = await this.api.get('/goals');
    return response.data;
  }

  async createGoal(goalData: Partial<Goal>): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.post('/goals', goalData);
    return response.data;
  }

  async updateGoal(id: number, goalData: Partial<Goal>): Promise<ApiResponse<Goal>> {
    const response: AxiosResponse<ApiResponse<Goal>> = await this.api.put(`/goals/${id}`, goalData);
    return response.data;
  }

  async deleteGoal(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/goals/${id}`);
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

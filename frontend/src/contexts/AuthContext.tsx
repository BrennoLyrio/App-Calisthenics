import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { User, RegisterRequest, AuthContextType } from '../types';
import { apiService } from '../services/api';
import { StorageKeys } from '../constants';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Inicia/para notificações quando o usuário faz login/logout
  useEffect(() => {
    if (user && !isLoading) {
      // Usuário autenticado - inicia notificações motivacionais
      console.log('👤 Usuário autenticado - iniciando notificações...');
      notificationService.startMotivationalNotifications();
    } else if (!user && !isLoading) {
      // Usuário não autenticado - para notificações
      console.log('👤 Usuário não autenticado - parando notificações...');
      notificationService.stopMotivationalNotifications();
    }

    // Cleanup ao desmontar
    return () => {
      if (!user) {
        notificationService.stopMotivationalNotifications();
      }
    };
  }, [user, isLoading]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
      const storedUser = await AsyncStorage.getItem(StorageKeys.USER_DATA);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, senha });

      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem(StorageKeys.USER_TOKEN, authToken);
        await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(userData));
        
        setUser(userData);
        setToken(authToken);
      } else {
        throw new Error(response.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show toast notification
      Toast.show({
        type: 'error',
        text1: 'Erro ao Fazer Login',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);

      if (response.success && response.data) {
        const { user: newUser, token: authToken } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem(StorageKeys.USER_TOKEN, authToken);
        await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(newUser));
        
        setUser(newUser);
        setToken(authToken);
      } else {
        throw new Error(response.message || 'Erro ao criar conta');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        errorMessage = 'Este email já está sendo usado. Tente fazer login ou use outro email.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show toast notification
      Toast.show({
        type: 'error',
        text1: 'Erro ao Cadastrar',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem(StorageKeys.USER_TOKEN);
      await AsyncStorage.removeItem(StorageKeys.USER_DATA);
      
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.updateProfile(userData);

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        
        // Update stored user data
        await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(updatedUser));
        
        setUser(updatedUser);
      } else {
        throw new Error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, RegisterRequest, LoginRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'Usuário já existe com este email'
      };
      res.status(409).json(response);
      return;
    }

    // Create new user
    const user = await User.createUser({
      ...userData,
      senha_hash: userData.senha
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nivel_condicionamento: user.nivel_condicionamento
    });

    const response: ApiResponse = {
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          idade: user.idade,
          peso: user.peso,
          altura: user.altura,
          nivel_condicionamento: user.nivel_condicionamento,
          data_criacao: user.data_criacao
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    
    // Check if it's a duplicate email error
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      const response: ApiResponse = {
        success: false,
        message: 'Este email já está sendo usado por outro usuário',
        error: 'Email já cadastrado'
      };
      res.status(409).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao criar usuário',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha }: LoginRequest = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Credenciais inválidas'
      };
      res.status(401).json(response);
      return;
    }

    // Validate password
    const isValidPassword = await user.validatePassword(senha);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        message: 'Credenciais inválidas'
      };
      res.status(401).json(response);
      return;
    }

    // Update last sync
    user.data_ultima_sinc = new Date();
    await user.save();

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      nivel_condicionamento: user.nivel_condicionamento
    });

    const response: ApiResponse = {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          idade: user.idade,
          peso: user.peso,
          altura: user.altura,
          nivel_condicionamento: user.nivel_condicionamento,
          data_criacao: user.data_criacao,
          data_ultima_sinc: user.data_ultima_sinc
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao fazer login',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const response: ApiResponse = {
      success: true,
      message: 'Perfil recuperado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          idade: user.idade,
          peso: user.peso,
          altura: user.altura,
          nivel_condicionamento: user.nivel_condicionamento,
          data_criacao: user.data_criacao,
          data_ultima_sinc: user.data_ultima_sinc
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao recuperar perfil',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const updateData = req.body;

    // Update user data
    await user.update(updateData);

    const response: ApiResponse = {
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          idade: user.idade,
          peso: user.peso,
          altura: user.altura,
          nivel_condicionamento: user.nivel_condicionamento,
          data_criacao: user.data_criacao,
          data_ultima_sinc: user.data_ultima_sinc
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { senha_atual, nova_senha } = req.body;

    // Validate current password
    const isValidPassword = await user.validatePassword(senha_atual);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        message: 'Senha atual incorreta'
      };
      res.status(400).json(response);
      return;
    }

    // Update password
    user.senha_hash = nova_senha;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Senha alterada com sucesso'
    };

    res.json(response);
  } catch (error) {
    console.error('Change password error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao alterar senha',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { senha } = req.body;

    // Validate password
    const isValidPassword = await user.validatePassword(senha);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        message: 'Senha incorreta'
      };
      res.status(400).json(response);
      return;
    }

    // Delete user (this will cascade delete related records)
    await user.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Conta excluída com sucesso'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete account error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao excluir conta',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

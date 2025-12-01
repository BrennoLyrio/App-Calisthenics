import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import Toast from 'react-native-toast-message';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Campos editáveis
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Campos de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Nome e email são obrigatórios',
      });
      return;
    }

    if (email && !email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Email inválido',
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        nome: nome.trim(),
        email: email.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado!',
        text2: 'Suas informações foram salvas com sucesso',
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar',
        text2: error.message || 'Tente novamente',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos de senha',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A nova senha deve ter pelo menos 6 caracteres',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'As senhas não coincidem',
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Chamar API para alterar senha
      await apiService.changePassword(currentPassword, newPassword);

      Toast.show({
        type: 'success',
        text1: 'Senha alterada!',
        text2: 'Sua senha foi atualizada com sucesso',
      });

      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao alterar senha',
        text2: error.response?.data?.message || error.message || 'Verifique sua senha atual',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    setNome(user?.nome || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          {isEditing ? (
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
            </View>

            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.textSecondary}
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.value}>{user?.nome || 'Não informado'}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.value}>{user?.email || 'Não informado'}</Text>
              )}
            </View>

            {/* Botão Salvar (quando editando) */}
            {isEditing && (
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.surface} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={Colors.surface} />
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Change Password Section */}
          <View style={styles.passwordCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Alterar Senha</Text>
            </View>

            {isChangingPassword ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha Atual</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry
                    editable={!isChangingPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry
                    editable={!isChangingPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme a nova senha"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry
                    editable={!isChangingPassword}
                  />
                </View>

                <View style={styles.passwordActions}>
                  <TouchableOpacity
                    style={[styles.passwordButton, styles.cancelPasswordButton]}
                    onPress={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelPasswordButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.passwordButton, styles.confirmPasswordButton, isChangingPassword && styles.saveButtonDisabled]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                    activeOpacity={0.8}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator size="small" color={Colors.surface} />
                    ) : (
                      <Text style={styles.confirmPasswordButtonText}>Alterar Senha</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={() => setIsChangingPassword(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="key-outline" size={20} color={Colors.primary} />
                <Text style={styles.changePasswordButtonText}>Alterar Senha</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* User Info (read-only) */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações Adicionais</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Idade:</Text>
              <Text style={styles.infoValue}>{user?.idade || 'Não informado'} anos</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Peso:</Text>
              <Text style={styles.infoValue}>{user?.peso || 'Não informado'} kg</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Altura:</Text>
              <Text style={styles.infoValue}>{user?.altura || 'Não informado'} cm</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nível:</Text>
              <Text style={styles.infoValue}>
                {user?.nivel_condicionamento === 'iniciante' ? 'Iniciante' :
                 user?.nivel_condicionamento === 'intermediario' ? 'Intermediário' :
                 user?.nivel_condicionamento === 'avancado' ? 'Avançado' : 'Não informado'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Foco:</Text>
              <Text style={styles.infoValue}>
                {user?.foco_treino === 'superiores' ? 'Superiores' :
                 user?.foco_treino === 'inferiores' ? 'Inferiores' :
                 user?.foco_treino === 'core' ? 'Core' :
                 user?.foco_treino === 'completo' ? 'Completo' : 'Não informado'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  editButton: {
    padding: Spacing.xs,
  },
  cancelButton: {
    padding: Spacing.xs,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  value: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  passwordCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    fontWeight: 'bold',
    color: Colors.text,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.light,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changePasswordButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  passwordActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  passwordButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPasswordButton: {
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  cancelPasswordButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmPasswordButton: {
    backgroundColor: Colors.primary,
  },
  confirmPasswordButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoTitle: {
    ...Typography.h4,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
});


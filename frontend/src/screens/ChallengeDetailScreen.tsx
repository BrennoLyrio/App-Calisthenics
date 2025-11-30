import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { ThematicProgram, UserProgram } from '../types';

const { width } = Dimensions.get('window');

interface ChallengeDetailScreenProps {
  navigation: any;
  route: {
    params: {
      programId: number;
    };
  };
}

export const ChallengeDetailScreen: React.FC<ChallengeDetailScreenProps> = ({ navigation, route }) => {
  const { programId } = route.params;
  const { user } = useAuth();
  const [program, setProgram] = useState<ThematicProgram | null>(null);
  const [userProgram, setUserProgram] = useState<UserProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadProgram();
  }, [programId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProgram();
    });
    return unsubscribe;
  }, [navigation, programId]);

  const loadProgram = async () => {
    try {
      setIsLoading(true);
      const [programResponse, userProgramsResponse] = await Promise.all([
        apiService.getProgramById(programId),
        apiService.getUserPrograms()
      ]);
      
      if (programResponse.success && programResponse.data) {
        setProgram(programResponse.data);
      }
      
      if (userProgramsResponse.success && userProgramsResponse.data) {
        const foundUserProgram = userProgramsResponse.data.find(up => up.id_programa === programId);
        setUserProgram(foundUserProgram || null);
      }
    } catch (error: any) {
      console.error('Error loading program:', error);
      Alert.alert('Erro', 'Erro ao carregar programa', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinProgram = async () => {
    try {
      setIsJoining(true);
      const response = await apiService.joinProgram(programId);
      
      if (response.success && response.data) {
        setUserProgram(response.data.userProgram);
        Alert.alert('Sucesso!', response.data.message || 'Você se inscreveu no programa com sucesso! 🎉');
      } else {
        Alert.alert('Erro', response.message || 'Erro ao se inscrever no programa');
      }
    } catch (error: any) {
      console.error('Error joining program:', error);
      Alert.alert('Erro', error?.response?.data?.message || 'Erro ao se inscrever no programa');
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!userProgram) return;
    
    try {
      setIsUpdating(true);
      const newDaysCompleted = userProgram.dias_concluidos + 1;
      const response = await apiService.updateUserProgramProgress(userProgram.id, {
        dias_concluidos: newDaysCompleted
      });
      
      if (response.success && response.data) {
        setUserProgram(response.data);
        Alert.alert('Parabéns! 🎉', `Você completou mais um dia! Progresso atualizado.`);
        loadProgram();
      } else {
        Alert.alert('Erro', response.message || 'Erro ao atualizar progresso');
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      Alert.alert('Erro', 'Erro ao atualizar progresso');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteProgram = async () => {
    if (!userProgram) return;
    
    Alert.alert(
      'Completar Programa',
      'Tem certeza que deseja marcar este programa como completo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              const response = await apiService.completeProgram(userProgram.id);
              
              if (response.success && response.data) {
                setUserProgram(response.data.userProgram);
                Alert.alert('Parabéns! 🎉', 'Você completou o programa! Continue assim!');
                loadProgram();
              } else {
                Alert.alert('Erro', response.message || 'Erro ao completar programa');
              }
            } catch (error: any) {
              console.error('Error completing program:', error);
              Alert.alert('Erro', 'Erro ao completar programa');
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (status: 'ativo' | 'pausado') => {
    if (!userProgram) return;
    
    try {
      const response = await apiService.toggleProgramStatus(userProgram.id, status);
      
      if (response.success && response.data) {
        setUserProgram(response.data);
      } else {
        Alert.alert('Erro', response.message || 'Erro ao alterar status');
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      Alert.alert('Erro', 'Erro ao alterar status');
    }
  };

  const handleLeaveProgram = () => {
    if (!userProgram) return;
    
    Alert.alert(
      'Desistir do Programa',
      'Tem certeza que deseja desistir deste programa? Todo o seu progresso será perdido e você precisará começar do zero se decidir participar novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desistir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.leaveProgram(userProgram.id);
              
              if (response.success) {
                Alert.alert('Programa Abandonado', 'Você desistiu do programa. Todo o progresso foi removido.', [
                  { text: 'OK', onPress: () => {
                    setUserProgram(null);
                    loadProgram();
                  }}
                ]);
              } else {
                Alert.alert('Erro', response.message || 'Erro ao desistir do programa');
              }
            } catch (error: any) {
              console.error('Error leaving program:', error);
              Alert.alert('Erro', 'Erro ao desistir do programa');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (categoria: string): string => {
    switch (categoria) {
      case 'desafio':
        return 'trophy';
      case 'programa':
        return 'school';
      case 'curso':
        return 'library';
      default:
        return 'flag';
    }
  };

  const getCategoryLabel = (categoria: string): string => {
    switch (categoria) {
      case 'desafio':
        return 'Desafio';
      case 'programa':
        return 'Programa';
      case 'curso':
        return 'Curso';
      default:
        return categoria;
    }
  };

  const getDifficultyColor = (dificuldade: number): string => {
    if (dificuldade <= 3) return Colors.success;
    if (dificuldade <= 6) return Colors.warning;
    return Colors.error;
  };

  const getDifficultyLabel = (dificuldade: number): string => {
    if (dificuldade <= 3) return 'Fácil';
    if (dificuldade <= 6) return 'Médio';
    return 'Difícil';
  };

  const progress = userProgram ? userProgram.progresso : 0;
  const daysCompleted = userProgram ? userProgram.dias_concluidos : 0;
  const daysRemaining = program ? Math.max(0, program.duracao_dias - daysCompleted) : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFA726']}
          style={styles.backgroundGradient}
        />
        <SafeAreaView style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.surface} />
            <Text style={styles.loadingText}>Carregando programa...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!program) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA726']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalhes</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Program Info Card */}
          <Card style={styles.infoCard} shadow>
            <View style={styles.programHeader}>
              <View style={[styles.categoryIconContainer, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons 
                  name={getCategoryIcon(program.categoria) as any} 
                  size={32} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.programTitleContainer}>
                <Text style={styles.programTitle}>{program.nome}</Text>
                <Text style={styles.programCategory}>
                  {getCategoryLabel(program.categoria)} • {program.duracao_dias} {program.duracao_dias === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            </View>

            <Text style={styles.programDescription}>{program.descricao}</Text>

            {/* Progress Section (if joined) */}
            {userProgram && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progresso</Text>
                  <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: Colors.primary }]} />
                </View>
                <View style={styles.progressStats}>
                  <View style={styles.progressStatItem}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.progressStatText}>{daysCompleted} {daysCompleted === 1 ? 'dia' : 'dias'} concluídos</Text>
                  </View>
                  <View style={styles.progressStatItem}>
                    <Ionicons name="time-outline" size={20} color={Colors.warning} />
                    <Text style={styles.progressStatText}>{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.statText}>{program.tempo_estimado_diario} min/dia</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.statText}>{program.calorias_estimadas_total} kcal total</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.statText}>
                  {getDifficultyLabel(program.dificuldade_inicial)} → {getDifficultyLabel(program.dificuldade_final)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Objective Card */}
          <Card style={styles.objectiveCard} shadow>
            <View style={styles.sectionHeader}>
              <Ionicons name="target" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Objetivo Principal</Text>
            </View>
            <Text style={styles.objectiveText}>{program.objetivo_principal}</Text>
          </Card>

          {/* Requirements Card */}
          {program.requisitos && program.requisitos.length > 0 && (
            <Card style={styles.card} shadow>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Requisitos</Text>
              </View>
              {program.requisitos.map((requisito, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.listItemText}>{requisito}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Benefits Card */}
          {program.beneficios && program.beneficios.length > 0 && (
            <Card style={styles.card} shadow>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Benefícios</Text>
              </View>
              {program.beneficios.map((beneficio, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="star-outline" size={20} color={Colors.warning} />
                  <Text style={styles.listItemText}>{beneficio}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Action Buttons */}
          {!userProgram ? (
            <View style={styles.actionsContainer}>
              <Button
                title="Participar do Desafio"
                onPress={handleJoinProgram}
                loading={isJoining}
                style={styles.joinButton}
                gradient
              />
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              {userProgram.status === 'ativo' && (
                <>
                  <Button
                    title={`Marcar Dia ${daysCompleted + 1} como Concluído`}
                    onPress={handleUpdateProgress}
                    loading={isUpdating}
                    style={styles.updateButton}
                    gradient
                  />
                  {progress >= 90 && (
                    <Button
                      title="Completar Programa"
                      onPress={handleCompleteProgram}
                      style={styles.completeButton}
                    />
                  )}
                  <View style={styles.secondaryActions}>
                    <Button
                      title="Pausar"
                      onPress={() => handleToggleStatus('pausado')}
                      variant="outline"
                      style={styles.pauseButton}
                    />
                  </View>
                </>
              )}
              {userProgram.status === 'pausado' && (
                <>
                  <Button
                    title="Retomar"
                    onPress={() => handleToggleStatus('ativo')}
                    style={styles.updateButton}
                    gradient
                  />
                  <Button
                    title="Desistir do Programa"
                    onPress={handleLeaveProgram}
                    variant="outline"
                    style={styles.leaveButton}
                    textStyle={styles.leaveButtonText}
                  />
                </>
              )}
              {userProgram.status === 'concluido' && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                  <Text style={styles.completedText}>Programa Concluído! 🎉</Text>
                  <Text style={styles.completedSubtext}>
                    Parabéns por completar este {getCategoryLabel(program.categoria).toLowerCase()}!
                  </Text>
                </View>
              )}
            </View>
          )}
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.surface,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  programTitleContainer: {
    flex: 1,
  },
  programTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  programCategory: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  programDescription: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  progressSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressPercentage: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  progressStatText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
    marginTop: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  objectiveCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
  },
  objectiveText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  listItemText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  joinButton: {
    marginTop: Spacing.md,
  },
  updateButton: {
    marginTop: Spacing.md,
  },
  completeButton: {
    marginTop: Spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pauseButton: {
    flex: 1,
  },
  leaveButton: {
    marginTop: Spacing.sm,
    borderColor: Colors.error,
  },
  leaveButtonText: {
    color: Colors.error,
  },
  completedBadge: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  completedText: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  completedSubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});


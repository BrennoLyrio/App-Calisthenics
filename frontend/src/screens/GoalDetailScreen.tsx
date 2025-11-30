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
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Goal } from '../types';

const { width } = Dimensions.get('window');

interface GoalDetailScreenProps {
  navigation: any;
  route: {
    params: {
      goalId: number;
    };
  };
}

export const GoalDetailScreen: React.FC<GoalDetailScreenProps> = ({ navigation, route }) => {
  const { goalId } = route.params;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  // Reload goal when screen comes into focus to refresh progress
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGoal();
    });
    return unsubscribe;
  }, [navigation, goalId]);

  const loadGoal = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getGoalById(goalId);
      
      if (response.success && response.data) {
        setGoal(response.data);
      } else {
        Alert.alert('Erro', 'Meta não encontrada', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
      Alert.alert('Erro', 'Erro ao carregar meta', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setIsUpdating(true);
      const response = await apiService.updateGoalProgress(goalId);
      
      if (response.success && response.data) {
        setGoal(response.data);
        Alert.alert('Sucesso', 'Progresso atualizado com sucesso!');
      } else {
        Alert.alert('Erro', response.message || 'Erro ao atualizar progresso');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Erro', 'Erro ao atualizar progresso');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteGoal(goalId);
              
              if (response.success) {
                Alert.alert('Sucesso', 'Meta excluída com sucesso!', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Erro', response.message || 'Erro ao excluir meta');
              }
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Erro', 'Erro ao excluir meta');
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = async (newStatus: 'em_andamento' | 'concluida' | 'pausada') => {
    try {
      const response = await apiService.updateGoal(goalId, { status: newStatus });
      
      if (response.success && response.data) {
        setGoal(response.data);
      } else {
        Alert.alert('Erro', response.message || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status');
    }
  };

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
            <Text style={styles.loadingText}>Carregando meta...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!goal) {
    return null;
  }

  // Helper function to safely convert to number - ALWAYS returns a valid number
  const safeToNumber = (value: any): number => {
    // Handle null/undefined/empty
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
      return 0;
    }
    
    // If already a number
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        return 0;
      }
      return value;
    }
    
    // If it's a string, try to parse
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
        return 0;
      }
      const parsed = parseFloat(trimmed);
      if (isNaN(parsed) || !isFinite(parsed)) {
        return 0;
      }
      return parsed;
    }
    
    // For objects/other types, convert to string first
    try {
      const stringValue = String(value);
      if (stringValue === '[object Object]' || stringValue === 'null' || stringValue === 'undefined') {
        return 0;
      }
      const parsed = parseFloat(stringValue);
      if (isNaN(parsed) || !isFinite(parsed)) {
        return 0;
      }
      return parsed;
    } catch (e) {
      console.warn('Error converting value to number:', value, e);
      return 0;
    }
  };

  const getProgress = (): number => {
    // Always calculate percentage from valor_atual and valor_alvo (same as GoalsScreen)
    const valorAtual = safeToNumber(goal.valor_atual);
    const valorAlvo = safeToNumber(goal.valor_alvo);
    
    if (valorAlvo === 0) return 0;
    return Math.min((valorAtual / valorAlvo) * 100, 100);
  };
  
  const progress = getProgress();

  const daysRemaining = getDaysRemaining(goal.data_fim);
  const statusColor = getStatusColor(goal.status);

  function getDaysRemaining(dataFim: string): number {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'concluida':
        return Colors.success;
      case 'pausada':
        return Colors.textSecondary;
      default:
        return Colors.primary;
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluida':
        return 'Concluída';
      case 'pausada':
        return 'Pausada';
      default:
        return status;
    }
  }

  function getCategoryLabel(categoria: string): string {
    const labels: { [key: string]: string } = {
      'forca': 'Força',
      'resistencia': 'Resistência',
      'flexibilidade': 'Flexibilidade',
      'perda_peso': 'Perda de Peso',
      'ganho_massa': 'Ganho de Massa',
      'outro': 'Outro'
    };
    return labels[categoria] || categoria;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
            <Text style={styles.headerTitle}>Detalhes da Meta</Text>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>

          {/* Goal Info Card */}
          <Card style={styles.infoCard} shadow>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalTitle}>{goal.descricao}</Text>
                <Text style={styles.goalCategory}>{getCategoryLabel(goal.categoria)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {getStatusLabel(goal.status)}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: statusColor }]} />
              </View>
              <View style={styles.progressValues}>
                <Text style={styles.progressValue}>
                  {(() => {
                    try {
                      const atual = safeToNumber(goal?.valor_atual);
                      const alvo = safeToNumber(goal?.valor_alvo);
                      const unidade = goal?.unidade_medida || '';
                      
                      // Ensure both are valid numbers before calling toFixed
                      const atualNum = typeof atual === 'number' && !isNaN(atual) ? atual : 0;
                      const alvoNum = typeof alvo === 'number' && !isNaN(alvo) ? alvo : 0;
                      
                      return `${atualNum.toFixed(1)} / ${alvoNum.toFixed(1)} ${unidade}`;
                    } catch (error) {
                      console.error('Error formatting goal values:', error, goal);
                      return '0.0 / 0.0';
                    }
                  })()}
                </Text>
              </View>
            </View>
          </Card>

          {/* Details Card */}
          <Card style={styles.detailsCard} shadow>
            <Text style={styles.sectionTitle}>Informações</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Data de Início</Text>
                <Text style={styles.detailValue}>{formatDate(goal.data_inicio)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Data de Término</Text>
                <Text style={styles.detailValue}>{formatDate(goal.data_fim)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Prazo</Text>
                <Text style={styles.detailValue}>
                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo expirado'}
                </Text>
              </View>
            </View>

            {goal.meta_semanal && (
              <View style={styles.detailRow}>
                <Ionicons name="repeat-outline" size={20} color={Colors.textSecondary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Meta Semanal</Text>
                  <Text style={styles.detailValue}>
                    {goal.meta_semanal} {goal.unidade_medida}/semana
                  </Text>
                </View>
              </View>
            )}

            {goal.observacoes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text-outline" size={20} color={Colors.textSecondary} />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Observações</Text>
                  <Text style={styles.detailValue}>{goal.observacoes}</Text>
                </View>
              </View>
            )}
          </Card>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="Atualizar Progresso"
              onPress={handleUpdateProgress}
              disabled={isUpdating}
              style={styles.actionButton}
            />

            {goal.status === 'em_andamento' && (
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  onPress={() => handleStatusChange('pausada')}
                  style={[styles.statusButton, { backgroundColor: Colors.warning }]}
                >
                  <Ionicons name="pause" size={20} color={Colors.surface} />
                  <Text style={styles.statusButtonText}>Pausar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusChange('concluida')}
                  style={[styles.statusButton, { backgroundColor: Colors.success }]}
                >
                  <Ionicons name="checkmark" size={20} color={Colors.surface} />
                  <Text style={styles.statusButtonText}>Concluir</Text>
                </TouchableOpacity>
              </View>
            )}

            {goal.status === 'pausada' && (
              <TouchableOpacity
                onPress={() => handleStatusChange('em_andamento')}
                style={[styles.statusButton, { backgroundColor: Colors.primary, width: '100%' }]}
              >
                <Ionicons name="play" size={20} color={Colors.surface} />
                <Text style={styles.statusButtonText}>Retomar</Text>
              </TouchableOpacity>
            )}
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight as any,
    color: Colors.surface,
    textAlign: 'center',
    marginLeft: -40,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  goalTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight as any,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  goalCategory: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight as any,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressValue: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  detailsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight as any,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  statusButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.surface,
  },
});


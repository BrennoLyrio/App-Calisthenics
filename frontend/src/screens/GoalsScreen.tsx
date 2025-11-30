import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Goal } from '../types';

const { width } = Dimensions.get('window');

interface GoalsScreenProps {
  navigation: any;
}

type FilterType = 'all' | 'em_andamento' | 'concluida' | 'pausada';

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      console.log('🔍 Loading goals with filter:', filter, 'statusParam:', statusParam);
      
      const response = await apiService.getGoals(statusParam);
      
      console.log('✅ Goals response:', {
        success: response.success,
        count: response.data?.length || 0,
        statuses: response.data?.map(g => ({ id: g.id, status: g.status })) || []
      });
      
      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        console.error('❌ Error loading goals:', response);
        setGoals([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading goals:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [filter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGoals();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

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

  const getProgressPercentage = (goal: Goal): number => {
    const valorAtual = safeToNumber(goal.valor_atual);
    const valorAlvo = safeToNumber(goal.valor_alvo);
    
    if (valorAlvo === 0) return 0;
    return Math.min((valorAtual / valorAlvo) * 100, 100);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'concluida':
        return Colors.success;
      case 'pausada':
        return Colors.textSecondary;
      default:
        return Colors.primary;
    }
  };

  const getStatusLabel = (status: string): string => {
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
  };

  const getCategoryLabel = (categoria: string): string => {
    const labels: { [key: string]: string } = {
      'forca': 'Força',
      'resistencia': 'Resistência',
      'flexibilidade': 'Flexibilidade',
      'perda_peso': 'Perda de Peso',
      'ganho_massa': 'Ganho de Massa',
      'outro': 'Outro'
    };
    return labels[categoria] || categoria;
  };

  const getCategoryIcon = (categoria: string): string => {
    switch (categoria) {
      case 'forca':
        return 'barbell';
      case 'resistencia':
        return 'flame';
      case 'flexibilidade':
        return 'body';
      case 'perda_peso':
        return 'scale';
      case 'ganho_massa':
        return 'fitness';
      default:
        return 'flag';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dataFim: string): number => {
    const today = new Date();
    const endDate = new Date(dataFim);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    const daysRemaining = getDaysRemaining(goal.data_fim);
    const statusColor = getStatusColor(goal.status);

    return (
      <TouchableOpacity
        key={goal.id}
        onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.goalCard} shadow>
          <View style={styles.goalHeader}>
            <View style={styles.goalTitleRow}>
              <Ionicons 
                name={getCategoryIcon(goal.categoria) as any} 
                size={24} 
                color={statusColor} 
                style={styles.goalIcon}
              />
              <View style={styles.goalTitleContainer}>
                <Text style={styles.goalTitle} numberOfLines={1}>
                  {goal.descricao}
                </Text>
                <Text style={styles.goalCategory}>
                  {getCategoryLabel(goal.categoria)}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(goal.status)}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progresso
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progress)}%
              </Text>
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

          <View style={styles.goalFooter}>
            <View style={styles.goalInfo}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.goalInfoText}>
                {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo expirado'}
              </Text>
            </View>
            {goal.meta_semanal && (
              <View style={styles.goalInfo}>
                <Ionicons name="repeat-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.goalInfoText}>
                  {goal.meta_semanal} {goal.unidade_medida}/semana
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && goals.length === 0) {
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
            <Text style={styles.loadingText}>Carregando metas...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.surface} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Metas Pessoais</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateGoal')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={28} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['all', 'em_andamento', 'concluida', 'pausada'] as FilterType[]).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  onPress={() => setFilter(filterType)}
                  style={[
                    styles.filterButton,
                    filter === filterType && styles.filterButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === filterType && styles.filterTextActive
                    ]}
                  >
                    {filterType === 'all' ? 'Todas' : getStatusLabel(filterType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Goals List */}
          {goals.length === 0 ? (
            <Card style={styles.emptyCard} shadow>
              <Ionicons name="flag-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhuma meta encontrada</Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all'
                  ? 'Crie sua primeira meta para começar a acompanhar seu progresso!'
                  : `Você não tem metas ${getStatusLabel(filter).toLowerCase()}.`}
              </Text>
              {filter === 'all' && (
                <Button
                  title="Criar Meta"
                  onPress={() => navigation.navigate('CreateGoal')}
                  style={styles.createButton}
                />
              )}
            </Card>
          ) : (
            <View style={styles.goalsList}>
              {goals.map(renderGoalCard)}
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
  addButton: {
    padding: Spacing.xs,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: Colors.surface,
  },
  filterText: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  goalsList: {
    gap: Spacing.md,
  },
  goalCard: {
    marginBottom: Spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  goalTitleRow: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.sm,
  },
  goalIcon: {
    marginRight: Spacing.sm,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight as any,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  goalCategory: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
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
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  goalFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  goalInfoText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight as any,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  createButton: {
    marginTop: Spacing.md,
  },
});


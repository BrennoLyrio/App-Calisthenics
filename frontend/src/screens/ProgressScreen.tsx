import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { WorkoutHistory, WorkoutStats } from '../types';

const { width, height } = Dimensions.get('window');

interface ProgressScreenProps {
  navigation: any;
}

type TabType = 'summary' | 'charts' | 'history';

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load stats and history in parallel
      const [statsData, historyResponse] = await Promise.all([
        apiService.getWorkoutStats(30, 12),
        apiService.getWorkoutHistory(1, 15)
      ]);

      console.log('📊 Stats loaded:', statsData);
      setStats(statsData as WorkoutStats);

      if (historyResponse.success && historyResponse.data) {
        console.log('📝 History loaded:', historyResponse.data.length, 'items');
        setHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('❌ Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate level progression
  const calculateLevelProgression = () => {
    if (!stats || !user) return null;

    const currentLevel = user.nivel_condicionamento;
    const totalWorkouts = parseInt(stats.generalStats?.total_workouts?.toString() || '0');
    const avgSatisfaction = parseFloat(stats.generalStats?.avg_satisfaction?.toString() || '0');

    let nextLevel: string;
    let progressPercentage: number;
    let weeksEstimated: number;

    if (currentLevel === 'iniciante') {
      nextLevel = 'Intermediário';
      // Simple logic: 15+ workouts with good satisfaction = ready to progress
      progressPercentage = Math.min((totalWorkouts / 15) * 100, 100);
      weeksEstimated = Math.max(6 - Math.ceil(totalWorkouts / 2.5), 1);
    } else if (currentLevel === 'intermediario') {
      nextLevel = 'Avançado';
      progressPercentage = Math.min((totalWorkouts / 30) * 100, 100);
      weeksEstimated = Math.max(12 - Math.ceil(totalWorkouts / 2.5), 1);
    } else {
      return null; // Already at max level
    }

    const isReady = progressPercentage >= 80 && avgSatisfaction >= 3.5;

    return {
      currentLevel: currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1),
      nextLevel,
      progressPercentage,
      weeksEstimated,
      isReady,
    };
  };

  // Format duration to human-readable
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) {
      return '0min';
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  // Normalize difficulty from 1-10 to 0-5
  const normalizeIntensity = (difficulty: number): number => {
    if (!difficulty || difficulty === 0) return 0;
    return Math.round((difficulty / 10) * 5 * 10) / 10; // Round to 1 decimal
  };

  // Get daily progress data for recent workouts
  const getDailyProgressData = () => {
    if (!history || history.length === 0) {
      return {
        labels: ['Sem', 'dados'],
        datasets: [{
          data: [0],
        }],
      };
    }

    // Get last 15 workouts or all if less than 15
    const recentWorkouts = history.slice(0, Math.min(15, history.length)).reverse();
    
    return {
      labels: recentWorkouts.map((item: WorkoutHistory, index: number) => {
        const date = new Date(item.data_execucao);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) return 'Hoje';
        if (daysDiff === 1) return 'Ontem';
        if (daysDiff <= 7) return `${daysDiff}d`;
        
        const weekDiff = Math.floor(daysDiff / 7);
        if (weekDiff === 1) return '1sem';
        return `${weekDiff}sem`;
      }),
      datasets: [{
        data: recentWorkouts.map((item: WorkoutHistory) => Math.round(item.duracao / 60)), // Duration in minutes
      }],
    };
  };
  
  // Get weekly progress data (last 8 weeks)
  const getWeeklyProgressData = () => {
    if (!stats?.weeklyProgress || stats.weeklyProgress.length === 0) {
      return {
        labels: ['Sem', 'dados'],
        datasets: [{
          data: [0],
        }],
      };
    }

    const data = stats.weeklyProgress.slice(-8); // Last 8 weeks
    return {
      labels: data.map((week: any, index: number) => {
        if (index === data.length - 1) return 'Esta';
        if (index === data.length - 2) return 'Sem.';
        return `${data.length - index - 1}w`;
      }),
      datasets: [{
        data: data.map((week: any) => parseInt(week.workouts_count) || 0),
      }],
    };
  };

  // Get workouts by day of week
  const getWorkoutsByDayOfWeek = () => {
    if (!history || history.length === 0) {
      return {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0],
        }],
      };
    }

    // Initialize days counter
    const daysCount: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    // Count workouts by day of week
    history.forEach((item) => {
      const date = new Date(item.data_execucao);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      daysCount[dayOfWeek] = (daysCount[dayOfWeek] || 0) + 1;
    });

    return {
      labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      datasets: [{
        data: [
          daysCount[0] || 0, // Sunday
          daysCount[1] || 0, // Monday
          daysCount[2] || 0, // Tuesday
          daysCount[3] || 0, // Wednesday
          daysCount[4] || 0, // Thursday
          daysCount[5] || 0, // Friday
          daysCount[6] || 0, // Saturday
        ],
      }],
    };
  };

  const renderSummary = () => {
    const levelProgression = calculateLevelProgression();
    const generalStats = stats?.generalStats || {};

    return (
      <View style={styles.tabContent}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="trophy" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>{generalStats.total_workouts || 0}</Text>
              <Text style={styles.summaryLabel}>Treinos</Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="time" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>
                {formatDuration(parseFloat(generalStats.total_duration?.toString() || '0'))}
              </Text>
              <Text style={styles.summaryLabel}>Duração Total</Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="flame" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>{generalStats.total_calories ? parseInt(generalStats.total_calories.toString()) : 0}</Text>
              <Text style={styles.summaryLabel}>Calorias</Text>
            </View>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryCardContent}>
              <Ionicons name="flash" size={24} color={Colors.primary} />
              <Text style={styles.summaryValue}>
                {generalStats.avg_difficulty ? normalizeIntensity(parseFloat(generalStats.avg_difficulty.toString())).toFixed(1) : '0.0'}
              </Text>
              <Text style={styles.summaryLabel}>Intensidade</Text>
            </View>
          </Card>
        </View>

        {/* Level Progression */}
        {levelProgression && (
          <Card style={styles.progressionCard}>
            <Text style={styles.progressionTitle}>Progressão de Nível</Text>

            <Text style={styles.progressionLevel}>
              {levelProgression.currentLevel} → {levelProgression.nextLevel}
            </Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${levelProgression.progressPercentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(levelProgression.progressPercentage)}%
              </Text>
            </View>

            <View style={styles.progressionBadgeContainer}>
              <View style={[
                styles.progressionBadge,
                levelProgression.isReady && styles.progressionBadgeReady
              ]}>
                <Ionicons
                  name={levelProgression.isReady ? 'checkmark-circle' : 'hourglass'}
                  size={16}
                  color={Colors.surface}
                />
                <Text style={styles.progressionBadgeText}>
                  {levelProgression.isReady ? 'Pronto' : 'Em Progresso'}
                </Text>
              </View>
            </View>

            <Text style={styles.progressionEstimate}>
              {levelProgression.isReady
                ? '🎉 Você está pronto para avançar!'
                : `⏰ Est. ${levelProgression.weeksEstimated} semana${levelProgression.weeksEstimated > 1 ? 's' : ''} para próximo nível`
              }
            </Text>
          </Card>
        )}

        {/* Weekly Distribution Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Treinos por Dia da Semana</Text>
          <BarChart
            data={getWorkoutsByDayOfWeek()}
            width={width - (Spacing.lg * 2 + Spacing.md * 2)} // Account for padding
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: Colors.surface,
              backgroundGradientFrom: Colors.surface,
              backgroundGradientTo: Colors.light,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: BorderRadius.md
              },
              barPercentage: 0.6,
            }}
            style={styles.chartStyle}
            showValuesOnTopOfBars
            withInnerLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </Card>
      </View>
    );
  };

  const renderCharts = () => {
    // Check if we have enough weekly data (at least 3 weeks to make a meaningful line chart)
    const hasWeeklyData = stats?.weeklyProgress && stats.weeklyProgress.length >= 3;
    
    return (
      <View style={styles.tabContent}>
        {hasWeeklyData ? (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Progresso Semanal (Últimas 8 Semanas)</Text>
            <LineChart
              data={getWeeklyProgressData()}
              width={width - (Spacing.lg * 2 + Spacing.md * 2)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=" treinos"
              chartConfig={{
                backgroundColor: Colors.surface,
                backgroundGradientFrom: Colors.surface,
                backgroundGradientTo: Colors.light,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: BorderRadius.md
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: Colors.primary
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: Colors.textSecondary,
                  strokeOpacity: 0.2
                }
              }}
              style={styles.chartStyle}
              bezier
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withInnerLines={true}
              withOuterLines={false}
            />
          </Card>
        ) : (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Histórico Recente de Treinos</Text>
            <LineChart
              data={getDailyProgressData()}
              width={width - (Spacing.lg * 2 + Spacing.md * 2)}
              height={220}
              yAxisLabel=""
              yAxisSuffix="min"
              chartConfig={{
                backgroundColor: Colors.surface,
                backgroundGradientFrom: Colors.surface,
                backgroundGradientTo: Colors.light,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: BorderRadius.md
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: Colors.primary
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: Colors.textSecondary,
                  strokeOpacity: 0.1
                }
              }}
              style={styles.chartStyle}
              bezier
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withInnerLines={true}
              withOuterLines={false}
              segments={2}
            />
          </Card>
        )}

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribuição por Dia da Semana</Text>
          <BarChart
            data={getWorkoutsByDayOfWeek()}
            width={width - (Spacing.lg * 2 + Spacing.md * 2)}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: Colors.surface,
              backgroundGradientFrom: Colors.surface,
              backgroundGradientTo: Colors.light,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: BorderRadius.md
              },
              barPercentage: 0.7,
            }}
            style={styles.chartStyle}
            showValuesOnTopOfBars
            withInnerLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
          />
        </Card>
      </View>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="calendar" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum treino registrado</Text>
              <Text style={styles.emptyDescription}>
                Complete treinos para ver seu histórico aqui
              </Text>
            </View>
          </Card>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {history.map((item) => (
          <Card key={item.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyDate}>
                <Ionicons name="calendar" size={16} color={Colors.primary} />
                <Text style={styles.historyDateText}>
                  {new Date(item.data_execucao).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {item.avaliacao_dificuldade && (
                <View style={styles.historyRating}>
                  {[...Array(5)].map((_, i) => {
                    const normalizedIntensity = normalizeIntensity(item.avaliacao_dificuldade!);
                    return (
                      <Ionicons
                        key={i}
                        name={i < normalizedIntensity ? 'flash' : 'flash-outline'}
                        size={14}
                        color={Colors.primary}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.historyStats}>
              <View style={styles.historyStatItem}>
                <Ionicons name="time" size={14} color={Colors.textSecondary} />
                <Text style={styles.historyStatText}>
                  {formatDuration(item.duracao)}
                </Text>
              </View>
              <View style={styles.historyStatItem}>
                <Ionicons name="repeat" size={14} color={Colors.textSecondary} />
                <Text style={styles.historyStatText}>
                  {item.series_realizadas} séries
                </Text>
              </View>
              {item.calorias_queimadas && (
                <View style={styles.historyStatItem}>
                  <Ionicons name="flame" size={14} color={Colors.textSecondary} />
                  <Text style={styles.historyStatText}>
                    {item.calorias_queimadas} cal
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando progresso...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay */}
        <LinearGradient
          colors={['rgba(255,107,53,0.4)', 'rgba(255,140,66,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />

        <SafeAreaView style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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

              <Text style={styles.headerTitle}>Meu Progresso</Text>

              <View style={styles.headerPlaceholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
                onPress={() => setActiveTab('summary')}
              >
                <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
                  Resumo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'charts' && styles.tabActive]}
                onPress={() => setActiveTab('charts')}
              >
                <Text style={[styles.tabText, activeTab === 'charts' && styles.tabTextActive]}>
                  Gráficos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                  Histórico
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'charts' && renderCharts()}
            {activeTab === 'history' && renderHistory()}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.h4.fontSize,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: Spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '48%',
    marginBottom: Spacing.md,
  },
  summaryCardContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  summaryValue: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
  },
  progressionTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  progressionBadgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  progressionBadgeReady: {
    backgroundColor: Colors.success,
  },
  progressionBadgeText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.surface,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  progressionLevel: {
    fontSize: Typography.h4.fontSize,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  progressPercentage: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  progressionEstimate: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  chartTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: BorderRadius.md,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  historyRating: {
    flexDirection: 'row',
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  historyStatText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: Spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProgressScreen;


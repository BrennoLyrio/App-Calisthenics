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
import { Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { ThematicProgram, UserProgram } from '../types';

const { width } = Dimensions.get('window');

interface ChallengesScreenProps {
  navigation: any;
}

type FilterType = 'all' | 'desafio' | 'programa';

export const ChallengesScreen: React.FC<ChallengesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<ThematicProgram[]>([]);
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadPrograms = async () => {
    try {
      setIsLoading(true);
      const categoria = filter === 'all' ? undefined : filter;
      // Don't filter by level - show all programs regardless of user level
      const nivel = undefined;
      
      console.log('🔍 Loading programs with filter:', filter, 'categoria:', categoria);
      
      const [programsResponse, userProgramsResponse] = await Promise.all([
        apiService.getPrograms(categoria, nivel),
        apiService.getUserPrograms()
      ]);
      
      console.log('✅ Programs loaded:', programsResponse.data?.length || 0);
      
      if (programsResponse.success && programsResponse.data) {
        setPrograms(programsResponse.data);
      } else {
        console.error('❌ Failed to load programs:', programsResponse.message);
        setPrograms([]);
      }
      
      if (userProgramsResponse.success && userProgramsResponse.data) {
        setUserPrograms(userProgramsResponse.data);
      }
    } catch (error: any) {
      console.error('❌ Error loading programs:', error);
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [filter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPrograms();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const getUserProgram = (programId: number): UserProgram | undefined => {
    return userPrograms.find(up => up.id_programa === programId);
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

  const renderProgramCard = (program: ThematicProgram) => {
    const userProgram = getUserProgram(program.id);
    const isJoined = !!userProgram;
    const progress = userProgram ? userProgram.progresso : 0;
    const status = userProgram?.status;
    
    return (
      <TouchableOpacity
        key={program.id}
        onPress={() => navigation.navigate('ChallengeDetail', { programId: program.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.programCard} shadow>
          {/* Category Badge at top */}
          <View style={[styles.categoryBadge, { backgroundColor: `${Colors.primary}20` }]}>
            <Ionicons 
              name={getCategoryIcon(program.categoria) as any} 
              size={16} 
              color={Colors.primary} 
            />
            <Text style={[styles.categoryBadgeText, { color: Colors.primary }]}>
              {getCategoryLabel(program.categoria).toUpperCase()}
            </Text>
          </View>

          <View style={styles.programHeader}>
            <View style={styles.programTitleRow}>
              <View style={[styles.categoryIconContainer, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons 
                  name={getCategoryIcon(program.categoria) as any} 
                  size={24} 
                  color={Colors.primary} 
                />
              </View>
              <View style={styles.programTitleContainer}>
                <Text style={styles.programTitle} numberOfLines={2}>
                  {program.nome}
                </Text>
                <Text style={styles.programCategory}>
                  {getCategoryLabel(program.categoria)} • {program.duracao_dias} {program.duracao_dias === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            </View>
            {isJoined && (
              <View style={[styles.statusBadge, { backgroundColor: status === 'concluido' ? `${Colors.success}20` : `${Colors.primary}20` }]}>
                <Ionicons 
                  name={status === 'concluido' ? 'checkmark-circle' : status === 'pausado' ? 'pause-circle' : 'play-circle'} 
                  size={16} 
                  color={status === 'concluido' ? Colors.success : Colors.primary} 
                />
                <Text style={[styles.statusText, { color: status === 'concluido' ? Colors.success : Colors.primary }]}>
                  {status === 'concluido' ? 'Concluído' : status === 'pausado' ? 'Pausado' : 'Em andamento'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.programDescription} numberOfLines={2}>
            {program.descricao}
          </Text>

          {isJoined && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: Colors.primary }]} />
              </View>
            </View>
          )}

          <View style={styles.programStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{program.tempo_estimado_diario} min/dia</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{program.calorias_estimadas_total} kcal</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(program.dificuldade_inicial)}20` }]}>
                <Ionicons 
                  name="barbell-outline" 
                  size={14} 
                  color={getDifficultyColor(program.dificuldade_inicial)} 
                />
                <Text style={[styles.difficultyText, { color: getDifficultyColor(program.dificuldade_inicial) }]}>
                  {getDifficultyLabel(program.dificuldade_inicial)}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
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
            <Text style={styles.loadingText}>Carregando desafios e programas...</Text>
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.surface}
            />
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
            <Text style={styles.headerTitle}>Desafios e Programas</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['all', 'desafio', 'programa'] as FilterType[]).map((filterType) => (
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
                    {filterType === 'all' ? 'Todos' : getCategoryLabel(filterType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Programs List */}
          {programs.length === 0 ? (
            <Card style={styles.emptyCard} shadow>
              <Ionicons name="trophy-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum desafio encontrado</Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all'
                  ? 'Não há desafios ou programas disponíveis no momento.'
                  : `Não há ${getCategoryLabel(filter).toLowerCase()}s disponíveis.`}
              </Text>
            </Card>
          ) : (
            <View style={styles.programsList}>
              {programs.map(renderProgramCard)}
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
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface + '40',
    marginRight: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.surface,
  },
  filterText: {
    ...Typography.body,
    color: Colors.surface + 'CC',
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  programsList: {
    paddingHorizontal: Spacing.lg,
  },
  programCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  programTitleContainer: {
    flex: 1,
  },
  programTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  programCategory: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  programDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
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
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressPercentage: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  programStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
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
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  difficultyText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});


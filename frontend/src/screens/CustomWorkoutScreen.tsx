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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { CustomWorkout } from '../types';

const { width } = Dimensions.get('window');

interface CustomWorkoutScreenProps {
  navigation: any;
}

export const CustomWorkoutScreen: React.FC<CustomWorkoutScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCustomWorkouts();
      
      if (response.success && response.data) {
        setWorkouts(response.data);
      }
    } catch (error: any) {
      console.error('Error loading custom workouts:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL
      });
      
      const errorMessage = error?.response?.status === 404
        ? 'Rota não encontrada. Verifique se o backend foi reiniciado e a migration foi executada.'
        : error?.response?.data?.message || error?.message || 'Não foi possível carregar as rotinas personalizadas.';
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkouts();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const handleDelete = (workout: CustomWorkout) => {
    Alert.alert(
      'Excluir Rotina',
      `Tem certeza que deseja excluir a rotina "${workout.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomWorkout(workout.id);
              await loadWorkouts();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível excluir a rotina.');
            }
          },
        },
      ]
    );
  };

  const renderWorkoutCard = (workout: CustomWorkout) => {
    const exerciseCount = workout.exercises?.length || 0;
    const duration = workout.duracao_estimada ? `${workout.duracao_estimada} min` : 'N/A';
    const calories = workout.calorias_estimadas ? `${workout.calorias_estimadas} kcal` : 'N/A';

    return (
      <TouchableOpacity
        key={workout.id}
        onPress={() => navigation.navigate('CustomWorkoutEditor', { workoutId: workout.id })}
        activeOpacity={0.7}
      >
        <Card style={styles.workoutCard} shadow>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitleRow}>
              <Ionicons 
                name="barbell" 
                size={24} 
                color={Colors.primary} 
                style={styles.workoutIcon}
              />
              <View style={styles.workoutTitleContainer}>
                <Text style={styles.workoutTitle} numberOfLines={1}>
                  {workout.nome}
                </Text>
                {workout.descricao && (
                  <Text style={styles.workoutDescription} numberOfLines={2}>
                    {workout.descricao}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(workout);
              }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statText}>{exerciseCount} exercícios</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statText}>{duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.statText}>{calories}</Text>
            </View>
          </View>

          <View style={styles.workoutActions}>
            <Button
              title="Editar"
              onPress={() => {
                navigation.navigate('CustomWorkoutEditor', { workoutId: workout.id });
              }}
              style={styles.editButton}
              size="small"
            />
            <Button
              title="Iniciar Treino"
              onPress={() => {
                // Navigate to WorkoutSession with custom workout
                navigation.navigate('WorkoutSession', {
                  workout: {
                    exercises: workout.exercises?.map((ex) => ({
                      exercise: ex.exercise!,
                      sets: ex.series,
                      reps: ex.repeticoes,
                      duration: ex.tempo_execucao,
                      restTime: ex.descanso || 60,
                    })) || [],
                    totalDuration: workout.duracao_estimada || 0,
                    totalCalories: workout.calorias_estimadas || 0,
                    workoutName: workout.nome,
                    isCustomWorkout: true,
                    customWorkoutId: workout.id,
                  },
                });
              }}
              style={styles.startButton}
              size="small"
              gradient
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && workouts.length === 0) {
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
            <Text style={styles.loadingText}>Carregando rotinas...</Text>
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
            <Text style={styles.headerTitle}>Minhas Rotinas</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CustomWorkoutEditor')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={28} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Workouts List */}
          {workouts.length === 0 ? (
            <Card style={styles.emptyCard} shadow>
              <Ionicons name="barbell-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhuma rotina criada</Text>
              <Text style={styles.emptyDescription}>
                Crie sua primeira rotina personalizada escolhendo exercícios da biblioteca!
              </Text>
              <Button
                title="Criar Rotina"
                onPress={() => navigation.navigate('CustomWorkoutEditor')}
                style={styles.createButton}
              />
            </Card>
          ) : (
            <View style={styles.workoutsList}>
              {workouts.map(renderWorkoutCard)}
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
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.surface,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: Spacing.xs,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
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
  workoutsList: {
    gap: Spacing.md,
  },
  workoutCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutIcon: {
    marginRight: Spacing.sm,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  workoutDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  startButton: {
    flex: 1,
  },
});


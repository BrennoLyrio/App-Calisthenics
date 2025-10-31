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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCard, Button, Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width, height } = Dimensions.get('window');

interface ExercisesScreenProps {
  navigation: any;
}

interface DailyWorkout {
  exercises: Array<{
    exercise: Exercise;
    duration?: number;
    reps?: number;
    sets: number;
    restTime: number;
  }>;
  totalDuration: number;
  totalCalories: number;
}

export const ExercisesScreen: React.FC<ExercisesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const generateDailyWorkout = async () => {
    try {
      setIsLoading(true);
      
      // Buscar exercícios baseados no perfil do usuário
      const exercisesResponse = await apiService.getExercises({
        nivel: user?.nivel_condicionamento,
        categoria: user?.foco_treino === 'completo' ? undefined : user?.foco_treino,
        limit: 6
      });

      if (exercisesResponse.success && exercisesResponse.data) {
        const exercises = exercisesResponse.data;
        
        // Gerar treino personalizado baseado no perfil
        const workoutExercises = exercises.map((exercise, index) => {
          // Definir configurações base
          const baseSets = 3;
          const baseRest = 30;
          
          // Ajustar baseado no nível
          let multiplier = 1;
          if (user?.nivel_condicionamento === 'iniciante') {
            multiplier = 0.8;
          } else if (user?.nivel_condicionamento === 'avancado') {
            multiplier = 1.2;
          }
          
          const exerciseData: any = {
            exercise,
            sets: baseSets,
            restTime: Math.round(baseRest * multiplier),
          };
          
          // Usar o tipo definido no backend para determinar se é timer ou repetições
          if (exercise.tipo === 'timer') {
            // Para exercícios com timer, usar o tempo_estimado
            const baseDuration = exercise.tempo_estimado || 30;
            exerciseData.duration = Math.round(baseDuration * multiplier);
          } else {
            // Para exercícios com repetições, usar repeticoes_estimadas
            const baseReps = exercise.repeticoes_estimadas || 12;
            exerciseData.reps = Math.round(baseReps * multiplier);
          }
          
          return exerciseData;
        });

        // Calcular totais
        const totalDuration = workoutExercises.reduce((total, item) => {
          const exerciseTime = (item.duration || 0) * item.sets;
          const restTime = item.restTime * (item.sets - 1);
          return total + exerciseTime + restTime;
        }, 0);

        const totalCalories = workoutExercises.reduce((total, item) => {
          return total + (item.exercise.calorias_estimadas * item.sets);
        }, 0);

        setDailyWorkout({
          exercises: workoutExercises,
          totalDuration: Math.round(totalDuration / 60), // em minutos
          totalCalories: Math.round(totalCalories),
        });
      }
    } catch (error) {
      console.error('Error generating daily workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateDailyWorkout();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await generateDailyWorkout();
    setRefreshing(false);
  };

  const handleExercisePress = (exercise: Exercise) => {
    // Navegar para preview do exercício
    navigation.navigate('ExercisePreview', { 
      exercise,
      isFromWorkout: false 
    });
  };

  const handleStartWorkout = () => {
    if (dailyWorkout) {
      navigation.navigate('WorkoutSession', { workout: dailyWorkout });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    const messages = [
      'Vamos treinar! 💪',
      'Hora de suar! 🔥',
      'Seu corpo agradece! ❤️',
      'Vamos evoluir juntos! 🚀',
      'Cada treino conta! ⭐',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparando seu treino...</Text>
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
              
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="refresh" size={24} color={Colors.surface} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="share" size={24} color={Colors.surface} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.greeting}>{getGreeting()}, {user?.nome?.split(' ')[0]}!</Text>
              <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
            </View>

            {/* Workout Summary */}
            {dailyWorkout && (
              <Card style={styles.workoutSummaryCard} shadow>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutTitle}>Treino de Hoje</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>
                      {user?.nivel_condicionamento?.charAt(0).toUpperCase() + user?.nivel_condicionamento?.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.workoutSubtitle}>
                  Foco: {user?.foco_treino === 'superiores' ? 'Membros Superiores' :
                         user?.foco_treino === 'inferiores' ? 'Membros Inferiores' :
                         user?.foco_treino === 'core' ? 'Core (Abdômen)' : 'Treino Completo'}
                </Text>

                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={20} color={Colors.primary} />
                    <Text style={styles.statValue}>{dailyWorkout.totalDuration} min</Text>
                    <Text style={styles.statLabel}>Duração</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="flame" size={20} color={Colors.primary} />
                    <Text style={styles.statValue}>{dailyWorkout.totalCalories}</Text>
                    <Text style={styles.statLabel}>Calorias</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="fitness" size={20} color={Colors.primary} />
                    <Text style={styles.statValue}>{dailyWorkout.exercises.length}</Text>
                    <Text style={styles.statLabel}>Exercícios</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Exercises List */}
            <View style={styles.exercisesSection}>
              <Text style={styles.sectionTitle}>Exercícios Recomendados</Text>
              
              {dailyWorkout?.exercises.map((workoutExercise, index) => (
                <ExerciseCard
                  key={workoutExercise.exercise.id}
                  exercise={workoutExercise.exercise}
                  onPress={() => handleExercisePress(workoutExercise.exercise)}
                  showDifficulty={true}
                  showDuration={true}
                  showReps={true}
                  duration={workoutExercise.duration}
                  reps={workoutExercise.reps}
                  restTime={workoutExercise.restTime}
                />
              ))}
            </View>

            {/* Start Workout Button */}
            {dailyWorkout && (
              <Button
                title="Iniciar Treino"
                onPress={handleStartWorkout}
                size="large"
                gradient
                style={styles.startWorkoutButton}
                leftIcon="play"
              />
            )}
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
    fontSize: Typography.h3.fontSize,
    color: Colors.text,
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
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.h1.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  motivationalMessage: {
    fontSize: Typography.h3.fontSize,
    color: Colors.surface,
    opacity: 0.9,
  },
  workoutSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  workoutTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
  },
  difficultyBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.surface,
  },
  workoutSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  exercisesSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.md,
  },
  startWorkoutButton: {
    marginBottom: Spacing.xl,
  },
});

export default ExercisesScreen;
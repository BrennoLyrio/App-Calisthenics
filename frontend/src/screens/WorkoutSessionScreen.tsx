import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
  AppState,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width, height } = Dimensions.get('window');

interface WorkoutSessionScreenProps {
  navigation: any;
  route: {
    params: {
      workout?: {
        exercises: Array<{
          exercise: Exercise;
          duration?: number;
          reps?: number;
          sets: number;
          restTime: number;
        }>;
      };
      exercise?: Exercise;
      duration?: number;
      reps?: number;
      restTime?: number;
    };
  };
}

export const WorkoutSessionScreen: React.FC<WorkoutSessionScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { workout, exercise, duration, reps, restTime } = route.params;
  
  // Estado para controle do treino
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Determinar se é treino completo ou exercício individual
  const isFullWorkout = !!workout;
  const exercises = workout?.exercises || (exercise ? [{
    exercise,
    duration,
    reps,
    sets: 1,
    restTime: restTime || 30
  }] : []);
  
  const currentWorkoutExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isLastSet = currentSet === currentWorkoutExercise?.sets;
  
  // Monitorar mudanças no estado do app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App voltou do background - restaurar timer se necessário
        if (isExerciseActive && timeLeft > 0 && !timerFinished) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, timeLeft - elapsed);
          setTimeLeft(newTimeLeft);
          
          if (newTimeLeft === 0) {
            setTimerFinished(true);
            setIsExerciseActive(false);
          } else {
            // Atualizar o tempo de início para continuar a contagem
            startTimeRef.current = Date.now();
          }
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, isExerciseActive, timeLeft, timerFinished]);
  
  // Inicializar timer baseado no tipo de exercício
  useEffect(() => {
    if (currentWorkoutExercise) {
      if (currentWorkoutExercise.duration) {
        setTimeLeft(currentWorkoutExercise.duration);
        setTimerFinished(false);
      }
    }
  }, [currentExerciseIndex, currentSet]);
  
  // Timer countdown assíncrono
  useEffect(() => {
    if (isExerciseActive && timeLeft > 0 && !timerFinished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setTimerFinished(true);
            setIsExerciseActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isExerciseActive, timeLeft, timerFinished]);
  
  const startExercise = useCallback(() => {
    setIsExerciseActive(true);
    setIsResting(false);
    setTimerFinished(false);
    startTimeRef.current = Date.now();
  }, []);
  
  const startRest = useCallback(() => {
    if (currentWorkoutExercise) {
      setTimeLeft(currentWorkoutExercise.restTime);
      setIsResting(true);
      setIsExerciseActive(false);
      setTimerFinished(false);
      startTimeRef.current = Date.now();
    }
  }, [currentWorkoutExercise]);
  
  const nextExercise = useCallback(() => {
    if (isResting) {
      // Terminar descanso
      setIsResting(false);
      setTimerFinished(false);
      
      if (isLastSet) {
        // Próximo exercício
        if (isLastExercise) {
          // Treino concluído
          navigation.navigate('WorkoutCompleted', {
            totalExercises: exercises.length,
            completedExercises: completedExercises + 1,
            totalDuration: workout?.totalDuration || 0,
            totalCalories: workout?.totalCalories || 0,
          });
        } else {
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSet(1);
        }
      } else {
        // Próxima série
        setCurrentSet(prev => prev + 1);
      }
    } else {
      // Exercício concluído
      setCompletedExercises(prev => prev + 1);
      
      if (isLastSet) {
        // Última série - ir para descanso ou próximo exercício
        if (isLastExercise) {
          // Último exercício - concluir treino
          navigation.navigate('WorkoutCompleted', {
            totalExercises: exercises.length,
            completedExercises: completedExercises + 1,
            totalDuration: workout?.totalDuration || 0,
            totalCalories: workout?.totalCalories || 0,
          });
        } else {
          // Ir para descanso antes do próximo exercício
          startRest();
        }
      } else {
        // Ir para descanso antes da próxima série
        startRest();
      }
    }
  }, [isResting, isLastSet, isLastExercise, completedExercises, exercises.length, workout, navigation, startRest]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgressPercentage = () => {
    if (isFullWorkout) {
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
      const completedSets = exercises.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.sets, 0) + (currentSet - 1);
      return (completedSets / totalSets) * 100;
    }
    return 0;
  };
  
  if (!currentWorkoutExercise) {
    return (
      <View style={styles.container}>
        <Text>Erro: Exercício não encontrado</Text>
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
            bounces={true}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Pausar Treino',
                    'Tem certeza que deseja pausar o treino?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Pausar', onPress: () => navigation.goBack() }
                    ]
                  );
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.surface} />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>
                  {isResting ? 'Descanso' : 'Exercício'}
                </Text>
                {isFullWorkout && (
                  <Text style={styles.headerSubtitle}>
                    {currentExerciseIndex + 1} de {exercises.length}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity style={styles.pauseButton}>
                <Ionicons name="pause" size={24} color={Colors.surface} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            {isFullWorkout && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(getProgressPercentage())}% concluído
                </Text>
              </View>
            )}

            {/* Exercise Image */}
            <View style={styles.exerciseImageContainer}>
              {currentWorkoutExercise.exercise.imagem_url ? (
                <Image 
                  source={{ uri: currentWorkoutExercise.exercise.imagem_url }} 
                  style={styles.exerciseImage} 
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="fitness" size={80} color={Colors.textSecondary} />
                </View>
              )}
            </View>

            {/* Exercise Info */}
            <Card style={styles.exerciseInfoCard} shadow>
              <Text style={styles.exerciseName}>{currentWorkoutExercise.exercise.nome}</Text>
              
              {isFullWorkout && (
                <Text style={styles.setInfo}>
                  Série {currentSet} de {currentWorkoutExercise.sets}
                </Text>
              )}

              {/* Timer or Reps Display */}
              <View style={styles.timerContainer}>
                {isResting ? (
                  <View style={styles.restDisplay}>
                    <Ionicons name="pause-circle" size={60} color={Colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>Descanso</Text>
                    {timeLeft === 0 && (
                      <Text style={styles.timerFinishedMessage}>Tempo de descanso encerrado!</Text>
                    )}
                  </View>
                ) : currentWorkoutExercise.duration ? (
                  <View style={styles.timerDisplay}>
                    <Ionicons name="time" size={60} color={Colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>Tempo</Text>
                    {timerFinished && (
                      <Text style={styles.timerFinishedMessage}>Tempo encerrado!</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.repsDisplay}>
                    <Ionicons name="repeat" size={60} color={Colors.primary} />
                    <Text style={styles.repsText}>{currentWorkoutExercise.reps}</Text>
                    <Text style={styles.timerLabel}>Repetições</Text>
                  </View>
                )}
              </View>

              {/* Exercise Description */}
              <Text style={styles.exerciseDescription}>
                {currentWorkoutExercise.exercise.descricao_textual}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {!isExerciseActive && !isResting ? (
                  <Button
                    title="Iniciar"
                    onPress={startExercise}
                    size="large"
                    gradient
                    style={styles.startButton}
                    leftIcon="play"
                  />
                ) : (
                  <Button
                    title={isResting ? "Próximo" : (currentWorkoutExercise.duration ? "Próximo" : "Concluído")}
                    onPress={nextExercise}
                    size="large"
                    gradient
                    style={styles.nextButton}
                    leftIcon={isResting ? "chevron-forward" : (currentWorkoutExercise.duration ? "chevron-forward" : "checkmark")}
                  />
                )}
              </View>
            </Card>
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
    paddingBottom: Spacing.xl,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  headerSubtitle: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.surface,
    opacity: 0.8,
  },
  pauseButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.surface,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  exerciseImageContainer: {
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  exerciseName: {
    fontSize: Typography.h1.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  setInfo: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerDisplay: {
    alignItems: 'center',
  },
  restDisplay: {
    alignItems: 'center',
  },
  repsDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  repsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  timerLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  timerFinishedMessage: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actionButtons: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  startButton: {
    marginBottom: Spacing.md,
  },
  nextButton: {
    marginBottom: Spacing.md,
  },
});

export default WorkoutSessionScreen;

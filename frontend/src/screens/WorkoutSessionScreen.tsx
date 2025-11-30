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
  Vibration,
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
        totalDuration?: number;
        totalCalories?: number;
      };
      exercise?: Exercise;
      duration?: number;
      reps?: number;
      restTime?: number;
      skipSaveHistory?: boolean;
    };
  };
}

export const WorkoutSessionScreen: React.FC<WorkoutSessionScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { workout, exercise, duration, reps, restTime, skipSaveHistory } = route.params;
  
  // Estado para controle do treino
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Para contador crescente em exercícios com repetições
  const [completedExercises, setCompletedExercises] = useState(0);
  const [timerFinished, setTimerFinished] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  
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
    sets: 3, // Sempre 3 séries por exercício
    restTime: restTime || 30
  }] : []);
  
  const currentWorkoutExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const isLastSet = currentSet === currentWorkoutExercise?.sets; // Use actual sets count
  const isLastSetOfLastExercise = isLastExercise && isLastSet;
  
  // Determinar tipo de exercício baseado no campo 'tipo' do exercício
  const isTimerExercise = currentWorkoutExercise?.exercise?.tipo === 'timer';
  const isRepsExercise = currentWorkoutExercise?.exercise?.tipo === 'reps';
  
  // Calcular progresso do treino
  const totalSets = exercises.reduce((total, ex) => total + ex.sets, 0);
  const completedSets = exercises.slice(0, currentExerciseIndex).reduce((total, ex) => total + ex.sets, 0) + (currentSet - 1);
  const progressPercentage = Math.round((completedSets / totalSets) * 100);
  
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
      setAppState(nextAppState as any);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, isExerciseActive, timeLeft, timerFinished]);
  
  // Inicializar timer baseado no tipo de exercício (usar tempo_estimado para timer ou 30s padrão)
  useEffect(() => {
    if (currentWorkoutExercise) {
      if (isTimerExercise) {
        // Para exercícios com timer, usar o tempo_estimado do exercício ou o tempo definido no treino
        const duration = currentWorkoutExercise.duration || 
                        currentWorkoutExercise.exercise.tempo_estimado || 
                        30; // Valor padrão de 30 segundos
        setTimeLeft(duration);
        setTimerFinished(false);
      } else if (isRepsExercise) {
        // Para exercícios com repetições, não precisamos definir o timer inicial
        setTimeLeft(0);
      }
      setElapsedTime(0); // Reset contador crescente
    }
  }, [currentExerciseIndex, currentSet, isTimerExercise, isRepsExercise]);
  
  // Timer countdown assíncrono (para exercícios com timer e descanso)
  useEffect(() => {
    if (isExerciseActive && !isPaused) {
      console.log('Iniciando timer:', { 
        isExerciseActive, 
        isPaused, 
        isTimerExercise, 
        isResting, 
        timeLeft, 
        currentExercise: currentWorkoutExercise?.exercise.nome,
        currentSet,
        totalSets: currentWorkoutExercise?.sets
      });
      
      // Limpa qualquer timer existente
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Inicia um novo timer
      timerRef.current = setInterval(() => {
        if ((isTimerExercise || isResting) && timeLeft > 0) {
        setTimeLeft(prev => {
            if (prev <= 1) {
            setTimerFinished(true);
            setIsExerciseActive(false);
              Vibration.vibrate([0, 500, 200, 500]);
            return 0;
          }
          return prev - 1;
        });
        }
      }, 1000);
    } else {
      // Pausa ou para o timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isExerciseActive, isPaused, isTimerExercise, isRepsExercise, isResting, timeLeft]);
  
  const startExercise = useCallback(() => {
    // Registrar tempo de início do treino se ainda não foi registrado
    if (workoutStartTime === null) {
      setWorkoutStartTime(Date.now());
    }
    
    setIsExerciseActive(true);
    setIsResting(false);
    setIsPaused(false);
    setTimerFinished(false);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
  }, [workoutStartTime]);
  
  const startRest = useCallback(() => {
    if (currentWorkoutExercise) {
      console.log('=== INICIANDO DESCANSO ===');
      console.log(`Tempo de descanso: ${currentWorkoutExercise.restTime} segundos`);
      console.log(`Exercício: ${currentWorkoutExercise.exercise.nome}`);
      console.log(`Série: ${currentSet} de ${currentWorkoutExercise.sets}`);
      console.log('Estado atual:', { 
        isResting, 
        isExerciseActive, 
        isPaused, 
        timeLeft: currentWorkoutExercise.restTime,
        currentExerciseIndex,
        currentSet
      });
      
      setTimeLeft(currentWorkoutExercise.restTime);
      setIsResting(true);
      setIsExerciseActive(true);
      setIsPaused(false);
      setTimerFinished(false);
      startTimeRef.current = Date.now();
    }
  }, [currentWorkoutExercise]);
  
  const pauseTimer = useCallback(() => {
    console.log('Pausando timer...');
    setIsPaused(true);
    // O timer será pausado pelo useEffect que monitora isPaused
  }, []);
  
  const resumeTimer = useCallback(() => {
    console.log('Retomando timer...');
    setIsPaused(false);
    startTimeRef.current = Date.now();
    // O timer será retomado pelo useEffect que monitora isPaused
  }, []);
  
  const finishWorkout = useCallback(() => {
    const totalDuration = workoutStartTime ? Math.round((Date.now() - workoutStartTime) / 1000 / 60) : 0;
    const totalCalories = (workout as any)?.totalCalories || exercises.reduce((total, ex) => {
      return total + (ex.exercise.calorias_estimadas * ex.sets);
    }, 0);
    
    navigation.navigate('WorkoutCompleted', {
      workout: {
        exercises,
        totalDuration: totalDuration,
        totalCalories: totalCalories,
        workoutName: (workout as any)?.workoutName,
        isCustomWorkout: (workout as any)?.isCustomWorkout,
        customWorkoutId: (workout as any)?.customWorkoutId,
      },
      workoutName: (workout as any)?.workoutName,
      isCustomWorkout: (workout as any)?.isCustomWorkout,
      skipSaveHistory: skipSaveHistory || false
    });
  }, [workoutStartTime, navigation, exercises.length, workout, skipSaveHistory, exercises]);
  
  const completeExercise = useCallback(() => {
    console.log('=== completeExercise chamado ===');
    console.log('Estado atual:', { 
      isResting, 
      isLastSet, 
      isLastExercise, 
      currentExerciseIndex, 
      currentSet,
      exerciseType: currentWorkoutExercise?.exercise.tipo
    });
    
    if (isResting) {
      console.log('Finalizando descanso...');
      // Terminar descanso e ir para próxima série ou exercício
      setIsResting(false);
      setIsExerciseActive(false);
      setTimerFinished(false);
      setElapsedTime(0);
      
      if (isLastSet) {
        console.log('Indo para o próximo exercício...');
        // Próximo exercício
        if (isLastExercise) {
          console.log('Último exercício - finalizando treino');
          // Não deve chegar aqui - último exercício/série vai para tela de conclusão
          finishWorkout();
        } else {
          console.log(`Próximo exercício: ${currentExerciseIndex + 1}`);
          setCurrentExerciseIndex(prev => prev + 1);
          setCurrentSet(1);
        }
      } else {
        // Próxima série do mesmo exercício
        console.log(`Próxima série: ${currentSet + 1}`);
        setCurrentSet(prev => prev + 1);
      }
    } else {
      console.log('Exercício concluído - verificando se deve ir para descanso...');
      
      // Marcar exercício como concluído
      setCompletedExercises(prev => prev + 1);
      
      // Verificar se é o último exercício da última série
      if (isLastSet && isLastExercise) {
        console.log('Última série do último exercício - finalizando sem descanso');
        // Última série do último exercício - NÃO vai para descanso, vai direto para conclusão
        finishWorkout();
      } else if (currentWorkoutExercise?.restTime === 0) {
        // Pular descanso se restTime é 0 (warmup/cooldown)
        console.log('Pulando descanso - restTime é 0');
        setIsResting(false);
        setIsExerciseActive(false);
        setTimerFinished(false);
        setElapsedTime(0);
      
      if (isLastSet) {
          // Próximo exercício
        if (isLastExercise) {
            finishWorkout();
          } else {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSet(1);
          }
        } else {
          // Próxima série do mesmo exercício
          setCurrentSet(prev => prev + 1);
        }
      } else {
        console.log('Iniciando descanso...');
        // Ir para descanso antes da próxima série ou exercício
        startRest();
      }
    }
  }, [isResting, isLastSet, isLastExercise, completedExercises, exercises.length, workout, navigation, startRest, workoutStartTime, currentWorkoutExercise, finishWorkout]);
  
  const skipExercise = useCallback(() => {
    // Pular para o próximo exercício sem contar como concluído
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsExerciseActive(false);
      setElapsedTime(0);
      setTimeLeft(exercises[currentExerciseIndex + 1]?.duration || 0);
      setTimerFinished(false);
    } else {
      // Último exercício, finalizar treino
      const totalDuration = workoutStartTime ? Math.round((Date.now() - workoutStartTime) / 1000 / 60) : 0;
      navigation.navigate('WorkoutCompleted', {
        workout: {
          exercises,
          totalDuration: totalDuration,
          totalCalories: exercises.reduce((total, ex) => {
            return total + (ex.exercise.calorias_estimadas * ex.sets);
          }, 0)
        },
        skipSaveHistory: skipSaveHistory || false
      });
    }
  }, [currentExerciseIndex, exercises, navigation, workoutStartTime, skipSaveHistory]);

  const skipRest = useCallback(() => {
    setTimeLeft(0);
    setTimerFinished(true);
    setIsResting(false);
  }, []);
  
  const goToNextSet = useCallback(() => {
    console.log('=== goToNextSet chamado ===');
    console.log('Estado:', { isLastSet, isLastExercise, currentSet, currentExerciseIndex });
    
    // Se for a última série do último exercício, finalizar treino
    if (isLastSet && isLastExercise) {
      console.log('Última série do último exercício - finalizando treino');
      finishWorkout();
    } else {
      // Caso contrário, iniciar descanso antes da próxima série/exercício
      console.log('Iniciando descanso antes da próxima série/exercício');
      setCompletedExercises(prev => prev + 1);
      startRest();
    }
  }, [isLastSet, isLastExercise, finishWorkout, startRest, currentSet, currentExerciseIndex]);
  
  const goToPreviousSet = useCallback(() => {
    if (currentSet > 1) {
      // Voltar para série anterior do mesmo exercício
      setCurrentSet(prev => prev - 1);
      setIsResting(false);
      setIsExerciseActive(false);
      setTimerFinished(false);
      setIsPaused(false);
      setElapsedTime(0);
    } else if (currentExerciseIndex > 0) {
      // Voltar para última série do exercício anterior
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSet(3); // Vai para a 3ª série do exercício anterior
      setIsResting(false);
      setIsExerciseActive(false);
      setTimerFinished(false);
      setIsPaused(false);
      setElapsedTime(0);
    }
  }, [currentSet, currentExerciseIndex]);
  
  // Auto-transição quando timer de exercício acabar
  useEffect(() => {
    if (timerFinished && !isResting && isTimerExercise) {
      console.log('Timer do exercício acabou - preparando para ir para o descanso');
      // Timer do exercício acabou - aguardar 1.5 segundos e ir automaticamente para descanso
      const autoTransitionTimer = setTimeout(() => {
        console.log('Indo para o descanso...');
        completeExercise();
      }, 1500);
      
      return () => {
        console.log('Limpando timer de transição do exercício');
        clearTimeout(autoTransitionTimer);
      };
    }
  }, [timerFinished, isResting, isTimerExercise, completeExercise]);
  
  // Auto-transição quando timer de descanso acabar
  useEffect(() => {
    if (timerFinished && isResting) {
      console.log('Timer de descanso acabou - preparando para próxima série/exercício');
      // Timer de descanso acabou - aguardar 1 segundo e ir automaticamente para próxima série/exercício
      const autoTransitionTimer = setTimeout(() => {
        console.log('Saindo do descanso...');
        completeExercise();
      }, 1000);
      
      return () => {
        console.log('Limpando timer de transição do descanso');
        clearTimeout(autoTransitionTimer);
      };
    }
  }, [timerFinished, isResting, completeExercise]);
  
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
              
              <View style={styles.pauseButtonSpacer} />
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
              <View style={styles.setInfoContainer}>
                <Text style={styles.setInfo}>
                  Série {currentSet} de {currentWorkoutExercise.sets}
                </Text>
                {isRepsExercise && (
                  <Text style={styles.repsInfo}>
                    {currentWorkoutExercise.reps} repetições
                </Text>
              )}
              </View>

              {/* Timer or Reps Display */}
              <View style={styles.timerContainer}>
                {isResting ? (
                  <View style={styles.restDisplay}>
                    <Ionicons name="pause-circle" size={60} color={Colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>Tempo</Text>
                    {timerFinished && (
                      <Text style={styles.timerFinishedMessage}>Tempo encerrado!</Text>
                    )}
                  </View>
                ) : isRepsExercise ? (
                  <View style={styles.repsDisplay}>
                    <Ionicons name="repeat" size={60} color={Colors.primary} />
                    <Text style={styles.repsText}>
                      {currentSet}/{currentWorkoutExercise.sets}
                    </Text>
                    <Text style={styles.repsCount}>
                      {currentWorkoutExercise.reps} repetições
                    </Text>
                    <View style={styles.elapsedTimeContainer}>
                      <Ionicons name="timer-outline" size={20} color={Colors.textSecondary} />
                      <Text style={styles.elapsedTimeText}>
                        Tempo: {formatTime(elapsedTime)}
                      </Text>
                    </View>
                  </View>
                ) : isTimerExercise ? (
                  <View style={styles.timerDisplay}>
                    <Ionicons name="time" size={60} color={Colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>Tempo</Text>
                    {timerFinished && (
                      <Text style={styles.timerFinishedMessage}>Tempo encerrado!</Text>
                    )}
                  </View>
                ) : null}
              </View>

              {/* Exercise Description */}
              <Text style={styles.exerciseDescription}>
                {currentWorkoutExercise.exercise.descricao_textual}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {/* Exercício com TIMER */}
                {isTimerExercise && !isResting && (
                  <View style={styles.buttonContainer}>
                    {!isExerciseActive ? (
                  <Button
                    title="Iniciar"
                        onPress={startExercise}
                        size="large"
                        style={styles.fullWidthButton}
                      />
                    ) : (
                      <Button
                        title="Concluído"
                        onPress={completeExercise}
                        size="large"
                        gradient
                        style={styles.fullWidthButton}
                      />
                    )}
                  </View>
                )}
                
                {/* Exercício com REPETIÇÕES */}
                {isRepsExercise && !isResting && (
                  <View style={styles.repsButtonContainer}>
                    {!isExerciseActive ? (
                      <Button
                        title="Iniciar Exercício"
                    onPress={startExercise}
                    size="large"
                    gradient
                        style={styles.fullWidthButton}
                  />
                ) : (
                      <View style={styles.repsActionButtons}>
                        <Button
                          title="Concluir Série"
                          onPress={completeExercise}
                          size="large"
                          gradient
                          style={styles.nextButton}
                        />
                        <Button
                          title="Pular Exercício"
                          onPress={skipExercise}
                          size="large"
                          variant="outline"
                          style={styles.skipExerciseButton}
                        />
                      </View>
                    )}
                  </View>
                )}
                
                {/* Durante DESCANSO */}
                {isResting && (
                  <View style={styles.restButtons}>
                    <Button
                      title={isPaused ? "Retomar" : "Pausar"}
                      onPress={isPaused ? resumeTimer : pauseTimer}
                      size="large"
                      gradient={!isPaused}
                      style={styles.pauseButton}
                    />
                    <TouchableOpacity 
                      style={styles.skipButton}
                      onPress={completeExercise}
                    >
                      <Ionicons name="play-skip-forward" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Botão Finalizar Treino (última série do último exercício) */}
                {isLastSetOfLastExercise && !isResting && isExerciseActive && (
                  <Button
                    title="Finalizar Treino"
                    onPress={finishWorkout}
                    size="large"
                    variant="secondary"
                    style={styles.finishButton}
                  />
                )}
                
                {/* Botões de Navegação entre Séries */}
                <View style={styles.navigationButtons}>
                  <TouchableOpacity 
                    style={[styles.navButton, (currentExerciseIndex === 0 && currentSet === 1) && styles.navButtonDisabled]}
                    onPress={goToPreviousSet}
                    disabled={currentExerciseIndex === 0 && currentSet === 1}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={(currentExerciseIndex === 0 && currentSet === 1) ? Colors.textSecondary : Colors.primary} 
                    />
                    <Text style={[styles.navButtonText, (currentExerciseIndex === 0 && currentSet === 1) && styles.navButtonTextDisabled]}>
                      Anterior
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={goToNextSet}
                  >
                    <Text style={styles.navButtonText}>
                      {isLastSetOfLastExercise ? 'Finalizar' : 'Próxima'}
                    </Text>
                    <Ionicons 
                      name={isLastSetOfLastExercise ? "checkmark-circle" : "chevron-forward"} 
                      size={20} 
                      color={Colors.primary} 
                  />
                  </TouchableOpacity>
                </View>
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
  setInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  repsInfo: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  repsCount: {
    ...Typography.h4,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  repsButtonContainer: {
    width: '100%',
    marginTop: Spacing.md,
  },
  repsActionButtons: {
    width: '100%',
    gap: Spacing.sm,
  },
  skipExerciseButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.error,
    borderWidth: 1,
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
  pauseButtonSpacer: {
    padding: Spacing.sm,
  },
  pauseButtonContainer: {
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
  elapsedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  elapsedTimeText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
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
  restButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  fullWidthButton: {
    width: '100%',
  },
  pauseButton: {
    flex: 1,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    alignSelf: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: Spacing.lg,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,107,53,0.1)',
    minWidth: 120,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.primary,
    fontWeight: '600',
    marginHorizontal: Spacing.xs,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  finishButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
});

export default WorkoutSessionScreen;
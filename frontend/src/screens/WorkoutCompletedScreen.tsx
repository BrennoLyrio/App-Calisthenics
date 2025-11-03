import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../components';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

const { width, height } = Dimensions.get('window');

interface WorkoutCompletedScreenProps {
  navigation: any;
  route: {
    params: {
      totalExercises?: number;
      completedExercises?: number;
      totalDuration: number;
      totalCalories: number;
      workout?: {
        exercises: any[];
        totalDuration: number;
        totalCalories: number;
      };
      skipSaveHistory?: boolean;
    };
  };
}

export const WorkoutCompletedScreen: React.FC<WorkoutCompletedScreenProps> = ({ 
  navigation, 
  route 
}) => {
  // Handle both navigation patterns
  const workoutData = route.params.workout;
  const totalExercises = route.params.totalExercises || workoutData?.exercises?.length || 0;
  const completedExercises = route.params.completedExercises || totalExercises;
  const totalDuration = route.params.totalDuration || workoutData?.totalDuration || 0;
  const totalCalories = route.params.totalCalories || workoutData?.totalCalories || 0;
  const skipSaveHistory = route.params.skipSaveHistory || false;
  
  const [isSaving, setIsSaving] = useState(false);

  // Calculate average difficulty from workout exercises
  const calculateAverageDifficulty = () => {
    if (!workoutData?.exercises || workoutData.exercises.length === 0) return 5; // Default medium difficulty
    
    const difficultyMap: { [key: string]: number } = {
      'iniciante': 3,
      'intermediario': 6,
      'avancado': 9
    };
    
    const sum = workoutData.exercises.reduce((total: number, ex: any) => {
      const difficulty = difficultyMap[ex.exercise?.nivel_dificuldade] || 5;
      return total + difficulty;
    }, 0);
    
    return Math.round(sum / workoutData.exercises.length);
  };

  const averageDifficulty = useMemo(() => calculateAverageDifficulty(), [workoutData]);

  // Save workout history automatically when screen loads (skip if skipSaveHistory is true)
  useEffect(() => {
    const saveWorkoutHistory = async () => {
      // Skip saving if flag is set
      if (skipSaveHistory) {
        console.log('⚠️ Skipping save - skipSaveHistory is true (warmup/cooldown session)');
        return;
      }

      try {
        setIsSaving(true);
        // Only save if we have valid data
        if (totalDuration > 0) {
          // Prepare workout metadata
          let workoutMetadata: any = {};
          
          if (workoutData?.exercises && workoutData.exercises.length > 0) {
            // Extract exercise names and categories
            const exercises = workoutData.exercises
              .filter((ex: any) => ex.exercise) // Filter out any null exercises
              .map((ex: any) => ({
                nome: ex.exercise?.nome || 'Exercício desconhecido',
                categoria: ex.exercise?.categoria || 'completo'
              }));
            
            // Determine workout focus (category)
            const categories = workoutData.exercises
              .filter((ex: any) => ex.exercise)
              .map((ex: any) => ex.exercise?.categoria)
              .filter((cat: string) => cat && cat !== 'aquecimento' && cat !== 'alongamento');
            
            const categoryCounts: { [key: string]: number } = {};
            categories.forEach((cat: string) => {
              if (cat) {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
              }
            });
            
            let workoutFocus = 'completo';
            const uniqueCategories = Object.keys(categoryCounts);
            if (uniqueCategories.length === 1) {
              workoutFocus = uniqueCategories[0];
            } else if (uniqueCategories.length > 1) {
              workoutFocus = 'completo';
            }
            
            workoutMetadata = {
              exercicios: exercises,
              foco: workoutFocus
            };
          }
          
          const notasValue = Object.keys(workoutMetadata).length > 0 ? JSON.stringify(workoutMetadata) : undefined;
          
          await apiService.saveWorkoutHistory({
            nome_treino: 'Treino Diário', // Nome do treino personalizado
            duracao: totalDuration * 60, // Convert minutes to seconds
            series_realizadas: completedExercises * 3, // Assuming 3 sets per exercise
            repeticoes_realizadas: completedExercises * 10, // Estimated reps
            calorias_queimadas: totalCalories,
            avaliacao_dificuldade: averageDifficulty, // Add difficulty rating
            satisfacao: 4, // Default satisfaction
            notas: notasValue
          });
        }
      } catch (error) {
        console.error('❌ Error saving workout history:', error);
        // Don't show error to user, just log it
      } finally {
        setIsSaving(false);
      }
    };

    saveWorkoutHistory();
  }, [totalDuration, averageDifficulty, skipSaveHistory]);

  // Mensagem motivacional fixa (calculada apenas uma vez)
  const motivationalMessage = useMemo(() => {
    const messages = [
      'Parabéns! Você foi incrível! 🎉',
      'Excelente trabalho! Continue assim! 💪',
      'Você superou seus limites hoje! 🔥',
      'Que treino fantástico! Estou orgulhoso! ⭐',
      'Incrível! Você está evoluindo! 🚀',
      'Fantástico! Sua dedicação é inspiradora! ❤️',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []); // Array vazio garante que só executa uma vez

  // Nível de conquista (calculado apenas uma vez)
  const achievement = useMemo(() => {
    const completionRate = (completedExercises / totalExercises) * 100;
    if (completionRate >= 100) return { level: 'Perfeito', color: Colors.success, icon: 'trophy' };
    if (completionRate >= 80) return { level: 'Excelente', color: Colors.primary, icon: 'medal' };
    if (completionRate >= 60) return { level: 'Muito Bom', color: Colors.warning, icon: 'star' };
    return { level: 'Bom Trabalho', color: Colors.info, icon: 'thumbs-up' };
  }, [completedExercises, totalExercises]);

  const handleGoHome = () => {
    // Resetar o stack de navegação para evitar voltar para a tela de conclusão
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleNewWorkout = () => {
    // Resetar o stack e ir para a tela de exercícios
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }, { name: 'Exercises' }],
    });
  };

  const handleShare = () => {
    // Implementar compartilhamento
    console.log('Share workout results');
  };

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
            {/* Celebration Animation Area */}
            <View style={styles.celebrationArea}>
              <View style={styles.achievementIcon}>
                <Ionicons 
                  name={achievement.icon as any} 
                  size={80} 
                  color={achievement.color} 
                />
              </View>
              
              <Text style={styles.achievementLevel}>{achievement.level}</Text>
              <Text style={styles.motivationalMessage}>{motivationalMessage}</Text>
            </View>

            {/* Workout Summary */}
            <Card style={styles.summaryCard} shadow>
              <Text style={styles.summaryTitle}>Resumo do Treino</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="fitness" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{completedExercises}</Text>
                  <Text style={styles.statLabel}>Exercícios</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="time" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{totalDuration}</Text>
                  <Text style={styles.statLabel}>Minutos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name="flame" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{totalCalories}</Text>
                  <Text style={styles.statLabel}>Calorias</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Exercícios Concluídos</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(completedExercises / totalExercises) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedExercises} séries de {totalExercises} exercícios
                </Text>
              </View>
            </Card>

            {/* Motivational Quote */}
            <Card style={styles.quoteCard} shadow>
              <Ionicons name="chatbox-ellipses" size={24} color={Colors.primary} />
              <Text style={styles.quoteText}>
                "A disciplina é a ponte entre metas e conquistas."
              </Text>
              <Text style={styles.quoteAuthor}>- Jim Rohn</Text>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Novo Treino"
                onPress={handleNewWorkout}
                size="large"
                gradient
                style={styles.newWorkoutButton}
              />
              
              <Button
                title="Compartilhar"
                onPress={handleShare}
                variant="secondary"
                size="large"
                style={styles.shareButton}
              />
              
              <Button
                title="Voltar ao Início"
                onPress={handleGoHome}
                variant="outline"
                size="large"
                style={styles.homeButton}
              />
            </View>
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
  celebrationArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  achievementIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  achievementLevel: {
    fontSize: Typography.h1.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.sm,
  },
  motivationalMessage: {
    fontSize: Typography.h3.fontSize,
    color: Colors.surface,
    textAlign: 'center',
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.h2.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    marginVertical: Spacing.md,
  },
  quoteAuthor: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'right',
    width: '100%',
  },
  actionButtons: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  newWorkoutButton: {
    marginBottom: Spacing.md,
  },
  shareButton: {
    marginBottom: Spacing.md,
  },
  homeButton: {
    marginBottom: Spacing.md,
  },
});

export default WorkoutCompletedScreen;
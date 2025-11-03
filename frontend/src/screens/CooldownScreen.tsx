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
import { ExerciseCard, Card, Button } from '../components';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width, height } = Dimensions.get('window');

interface CooldownScreenProps {
  navigation: any;
}

export const CooldownScreen: React.FC<CooldownScreenProps> = ({ navigation }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getExercises({ categoria: 'alongamento' });
      if (response.success && response.data) {
        setExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading cooldown exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const handleExercisePress = (exercise: Exercise) => {
    navigation.navigate('ExercisePreview', { 
      exercise,
      isFromWorkout: false 
    });
  };

  const handleStartCooldown = () => {
    if (exercises.length > 0) {
      // Prepare workout data for cooldown
      const workoutExercises = exercises.map((exercise) => ({
        exercise,
        duration: exercise.tempo_estimado || 30,
        reps: exercise.repeticoes_estimadas || 10,
        sets: 1,
        restTime: 0
      }));

      const totalDuration = workoutExercises.reduce((total, item) => {
        return total + (item.duration * item.sets);
      }, 0);

      const totalCalories = workoutExercises.reduce((total, item) => {
        return total + item.exercise.calorias_estimadas;
      }, 0);

      navigation.navigate('WorkoutSession', { 
        workout: {
          exercises: workoutExercises,
          totalDuration: Math.round(totalDuration / 60),
          totalCalories: Math.round(totalCalories)
        },
        skipSaveHistory: true
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando alongamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2127&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(34,193,195,0.4)', 'rgba(45,253,104,0.6)', 'rgba(0,0,0,0.8)']}
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
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.surface} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Alongamento</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <Card style={styles.infoCard}>
              <Ionicons name="leaf" size={32} color={Colors.primary} />
              <Text style={styles.infoTitle}>Relaxe e recupere!</Text>
              <Text style={styles.infoText}>
                Estes alongamentos ajudam a relaxar os músculos, melhorar a flexibilidade 
                e reduzir o risco de lesões. Realize após o treino ou em dias de descanso.
              </Text>
            </Card>

            <View style={styles.exercisesSection}>
              {exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onPress={() => handleExercisePress(exercise)}
                    showDifficulty={true}
                    showDuration={true}
                    showReps={true}
                    duration={exercise.tempo_estimado}
                    reps={exercise.repeticoes_estimadas}
                  />
                ))
              ) : (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyContent}>
                    <Ionicons name="leaf-outline" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyTitle}>Nenhum exercício de alongamento encontrado</Text>
                  </View>
                </Card>
              )}
            </View>

            {/* Start Cooldown Button */}
            {exercises.length > 0 && (
              <Button
                title="Iniciar Alongamento"
                onPress={handleStartCooldown}
                size="large"
                gradient
                style={styles.startButton}
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
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  exercisesSection: {
    marginBottom: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  startButton: {
    marginBottom: Spacing.xl,
  },
});

export default CooldownScreen;


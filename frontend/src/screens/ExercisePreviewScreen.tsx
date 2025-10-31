import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Button, Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width, height } = Dimensions.get('window');

interface ExercisePreviewScreenProps {
  navigation: any;
  route: {
    params: {
      exercise: Exercise;
      duration?: number;
      reps?: number;
      restTime?: number;
      isFromWorkout?: boolean;
    };
  };
}

export const ExercisePreviewScreen: React.FC<ExercisePreviewScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { exercise, duration, reps, restTime, isFromWorkout = false } = route.params;
  const [selectedDifficulty, setSelectedDifficulty] = useState(exercise.nivel_dificuldade);
  const [playing, setPlaying] = useState(false);

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'iniciante':
        return Colors.success;
      case 'intermediario':
        return Colors.warning;
      case 'avancado':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'iniciante':
        return 'Iniciante';
      case 'intermediario':
        return 'Intermediário';
      case 'avancado':
        return 'Avançado';
      default:
        return level;
    }
  };

  const handleNext = () => {
    if (isFromWorkout) {
      // Se veio do treino, volta para a execução
      navigation.goBack();
    } else {
      // Se veio da lista, volta para a lista de exercícios
      navigation.goBack();
    }
  };

  const handleStartExercise = () => {
    // Navegar para execução do exercício
    navigation.navigate('WorkoutSession', {
      exercise: exercise,
      duration: duration,
      reps: reps,
      restTime: restTime,
    });
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
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.surface} />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Preview do Exercício</Text>
              
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="heart" size={24} color={Colors.surface} />
                </TouchableOpacity>
                <Text style={styles.likesCount}>12.7k</Text>
              </View>
            </View>

            {/* Exercise Image/Video */}
            <View style={styles.exerciseImageContainer}>
              {exercise.video_url && getYouTubeVideoId(exercise.video_url) ? (
                <View style={styles.videoWrapper}>
                  <YoutubePlayer
                    height={250}
                    videoId={getYouTubeVideoId(exercise.video_url)!}
                    play={playing}
                    onChangeState={(state) => {
                      if (state === 'playing') {
                        setPlaying(true);
                      } else if (state === 'paused' || state === 'ended') {
                        setPlaying(false);
                      }
                    }}
                    webViewStyle={{ opacity: 0.99, borderRadius: BorderRadius.lg }}
                    webViewProps={{
                      androidLayerType: 'hardware',
                    }}
                  />
                </View>
              ) : exercise.imagem_url ? (
                <Image source={{ uri: exercise.imagem_url }} style={styles.exerciseImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="fitness" size={80} color={Colors.textSecondary} />
                  <Text style={styles.placeholderText}>Imagem não disponível</Text>
                </View>
              )}
            </View>

            {/* Exercise Info */}
            <Card style={styles.exerciseInfoCard} shadow>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{exercise.nome}</Text>
                <View style={styles.difficultyContainer}>
                  {['iniciante', 'intermediario', 'avancado'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.difficultyButton,
                        selectedDifficulty === level && styles.difficultyButtonSelected,
                        selectedDifficulty === level && { backgroundColor: getDifficultyColor(level) }
                      ]}
                      onPress={() => setSelectedDifficulty(level as any)}
                    >
                      <Text style={[
                        styles.difficultyButtonText,
                        selectedDifficulty === level && styles.difficultyButtonTextSelected
                      ]}>
                        {getDifficultyLabel(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exercise Details */}
              <View style={styles.exerciseDetails}>
                {duration && (
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={20} color={Colors.primary} />
                    <Text style={styles.detailText}>{duration} segundos</Text>
                  </View>
                )}
                {reps && (
                  <View style={styles.detailItem}>
                    <Ionicons name="repeat" size={20} color={Colors.primary} />
                    <Text style={styles.detailText}>{reps} repetições</Text>
                  </View>
                )}
                {restTime && (
                  <View style={styles.detailItem}>
                    <Ionicons name="pause" size={20} color={Colors.primary} />
                    <Text style={styles.detailText}>Descanso {restTime}s</Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text style={styles.description}>{exercise.descricao_textual}</Text>

              {/* Instructions */}
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Instruções:</Text>
                {exercise.instrucoes.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>

              {/* Tips */}
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>Dicas:</Text>
                {exercise.dicas.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="bulb" size={16} color={Colors.warning} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Muscles Worked */}
              <View style={styles.musclesSection}>
                <Text style={styles.musclesTitle}>Músculos Trabalhados:</Text>
                <View style={styles.musclesContainer}>
                  {exercise.musculos_trabalhados.map((muscle, index) => (
                    <View key={index} style={styles.muscleTag}>
                      <Text style={styles.muscleText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>

            {/* Personal Heatmap Button */}
            <TouchableOpacity style={styles.heatmapButton}>
              <View style={styles.heatmapContent}>
                <View style={styles.bodyFigures}>
                  <View style={styles.bodyFigure}>
                    <View style={styles.bodyOutline} />
                    <View style={[styles.muscleHighlight, { backgroundColor: Colors.primary }]} />
                  </View>
                  <View style={styles.bodyFigure}>
                    <View style={styles.bodyOutline} />
                  </View>
                </View>
                <Text style={styles.heatmapText}>Personal Heatmap</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {isFromWorkout ? (
                <Button
                  title="Próximo Exercício"
                  onPress={handleNext}
                  size="large"
                  gradient
                  style={styles.nextButton}
                />
              ) : (
                <Button
                  title="Iniciar Exercício"
                  onPress={handleStartExercise}
                  size="large"
                  gradient
                  style={styles.startButton}
                />
              )}
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: Spacing.sm,
  },
  likesCount: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.surface,
    marginLeft: Spacing.xs,
  },
  exerciseImageContainer: {
    height: 250,
    borderRadius: BorderRadius.lg,
    marginBottom: 0,
    overflow: 'hidden',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPlayer: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.light,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  exerciseInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Spacing.lg,
  },
  exerciseHeader: {
    marginBottom: Spacing.md,
  },
  exerciseTitle: {
    fontSize: Typography.h1.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  difficultyButtonSelected: {
    borderColor: 'transparent',
  },
  difficultyButtonText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  difficultyButtonTextSelected: {
    color: Colors.surface,
    fontWeight: '600',
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  detailText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  instructionsSection: {
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  instructionNumberText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  instructionText: {
    flex: 1,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.text,
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.text,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  musclesSection: {
    marginBottom: Spacing.lg,
  },
  musclesTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  muscleText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  heatmapButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  heatmapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bodyFigures: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bodyFigure: {
    width: 30,
    height: 40,
    marginRight: Spacing.sm,
    position: 'relative',
  },
  bodyOutline: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    borderRadius: 15,
  },
  muscleHighlight: {
    position: 'absolute',
    top: 10,
    left: 5,
    right: 5,
    height: 8,
    borderRadius: 4,
  },
  heatmapText: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  actionButtons: {
    marginBottom: Spacing.xl,
  },
  nextButton: {
    marginBottom: Spacing.md,
  },
  startButton: {
    marginBottom: Spacing.md,
  },
});

export default ExercisePreviewScreen;
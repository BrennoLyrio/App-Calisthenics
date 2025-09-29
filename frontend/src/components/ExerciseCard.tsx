import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width } = Dimensions.get('window');

interface ExerciseCardProps {
  exercise: Exercise;
  onPress: () => void;
  showDifficulty?: boolean;
  showDuration?: boolean;
  showReps?: boolean;
  duration?: number;
  reps?: number;
  restTime?: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  showDifficulty = true,
  showDuration = false,
  showReps = false,
  duration,
  reps,
  restTime,
}) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'superiores':
        return 'fitness';
      case 'inferiores':
        return 'walk';
      case 'core':
        return 'body';
      case 'completo':
        return 'flash';
      default:
        return 'fitness';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {exercise.imagem_url ? (
          <Image source={{ uri: exercise.imagem_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons 
              name={getCategoryIcon(exercise.categoria)} 
              size={40} 
              color={Colors.textSecondary} 
            />
          </View>
        )}
        
        {showDifficulty && (
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.nivel_dificuldade) }]}>
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(exercise.nivel_dificuldade)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {exercise.nome}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {exercise.descricao_textual}
        </Text>

        <View style={styles.musclesContainer}>
          {exercise.musculos_trabalhados.slice(0, 3).map((muscle, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleText}>{muscle}</Text>
            </View>
          ))}
          {exercise.musculos_trabalhados.length > 3 && (
            <View style={styles.muscleTag}>
              <Text style={styles.muscleText}>+{exercise.musculos_trabalhados.length - 3}</Text>
            </View>
          )}
        </View>

        {(showDuration || showReps) && (
          <View style={styles.exerciseInfo}>
            {showDuration && duration && (
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{duration}s</Text>
              </View>
            )}
            {showReps && reps && (
              <View style={styles.infoItem}>
                <Ionicons name="repeat" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{reps} reps</Text>
              </View>
            )}
            {restTime && (
              <View style={styles.infoItem}>
                <Ionicons name="pause" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>Descanso {restTime}s</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.caloriesContainer}>
            <Ionicons name="flame" size={14} color={Colors.primary} />
            <Text style={styles.caloriesText}>{exercise.calorias_estimadas} cal</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.surface,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
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
  exerciseInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  arrowContainer: {
    padding: Spacing.xs,
  },
});

export default ExerciseCard;

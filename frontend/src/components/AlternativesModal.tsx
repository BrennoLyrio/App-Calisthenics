import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ExerciseCard } from './ExerciseCard';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';

const { width } = Dimensions.get('window');

interface AlternativesModalProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onSelectAlternative: (exercise: Exercise) => void;
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({
  visible,
  exercise,
  onClose,
  onSelectAlternative,
}) => {
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && exercise) {
      loadAlternatives();
    } else {
      setAlternatives([]);
    }
  }, [visible, exercise]);

  const loadAlternatives = async () => {
    if (!exercise) return;

    try {
      setIsLoading(true);
      const response = await apiService.getExerciseAlternatives(exercise.id, 3);
      
      if (response.success && response.data) {
        setAlternatives(response.data);
      }
    } catch (error) {
      console.error('Error loading alternatives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (altExercise: Exercise) => {
    onSelectAlternative(altExercise);
    onClose();
  };

  if (!exercise) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.backgroundGradient}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercícios Alternativos</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Exercise Info */}
        <View style={styles.currentExerciseContainer}>
          <Text style={styles.currentExerciseLabel}>Exercício atual:</Text>
          <Text style={styles.currentExerciseName}>{exercise.nome}</Text>
        </View>

        {/* Alternatives List */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Buscando alternativas...</Text>
            </View>
          ) : alternatives.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>
                Nenhuma alternativa encontrada
              </Text>
              <Text style={styles.emptySubtext}>
                Experimente buscar na biblioteca de exercícios
              </Text>
            </View>
          ) : (
            <View style={styles.alternativesList}>
              <Text style={styles.alternativesTitle}>
                Exercícios com função similar ({alternatives.length})
              </Text>
              {alternatives.map((altExercise) => (
                <View key={altExercise.id} style={styles.alternativeCard}>
                  <ExerciseCard
                    exercise={altExercise}
                    onPress={() => handleSelect(altExercise)}
                    showDifficulty={true}
                    showDuration={true}
                    showReps={true}
                  />
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelect(altExercise)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="swap-horizontal" size={20} color={Colors.surface} />
                    <Text style={styles.selectButtonText}>Usar este</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  placeholder: {
    width: 40,
  },
  currentExerciseContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  currentExerciseLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  currentExerciseName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.surface,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  alternativesList: {
    gap: Spacing.md,
  },
  alternativesTitle: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.surface,
    marginBottom: Spacing.sm,
  },
  alternativeCard: {
    marginBottom: Spacing.md,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  selectButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.surface,
  },
});


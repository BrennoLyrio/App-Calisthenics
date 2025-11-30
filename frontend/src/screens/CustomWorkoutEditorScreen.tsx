import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise, CustomWorkoutExercise, CreateCustomWorkoutRequest, UpdateCustomWorkoutRequest } from '../types';

const { width } = Dimensions.get('window');

interface CustomWorkoutEditorScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutId?: number;
      selectedExercise?: Exercise;
      _timestamp?: number;
    };
  };
}

interface WorkoutExercise {
  id_exercicio: number;
  exercise?: Exercise;
  series: number;
  repeticoes?: number;
  tempo_execucao?: number;
  descanso: number;
  ordem: number;
  observacoes?: string;
}

export const CustomWorkoutEditorScreen: React.FC<CustomWorkoutEditorScreenProps> = ({ navigation, route }) => {
  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const lastProcessedTimestampRef = useRef<number | null>(null);

  // Load workout only once when editing
  useEffect(() => {
    if (isEditing && workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  // Handle exercise selection - CORRIGIDO COM TIMESTAMP
  useEffect(() => {
    const selectedExerciseParam = route.params?.selectedExercise as Exercise | undefined;
    const timestamp = route.params?._timestamp as number | undefined;
    
    if (selectedExerciseParam && timestamp) {
      // Verifica se já processou este timestamp específico
      if (lastProcessedTimestampRef.current === timestamp) {
        console.log('Timestamp já processado, ignorando:', timestamp);
        return;
      }
      
      // Marca este timestamp como processado
      lastProcessedTimestampRef.current = timestamp;
      
      console.log('Processando exercício:', selectedExerciseParam.nome, 'Timestamp:', timestamp);
      
      // Add exercise to list
      setExercises((prevExercises) => {
        // Check if exercise already exists in list
        const exists = prevExercises.some(ex => ex.id_exercicio === selectedExerciseParam.id);
        if (exists) {
          console.log('Exercício já existe na lista, ignorando');
          return prevExercises;
        }
        
        // Add new exercise
        const newExercise: WorkoutExercise = {
          id_exercicio: selectedExerciseParam.id,
          exercise: selectedExerciseParam,
          series: 3,
          repeticoes: selectedExerciseParam.repeticoes_estimadas || 10,
          tempo_execucao: selectedExerciseParam.tempo_estimado,
          descanso: 60,
          ordem: prevExercises.length + 1,
        };
        
        console.log('Exercício adicionado com sucesso! Total:', prevExercises.length + 1);
        return [...prevExercises, newExercise];
      });
      
      // Clear params after processing (preserve workoutId)
      setTimeout(() => {
        const preservedParams: any = {};
        if (route.params?.workoutId) {
          preservedParams.workoutId = route.params.workoutId;
        }
        navigation.setParams(preservedParams);
      }, 100);
    }
  }, [route.params?.selectedExercise, route.params?._timestamp]);

  const loadWorkout = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCustomWorkoutById(workoutId!);
      
      if (response.success && response.data) {
        const workout = response.data;
        setNome(workout.nome);
        setDescricao(workout.descricao || '');
        
        // Convert CustomWorkoutExercise[] to WorkoutExercise[]
        const workoutExercises: WorkoutExercise[] = (workout.exercises || []).map((ex: CustomWorkoutExercise, index: number) => ({
          id_exercicio: ex.id_exercicio,
          exercise: ex.exercise,
          series: ex.series,
          repeticoes: ex.repeticoes,
          tempo_execucao: ex.tempo_execucao,
          descanso: ex.descanso || 60,
          ordem: ex.ordem || index + 1,
          observacoes: ex.observacoes,
        }));
        
        setExercises(workoutExercises);
      }
    } catch (error: any) {
      console.error('Error loading workout:', error);
      Alert.alert('Erro', 'Não foi possível carregar a rotina.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = () => {
    // Navigate to LibraryExercisesScreen to select an exercise
    navigation.navigate('LibraryExercises', {
      selectMode: true,
      _timestamp: Date.now(), // Passa timestamp para forçar atualização
    });
  };

  const handleRemoveExercise = (index: number) => {
    Alert.alert(
      'Remover Exercício',
      'Tem certeza que deseja remover este exercício?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setExercises((prevExercises) => {
              const newExercises = prevExercises.filter((_, i) => i !== index);
              // Reorder exercises
              return newExercises.map((ex, i) => ({
                ...ex,
                ordem: i + 1,
              }));
            });
          },
        },
      ]
    );
  };

  const handleEditExercise = (exercise: WorkoutExercise, index: number) => {
    setSelectedExercise({ ...exercise });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    if (!selectedExercise) return;

    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const index = newExercises.findIndex(
        (ex) => ex.id_exercicio === selectedExercise.id_exercicio && ex.ordem === selectedExercise.ordem
      );
      
      if (index >= 0) {
        newExercises[index] = { ...selectedExercise };
      }
      
      return newExercises;
    });

    setShowExerciseModal(false);
    setSelectedExercise(null);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome da rotina é obrigatório.');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício à rotina.');
      return;
    }

    try {
      setIsSaving(true);

      // Ensure all exercises have required fields
      const exerciciosData = exercises.map((ex, index) => ({
        id_exercicio: ex.id_exercicio,
        series: ex.series || 3,
        repeticoes: ex.repeticoes,
        tempo_execucao: ex.tempo_execucao,
        descanso: ex.descanso || 60,
        ordem: index + 1, // Ensure order is sequential
        observacoes: ex.observacoes,
      }));

      if (isEditing) {
        const updateData: UpdateCustomWorkoutRequest = {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          exercicios: exerciciosData,
        };
        
        const response = await apiService.updateCustomWorkout(workoutId!, updateData);
        if (response.success) {
          Alert.alert('Sucesso', 'Rotina atualizada com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } else {
          throw new Error(response.message || 'Erro ao atualizar rotina');
        }
      } else {
        const createData: CreateCustomWorkoutRequest = {
          nome: nome.trim(),
          descricao: descricao.trim() || undefined,
          exercicios: exerciciosData,
        };
        
        const response = await apiService.createCustomWorkout(createData);
        if (response.success) {
          Alert.alert('Sucesso', 'Rotina criada com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } else {
          throw new Error(response.message || 'Erro ao criar rotina');
        }
      }
    } catch (error: any) {
      console.error('Error saving workout:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Não foi possível salvar a rotina.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={['#FF6B35', '#FF8C42', '#FFA726']} style={styles.backgroundGradient} />
        <SafeAreaView style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.surface} />
            <Text style={styles.loadingText}>Carregando rotina...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#FF6B35', '#FF8C42', '#FFA726']} style={styles.backgroundGradient} />
      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Editar Rotina' : 'Nova Rotina'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <Card style={styles.card}>
            <Text style={styles.label}>Nome da Rotina *</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Treino de Força Superior"
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva sua rotina..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Exercises List */}
          <Card style={styles.card}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.label}>Exercícios ({exercises.length})</Text>
              <Button
                title="Adicionar"
                onPress={handleAddExercise}
                style={styles.addButton}
                size="small"
                gradient
              />
            </View>

            {exercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="barbell-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
                <Text style={styles.emptySubtext}>Toque em "Adicionar" para incluir exercícios</Text>
              </View>
            ) : (
              exercises.map((exercise, index) => (
                <Card key={`${exercise.id_exercicio}-${index}`} style={styles.exerciseCard} shadow>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.exercise?.nome || 'Exercício'}</Text>
                      <Text style={styles.exerciseDetails}>
                        {exercise.series} séries •{' '}
                        {exercise.repeticoes ? `${exercise.repeticoes} reps` : ''}
                        {exercise.tempo_execucao ? `${exercise.tempo_execucao}s` : ''} • Descanso: {exercise.descanso}s
                      </Text>
                    </View>
                    <View style={styles.exerciseActions}>
                      <TouchableOpacity
                        onPress={() => handleEditExercise(exercise, index)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="create-outline" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(index)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </Card>

          {/* Save Button */}
          <Button
            title={isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Rotina'}
            onPress={handleSave}
            style={styles.saveButton}
            disabled={isSaving}
            gradient
          />
        </ScrollView>

        {/* Exercise Edit Modal */}
        <Modal
          visible={showExerciseModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowExerciseModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Exercício</Text>
                <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {selectedExercise && (
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.modalLabel}>Séries</Text>
                  <View style={styles.numberInputRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedExercise.series > 1) {
                          setSelectedExercise({ ...selectedExercise, series: selectedExercise.series - 1 });
                        }
                      }}
                      style={styles.numberButton}
                    >
                      <Ionicons name="remove" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.numberValue}>{selectedExercise.series}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedExercise({ ...selectedExercise, series: selectedExercise.series + 1 });
                      }}
                      style={styles.numberButton}
                    >
                      <Ionicons name="add" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {selectedExercise.exercise?.tipo === 'reps' && (
                    <>
                      <Text style={styles.modalLabel}>Repetições</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={selectedExercise.repeticoes?.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          setSelectedExercise({ ...selectedExercise, repeticoes: value });
                        }}
                        keyboardType="numeric"
                        placeholder="10"
                      />
                    </>
                  )}

                  {selectedExercise.exercise?.tipo === 'timer' && (
                    <>
                      <Text style={styles.modalLabel}>Tempo (segundos)</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={selectedExercise.tempo_execucao?.toString()}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          setSelectedExercise({ ...selectedExercise, tempo_execucao: value });
                        }}
                        keyboardType="numeric"
                        placeholder="60"
                      />
                    </>
                  )}

                  <Text style={styles.modalLabel}>Descanso (segundos)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={selectedExercise.descanso?.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 60;
                      setSelectedExercise({ ...selectedExercise, descanso: value });
                    }}
                    keyboardType="numeric"
                    placeholder="60"
                  />
                </ScrollView>
              )}

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowExerciseModal(false)}
                  style={styles.modalButton}
                  size="small"
                />
                <Button
                  title="Salvar"
                  onPress={handleSaveExercise}
                  style={styles.modalButton}
                  size="small"
                  gradient
                />
              </View>
            </Card>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    color: Colors.surface,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.md,
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
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  label: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  exerciseDetails: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  saveButton: {
    marginBottom: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.h3.fontSize,
    color: Colors.text,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalLabel: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.textSecondary,
  },
  numberValue: {
    fontSize: Typography.h3.fontSize,
    color: Colors.text,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseCard, Card } from '../components';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';
import { Exercise } from '../types';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface LibraryExercisesScreenProps {
  navigation: any;
  route: {
    params?: {
      selectMode?: boolean;
      onExerciseSelect?: (exercise: Exercise) => void;
    };
  };
}

type FilterCategory = 'superiores' | 'inferiores' | 'core' | 'completo' | 'all';
type FilterDifficulty = 'iniciante' | 'intermediario' | 'avancado' | 'all';

export const LibraryExercisesScreen: React.FC<LibraryExercisesScreenProps> = ({ navigation, route }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterDifficulty>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os exercícios sem filtros
      const response = await apiService.getExercises({ limit: 100 });
      
      if (response.success && response.data) {
        setExercises(response.data);
        setFilteredExercises(response.data);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...exercises];

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => ex.categoria === selectedCategory);
    }

    // Filtro de dificuldade
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(ex => ex.nivel_dificuldade === selectedDifficulty);
    }

    // Filtro de busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(ex => 
        ex.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.descricao_textual.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  }, [exercises, selectedCategory, selectedDifficulty, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  };

  const handleExercisePress = (exercise: Exercise) => {
    const selectMode = route.params?.selectMode;
    
    if (selectMode) {
      const timestamp = Date.now();
      console.log('🔙 Voltando com exercício:', exercise.id, exercise.nome, 'timestamp:', timestamp);
      
      // SOLUÇÃO DEFINITIVA: Usar dispatch com setParams para atualizar a tela anterior
      const state = navigation.getState();
      const routes = state.routes;
      
      // Encontrar o index da tela CustomWorkoutEditor
      const customWorkoutEditorIndex = routes.findIndex((r: any) => r.name === 'CustomWorkoutEditor');
      
      if (customWorkoutEditorIndex !== -1) {
        const editorRoute = routes[customWorkoutEditorIndex];
        
        // Usar CommonActions.setParams para atualizar params da tela específica
        navigation.dispatch({
          ...CommonActions.setParams({
            selectedExercise: exercise,
            _timestamp: timestamp,
          }),
          source: editorRoute.key,
        });
        
        console.log('✅ Params definidos, voltando...');
      }
      
      // Voltar para a tela anterior
      navigation.goBack();
    } else {
      // Normal mode: navigate to preview
      navigation.navigate('ExercisePreview', { 
        exercise,
        isFromWorkout: false 
      });
    }
  };

  const getCategoryLabel = (category: FilterCategory) => {
    switch (category) {
      case 'superiores':
        return 'Superiores';
      case 'inferiores':
        return 'Inferiores';
      case 'core':
        return 'Core';
      case 'completo':
        return 'Completo';
      case 'all':
        return 'Todos';
      default:
        return category;
    }
  };

  const getDifficultyLabel = (difficulty: FilterDifficulty) => {
    switch (difficulty) {
      case 'iniciante':
        return 'Iniciante';
      case 'intermediario':
        return 'Intermediário';
      case 'avancado':
        return 'Avançado';
      case 'all':
        return 'Todos';
      default:
        return difficulty;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando exercícios...</Text>
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
              
              <Text style={styles.headerTitle}>Biblioteca de Exercícios</Text>
              
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar exercícios..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filters */}
            <View style={styles.filtersSection}>
              <Text style={styles.filtersTitle}>Categoria</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScroll}
              >
                {['all', 'superiores', 'inferiores', 'core', 'completo'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedCategory(category as FilterCategory)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedCategory === category && styles.filterChipTextActive
                    ]}>
                      {getCategoryLabel(category as FilterCategory)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Difficulty Filters */}
            <View style={styles.filtersSection}>
              <Text style={styles.filtersTitle}>Dificuldade</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScroll}
              >
                {['all', 'iniciante', 'intermediario', 'avancado'].map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.filterChip,
                      selectedDifficulty === difficulty && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedDifficulty(difficulty as FilterDifficulty)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedDifficulty === difficulty && styles.filterChipTextActive
                    ]}>
                      {getDifficultyLabel(difficulty as FilterDifficulty)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
              </Text>
            </View>

            {/* Exercises List */}
            <View style={styles.exercisesSection}>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onPress={() => handleExercisePress(exercise)}
                    showDifficulty={true}
                  />
                ))
              ) : (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyContent}>
                    <Ionicons name="search" size={48} color={Colors.textSecondary} />
                    <Text style={styles.emptyTitle}>Nenhum exercício encontrado</Text>
                    <Text style={styles.emptyDescription}>
                      Tente ajustar os filtros ou a busca
                    </Text>
                  </View>
                </Card>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    color: Colors.text,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filtersSection: {
    marginBottom: Spacing.md,
  },
  filtersTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.surface,
    marginBottom: Spacing.sm,
  },
  filtersScroll: {
    paddingRight: Spacing.lg,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  filterChipText: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.surface,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsText: {
    fontSize: Typography.body.fontSize,
    color: Colors.surface,
    opacity: 0.9,
  },
  exercisesSection: {
    marginBottom: Spacing.xl,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: Spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default LibraryExercisesScreen;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

const { width } = Dimensions.get('window');

interface EducationScreenProps {
  navigation: any;
}

type ContentCategory = 'articles' | 'nutrition' | 'progression' | 'recovery';

interface ContentCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: ContentCategory;
  color: string;
  gradient: string[];
}

const contentCategories: ContentCard[] = [
  {
    id: 'articles',
    title: 'Artigos sobre Calistenia',
    description: 'Conteúdo educativo completo sobre técnicas, movimentos e fundamentos',
    icon: 'document-text',
    category: 'articles',
    color: Colors.primary,
    gradient: ['#FF6B35', '#FF8C42'],
  },
  {
    id: 'nutrition',
    title: 'Dicas de Nutrição',
    description: 'Orientações sobre alimentação para maximizar seus resultados',
    icon: 'nutrition',
    category: 'nutrition',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
  },
  {
    id: 'progression',
    title: 'Guias de Progressão',
    description: 'Como evoluir de iniciante a avançado de forma segura',
    icon: 'trending-up',
    category: 'progression',
    color: '#2196F3',
    gradient: ['#2196F3', '#42A5F5'],
  },
  {
    id: 'recovery',
    title: 'Recuperação e Descanso',
    description: 'Importância do descanso e dicas para uma recuperação eficiente',
    icon: 'bed-outline',
    category: 'recovery',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#BA68C8'],
  },
];

export const EducationScreen: React.FC<EducationScreenProps> = ({ navigation }) => {
  const handleContentPress = (category: ContentCategory) => {
    // Navigate to parent stack navigator
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('ArticleList', { category });
    } else {
      navigation.navigate('ArticleList', { category });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="library" size={32} color={Colors.surface} />
              <Text style={styles.headerTitle}>Conteúdo Educativo</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Aprenda, evolua e maximize seus resultados
            </Text>
          </View>

          {/* Info Card */}
          <Card style={styles.infoCard} shadow>
            <View style={styles.infoContent}>
              <Ionicons name="information-circle" size={24} color={Colors.primary} />
              <Text style={styles.infoText}>
                Explore nosso conteúdo educativo completo sobre calistenia, nutrição, 
                progressão e recuperação para alcançar seus objetivos.
              </Text>
            </View>
          </Card>

          {/* Content Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Categorias</Text>
            
            {contentCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleContentPress(category.category)}
                activeOpacity={0.8}
                style={styles.categoryCard}
              >
                <LinearGradient
                  colors={category.gradient}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryIconContainer}>
                      <Ionicons 
                        name={category.icon as any} 
                        size={32} 
                        color={Colors.surface} 
                      />
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categoryDescription}>{category.description}</Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={Colors.surface + 'CC'} 
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h1,
    fontWeight: 'bold',
    color: Colors.surface,
    flex: 1,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.surface + 'CC',
    marginLeft: 48,
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.md,
  },
  categoryCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: Spacing.lg,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    ...Typography.caption,
    color: Colors.surface + 'CC',
    lineHeight: 18,
  },
});


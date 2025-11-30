import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

const { width } = Dimensions.get('window');

interface ArticleListScreenProps {
  navigation: any;
  route: {
    params: {
      category: 'articles' | 'nutrition' | 'progression' | 'recovery';
    };
  };
}

interface Article {
  id: string;
  title: string;
  description: string;
  readTime: number;
  category: string;
  content: string;
}

// Mock data - em produção viria do backend
const articlesData: Record<string, Article[]> = {
  articles: [
    {
      id: 'a1',
      title: 'Fundamentos da Calistenia',
      description: 'Aprenda os princípios básicos e a filosofia por trás do treinamento com peso corporal',
      readTime: 8,
      category: 'articles',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'a2',
      title: 'Técnicas de Execução Correta',
      description: 'Como garantir uma execução perfeita e evitar lesões durante os exercícios',
      readTime: 10,
      category: 'articles',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'a3',
      title: 'Princípios de Força e Resistência',
      description: 'Entenda a diferença entre força e resistência e como treinar cada uma',
      readTime: 7,
      category: 'articles',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'a4',
      title: 'Movimentos Básicos para Iniciantes',
      description: 'Os primeiros passos no mundo da calistenia: flexões, agachamentos e pranchas',
      readTime: 9,
      category: 'articles',
      content: 'Conteúdo completo do artigo...',
    },
  ],
  nutrition: [
    {
      id: 'n1',
      title: 'Alimentação para Calistenia',
      description: 'Descubra os melhores alimentos e estratégias nutricionais para calistenia',
      readTime: 12,
      category: 'nutrition',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'n2',
      title: 'Pré e Pós-Treino: O Que Comer',
      description: 'Guias completos sobre nutrição antes e depois dos treinos',
      readTime: 9,
      category: 'nutrition',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'n3',
      title: 'Hidratação e Performance',
      description: 'A importância da hidratação adequada para o desempenho',
      readTime: 6,
      category: 'nutrition',
      content: 'Conteúdo completo do artigo...',
    },
  ],
  progression: [
    {
      id: 'p1',
      title: 'Do Iniciante ao Intermediário',
      description: 'Guia passo a passo para evoluir seu nível de treino',
      readTime: 15,
      category: 'progression',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'p2',
      title: 'Progressões de Movimentos Avançados',
      description: 'Como trabalhar progressivamente até movimentos como handstand e muscle-up',
      readTime: 18,
      category: 'progression',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'p3',
      title: 'Periodização para Calistenia',
      description: 'Organize seu treino de forma inteligente para melhores resultados',
      readTime: 14,
      category: 'progression',
      content: 'Conteúdo completo do artigo...',
    },
  ],
  recovery: [
    {
      id: 'r1',
      title: 'Importância do Descanso',
      description: 'Por que o descanso é essencial para o crescimento muscular e prevenção de lesões',
      readTime: 10,
      category: 'recovery',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'r2',
      title: 'Alongamento e Mobilidade',
      description: 'Rotinas de alongamento e exercícios de mobilidade para melhor recuperação',
      readTime: 12,
      category: 'recovery',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'r3',
      title: 'Sono e Recuperação',
      description: 'Como o sono afeta sua performance e estratégias para melhorar a qualidade do sono',
      readTime: 8,
      category: 'recovery',
      content: 'Conteúdo completo do artigo...',
    },
    {
      id: 'r4',
      title: 'Quando Descansar: Sinais do Corpo',
      description: 'Aprenda a reconhecer quando seu corpo precisa de um dia de descanso',
      readTime: 7,
      category: 'recovery',
      content: 'Conteúdo completo do artigo...',
    },
  ],
};

const categoryInfo = {
  articles: {
    title: 'Artigos sobre Calistenia',
    icon: 'document-text',
    gradient: ['#FF6B35', '#FF8C42'],
  },
  nutrition: {
    title: 'Dicas de Nutrição',
    icon: 'nutrition',
    gradient: ['#4CAF50', '#66BB6A'],
  },
  progression: {
    title: 'Guias de Progressão',
    icon: 'trending-up',
    gradient: ['#2196F3', '#42A5F5'],
  },
  recovery: {
    title: 'Recuperação e Descanso',
    icon: 'bed-outline',
    gradient: ['#9C27B0', '#BA68C8'],
  },
};

export const ArticleListScreen: React.FC<ArticleListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params;
  const [articles] = useState<Article[]>(articlesData[category] || []);
  const info = categoryInfo[category];

  const renderArticleCard = (article: Article) => (
    <TouchableOpacity
      key={article.id}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id, category })}
      activeOpacity={0.7}
    >
      <Card style={styles.articleCard} shadow>
        <View style={styles.articleHeader}>
          <View style={styles.readTimeBadge}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.readTimeText}>{article.readTime} min</Text>
          </View>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.articleDescription} numberOfLines={3}>
          {article.description}
        </Text>
        <View style={styles.articleFooter}>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>Ler artigo</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={info.gradient}
        style={styles.backgroundGradient}
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
            <View style={styles.headerContent}>
              <Ionicons name={info.icon as any} size={28} color={Colors.surface} />
              <Text style={styles.headerTitle}>{info.title}</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Articles List */}
          {articles.length === 0 ? (
            <Card style={styles.emptyCard} shadow>
              <Ionicons name="document-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum artigo encontrado</Text>
              <Text style={styles.emptyDescription}>
                Novos artigos serão adicionados em breve.
              </Text>
            </Card>
          ) : (
            <View style={styles.articlesList}>
              {articles.map(renderArticleCard)}
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  headerRight: {
    width: 40,
  },
  articlesList: {
    paddingHorizontal: Spacing.lg,
  },
  articleCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light,
  },
  readTimeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  articleTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  articleDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  readMoreText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';
import { CommunityPost } from '../../types';

interface HelpTabProps {
  navigation: any;
}

export const HelpTab: React.FC<HelpTabProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getPosts('help', undefined, 1, 20);
      
      if (response.success && response.data) {
        setPosts(response.data.posts);
      }
    } catch (error: any) {
      console.error('Error loading help posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPosts();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    navigation.navigate('VideoRecorder', {
      tipo: 'help',
    });
  };

  const handlePostPress = (post: CommunityPost) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.createButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="videocam" size={24} color={Colors.surface} />
          <Text style={styles.createButtonText}>Fazer Pergunta</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Posts List */}
      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Dúvidas da Comunidade</Text>
        {posts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="help-circle-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma dúvida ainda</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a fazer uma pergunta!</Text>
          </Card>
        ) : (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() => handlePostPress(post)}
              activeOpacity={0.7}
            >
              <Card style={styles.postCard} shadow>
                <View style={styles.postHeader}>
                  {post.user?.foto_perfil ? (
                    <Image
                      source={{ uri: post.user.foto_perfil }}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View style={styles.userAvatarPlaceholder}>
                      <Ionicons name="person" size={20} color={Colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{post.user?.nome || 'Usuário'}</Text>
                    <Text style={styles.postDate}>
                      {new Date(post.data_postagem).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
                
                {post.titulo && (
                  <Text style={styles.postTitle} numberOfLines={2}>
                    {post.titulo}
                  </Text>
                )}
                
                {post.duvida && (
                  <Text style={styles.postDuvida} numberOfLines={3}>
                    {post.duvida}
                  </Text>
                )}

                <View style={styles.postFooter}>
                  <View style={styles.postStats}>
                    <Ionicons
                      name={post.userLiked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={post.userLiked ? Colors.error : Colors.textSecondary}
                    />
                    <Text style={styles.postStatText}>{post.curtidas_count}</Text>
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
                    <Text style={styles.postStatText}>{post.comentarios_count}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  createButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  postsContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '600',
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  postCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  postDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  postTitle: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  postDuvida: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  postStatText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
});


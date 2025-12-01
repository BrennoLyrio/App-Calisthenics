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
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius, API_BASE_URL } from '../../constants';
import { CommunityPost, WeeklyChallenge } from '../../types';

interface RankTabProps {
  navigation: any;
}

export const RankTab: React.FC<RankTabProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      try {
        const challengeData = await apiService.getCurrentChallenge();
        if (challengeData) {
          setChallenge(challengeData);
        } else {
          setChallenge(null);
        }
      } catch (error: any) {
        console.error('Error loading challenge:', error);
        setChallenge(null);
      }

      try {
        const postsResponse = await apiService.getPosts('rank', undefined, 1, 20);
        if (postsResponse.success && postsResponse.data) {
          setPosts(postsResponse.data.posts || []);
        } else {
          setPosts([]);
        }
      } catch (error: any) {
        console.error('Error loading posts:', error);
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Error loading rank data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    navigation.navigate('VideoRecorder', {
      tipo: 'rank',
      id_desafio_semanal: challenge?.id,
    });
  };

  const handlePostPress = (post: CommunityPost) => {
    navigation.navigate('PostDetail', { postId: post.id });
  };

  const getVideoUrl = (videoUrl: string): string => {
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    // Assuming backend serves videos at /uploads/videos/
    // Get base URL from constants (remove /api/v1)
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${videoUrl}`;
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
      {/* Challenge Banner */}
      {challenge && (
        <Card style={styles.challengeBanner} shadow>
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            style={styles.challengeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.challengeContent}>
              <View style={styles.challengeHeader}>
                <Ionicons name="trophy" size={32} color={Colors.surface} />
                <Text style={styles.challengeTitle}>Desafio da Semana</Text>
              </View>
              <Text style={styles.challengeDescription}>{challenge.titulo}</Text>
              {challenge.descricao && (
                <Text style={styles.challengeDetails}>{challenge.descricao}</Text>
              )}
              <TouchableOpacity
                style={styles.participateButton}
                onPress={handleCreatePost}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam" size={20} color={Colors.primary} />
                <Text style={styles.participateButtonText}>Participar com Vídeo</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Card>
      )}

      {/* Create Post Button (only if no challenge active) */}
      {!challenge && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => navigation.navigate('VideoRecorder', {
            tipo: 'rank',
          })}
          activeOpacity={0.8}
        >
          <Ionicons name="videocam" size={24} color={Colors.surface} />
          <Text style={styles.createPostButtonText}>Criar Post de Ranking</Text>
        </TouchableOpacity>
      )}

      {/* Posts List */}
      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Ranking</Text>
        {posts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="videocam-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum vídeo ainda</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a participar!</Text>
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
                
                {/* Video Preview */}
                {post.video_url && (
                  <View style={styles.videoContainer}>
                    <Video
                      source={{ uri: getVideoUrl(post.video_url) }}
                      style={styles.video}
                      useNativeControls={false}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isMuted={true}
                    />
                    <View style={styles.playButtonOverlay}>
                      <Ionicons name="play-circle" size={48} color={Colors.surface} />
                    </View>
                  </View>
                )}
                
                {post.descricao && (
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {post.descricao}
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
  challengeBanner: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  challengeContent: {
    gap: Spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  challengeTitle: {
    ...Typography.h3,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  challengeDescription: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.surface,
  },
  challengeDetails: {
    ...Typography.body,
    color: Colors.surface + 'CC',
  },
  participateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  participateButtonText: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  createPostButtonText: {
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
  postDescription: {
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
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.dark,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});


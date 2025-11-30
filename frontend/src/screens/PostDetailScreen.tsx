import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius, API_BASE_URL } from '../constants';
import { CommunityPost, PostComment } from '../types';
import Toast from 'react-native-toast-message';

interface PostDetailScreenProps {
  navigation: any;
  route: {
    params: {
      postId: number;
    };
  };
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const [postData, commentsResponse] = await Promise.all([
        apiService.getPostById(postId),
        apiService.getComments(postId, 1, 50),
      ]);

      setPost(postData);
      if (commentsResponse.success && commentsResponse.data) {
        setComments(commentsResponse.data.comments);
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar post',
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post || isLiking) return;

    try {
      setIsLiking(true);
      const result = await apiService.toggleLike(postId);
      
      setPost({
        ...post,
        userLiked: result.liked,
        curtidas_count: result.likesCount,
      });
    } catch (error: any) {
      console.error('Error toggling like:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao curtir',
        text2: error.message,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return;

    try {
      setIsCommenting(true);
      const newComment = await apiService.createComment(postId, { texto: commentText.trim() });
      
      setComments([...comments, newComment]);
      setCommentText('');
      
      if (post) {
        setPost({
          ...post,
          comentarios_count: post.comentarios_count + 1,
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Comentário adicionado!',
      });
    } catch (error: any) {
      console.error('Error creating comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao comentar',
        text2: error.message,
      });
    } finally {
      setIsCommenting(false);
    }
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

  if (isLoading || !post) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Video Player */}
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: getVideoUrl(post.video_url) }}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
              />
            </View>

            {/* Post Info */}
            <Card style={styles.postCard}>
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
                    {new Date(post.data_postagem).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              {post.titulo && (
                <Text style={styles.postTitle}>{post.titulo}</Text>
              )}

              {post.duvida && (
                <Text style={styles.postDuvida}>{post.duvida}</Text>
              )}

              {post.descricao && (
                <Text style={styles.postDescription}>{post.descricao}</Text>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLike}
                  disabled={isLiking}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={post.userLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={post.userLiked ? Colors.error : Colors.textSecondary}
                  />
                  <Text style={[styles.actionText, post.userLiked && styles.actionTextActive]}>
                    {post.curtidas_count}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={24} color={Colors.textSecondary} />
                  <Text style={styles.actionText}>{post.comentarios_count}</Text>
                </View>
              </View>
            </Card>

            {/* Comments */}
            <Card style={styles.commentsCard}>
              <Text style={styles.commentsTitle}>Comentários ({comments.length})</Text>
              
              {comments.length === 0 ? (
                <Text style={styles.noCommentsText}>Nenhum comentário ainda</Text>
              ) : (
                <View style={styles.commentsList}>
                  {comments.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      {comment.user?.foto_perfil ? (
                        <Image
                          source={{ uri: comment.user.foto_perfil }}
                          style={styles.commentAvatar}
                        />
                      ) : (
                        <View style={styles.commentAvatarPlaceholder}>
                          <Ionicons name="person" size={16} color={Colors.textSecondary} />
                        </View>
                      )}
                      <View style={styles.commentContent}>
                        <Text style={styles.commentUserName}>{comment.user?.nome || 'Usuário'}</Text>
                        <Text style={styles.commentText}>{comment.texto}</Text>
                        <Text style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Comment Input */}
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Adicione um comentário..."
                  placeholderTextColor={Colors.textSecondary}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!commentText.trim() || isCommenting) && styles.sendButtonDisabled]}
                  onPress={handleComment}
                  disabled={!commentText.trim() || isCommenting}
                  activeOpacity={0.7}
                >
                  {isCommenting ? (
                    <ActivityIndicator size="small" color={Colors.surface} />
                  ) : (
                    <Ionicons name="send" size={20} color={Colors.surface} />
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  videoContainer: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.dark,
  },
  video: {
    flex: 1,
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
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  postDescription: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  actionTextActive: {
    color: Colors.error,
    fontWeight: '600',
  },
  commentsCard: {
    padding: Spacing.md,
  },
  commentsTitle: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  noCommentsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  commentsList: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  commentUserName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  commentText: {
    ...Typography.body,
    color: Colors.text,
  },
  commentDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});


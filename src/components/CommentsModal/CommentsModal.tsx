import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';
import { COLORS, FONT_SIZES, SIZES, SHADOWS, BORDER_RADIUS } from '../../constants';
import { Comment } from '../../types/feed';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: number) => void;
  feedTitle: string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  comments,
  onAddComment,
  onLikeComment,
  feedTitle,
}) => {
  const { t } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const renderComment = ({ item, index }: { item: Comment; index: number }) => (
    <>
      <View style={styles.commentItem}>
        <View style={[styles.commentHeader, { flexDirection }]}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>{item.userAvatar}</Text>
          </View>
          <View style={styles.commentInfo}>
            <Text style={[styles.commentUserName, { textAlign }]}>{item.userName}</Text>
            <Text style={[styles.commentTimestamp, { textAlign }]}>{item.timestamp}</Text>
          </View>
        </View>
        <Text style={[styles.commentContent, { textAlign }]}>{item.content}</Text>
        <View style={[styles.commentActions, { flexDirection }]}>
          <TouchableOpacity 
            style={styles.commentLikeButton} 
            onPress={() => onLikeComment(item.id)}
          >
            <Text style={styles.commentLikeIcon}>{item.isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.commentLikeText}>{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {index < comments.length - 1 && <View style={styles.commentSeparator} />}
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={[styles.headerContent, { flexDirection }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { textAlign }]}>{t('home.comments')}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={[styles.feedTitle, { textAlign }]} numberOfLines={2}>
            {feedTitle}
          </Text>
        </View>

        <FlatList
          data={comments}
          renderItem={({ item, index }) => renderComment({ item, index })}
          keyExtractor={(item) => item.id.toString()}
          style={styles.commentsList}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t('home.noComments')}</Text>
              <Text style={styles.emptyStateSubtext}>{t('home.beFirstToComment')}</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { flexDirection }]}>
            <TextInput
              style={[styles.textInput, { textAlign }]}
              placeholder={t('home.writeComment')}
              placeholderTextColor={COLORS.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                newComment.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.lightGray + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 32,
  },
  feedTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: SIZES.xs,
  },
  commentsList: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  commentsContent: {
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xl,
  },
  commentItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  commentSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.lg,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.linkedinBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  commentAvatarText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.linkedinBlue,
    fontWeight: '700',
  },
  commentInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 16,
  },
  commentTimestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
    lineHeight: 14,
  },
  commentContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SIZES.xs,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'transparent',
  },
  commentLikeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  commentLikeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    minHeight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    maxHeight: 80,
    paddingVertical: SIZES.xs,
    lineHeight: 18,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.xs,
  },
  sendButtonActive: {
    backgroundColor: COLORS.linkedinBlue,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.lightGray + '60',
  },
  sendButtonText: {
    fontSize: 14,
  },
});

export default CommentsModal;
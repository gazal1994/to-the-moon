import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../hooks/useRTL';
import { styles } from './CreatePostModal.styles';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, type: string) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { isRTL, textAlign } = useRTL();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<'general' | 'achievement' | 'question' | 'announcement'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    { key: 'general', label: t('createPost.types.general'), emoji: '💭' },
    { key: 'achievement', label: t('createPost.types.achievement'), emoji: '🎉' },
    { key: 'question', label: t('createPost.types.question'), emoji: '❓' },
    { key: 'announcement', label: t('createPost.types.announcement'), emoji: '📢' },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('createPost.error'), t('createPost.titleRequired'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('createPost.error'), t('createPost.descriptionRequired'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(title.trim(), description.trim(), selectedType);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedType('general');
      onClose();
      
      Alert.alert(t('createPost.success'), t('createPost.postCreated'));
    } catch (error) {
      Alert.alert(t('createPost.error'), t('createPost.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title.trim() || description.trim()) {
      Alert.alert(
        t('createPost.unsavedChanges'),
        t('createPost.discardChanges'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('common.discard'), 
            style: 'destructive',
            onPress: () => {
              setTitle('');
              setDescription('');
              setSelectedType('general');
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { textAlign }]}>
            {t('createPost.title')}
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!title.trim() || !description.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              (!title.trim() || !description.trim() || isSubmitting) && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? t('createPost.posting') : t('createPost.post')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('createPost.selectType')}
            </Text>
            <View style={styles.typeContainer}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    selectedType === type.key && styles.typeButtonSelected
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <Text style={styles.typeEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.typeLabel,
                    { textAlign },
                    selectedType === type.key && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('createPost.titleLabel')}
            </Text>
            <TextInput
              style={[styles.titleInput, { textAlign }]}
              placeholder={t('createPost.titlePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              multiline={false}
              returnKeyType="next"
              selectionColor="#0a66c2"
            />
            <Text style={[styles.characterCount, { textAlign: isRTL ? 'left' : 'right' }]}>
              {title.length}/100
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>
              {t('createPost.descriptionLabel')}
            </Text>
            <TextInput
              style={[styles.descriptionInput, { textAlign }]}
              placeholder={t('createPost.descriptionPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              selectionColor="#0a66c2"
            />
            <Text style={[styles.characterCount, { textAlign: isRTL ? 'left' : 'right' }]}>
              {description.length}/500
            </Text>
          </View>

          {/* Preview */}
          {(title.trim() || description.trim()) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {t('createPost.preview')}
              </Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>YOU</Text>
                  </View>
                  <View style={styles.previewUserInfo}>
                    <Text style={[styles.previewUserName, { textAlign }]}>
                      {t('createPost.yourName')}
                    </Text>
                    <Text style={[styles.previewTimestamp, { textAlign }]}>
                      {t('createPost.justNow')}
                    </Text>
                  </View>
                  <Text style={styles.previewType}>
                    {postTypes.find(type => type.key === selectedType)?.emoji}
                  </Text>
                </View>
                
                {title.trim() && (
                  <Text style={[styles.previewTitle, { textAlign }]}>
                    {title}
                  </Text>
                )}
                
                {description.trim() && (
                  <Text style={[styles.previewDescription, { textAlign }]}>
                    {description}
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
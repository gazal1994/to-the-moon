import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useUserRole } from '../../../hooks/useUserRole';
import { useRTL } from '../../../hooks/useRTL';
import { UserProfileData } from '../UserProfileScreen/UserProfileScreen';
import { CommentsModal } from '../../../components/CommentsModal';
import { CreatePostModal } from '../../../components/CreatePostModal';
import { RootStackParamList } from '../../../types';
import { FeedItem, Comment } from '../../../types/feed';
import { styles } from './HomeScreen.styles';

const HomeScreen: React.FC = () => {
  const { getGreeting, getSubtitle, getDashboardContent, isStudent, isTeacher } = useUserRole();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isRTL: isRTLLayout, textAlign, flexDirection } = useRTL();
  
  const [feedData, setFeedData] = useState<FeedItem[]>([
    {
      id: 1,
      type: 'lesson_completed',
      userName: 'Ahmed Hassan',
      userAvatar: 'AH',
      timestamp: '2 hours ago',
      title: 'Mathematics Lesson Completed',
      description: 'Successfully completed a 1-hour algebra session with excellent progress in quadratic equations.',
      likes: 12,
      comments: 3,
      isLiked: false,
      commentsList: [
        {
          id: 1,
          userId: '1',
          userName: 'Sarah Mohamed',
          userAvatar: 'SM',
          content: 'Great progress! Keep up the excellent work! 🎉',
          timestamp: '1 hour ago',
          likes: 4,
          isLiked: false,
        },
        {
          id: 2,
          userId: '2',
          userName: 'Omar Ali',
          userAvatar: 'OA',
          content: 'Quadratic equations can be challenging. Well done! 👏',
          timestamp: '45 minutes ago',
          likes: 2,
          isLiked: true,
        },
        {
          id: 3,
          userId: '3',
          userName: 'Fatima Ibrahim',
          userAvatar: 'FI',
          content: 'I struggled with this topic too. Any tips to share?',
          timestamp: '30 minutes ago',
          likes: 1,
          isLiked: false,
        },
      ],
    },
    {
      id: 2,
      type: 'new_teacher',
      userName: 'Sarah Mohamed',
      userAvatar: 'SM',
      timestamp: '4 hours ago',
      title: 'New Teacher Joined',
      description: 'Experienced Physics teacher with 8+ years of teaching experience now available for online and in-person lessons.',
      likes: 25,
      comments: 7,
      isLiked: true,
      commentsList: [
        {
          id: 4,
          userId: '4',
          userName: 'Ahmed Hassan',
          userAvatar: 'AH',
          content: 'Welcome to the platform! Looking forward to your physics classes.',
          timestamp: '3 hours ago',
          likes: 8,
          isLiked: true,
        },
        {
          id: 5,
          userId: '5',
          userName: 'Omar Ali',
          userAvatar: 'OA',
          content: 'We need more experienced teachers like you! 🌟',
          timestamp: '2 hours ago',
          likes: 6,
          isLiked: false,
        },
      ],
    },
    {
      id: 3,
      type: 'achievement',
      userName: 'Omar Ali',
      userAvatar: 'OA',
      timestamp: '1 day ago',
      title: 'Achievement Unlocked',
      description: 'Completed 50 lessons and received 5-star ratings from all students this month!',
      likes: 45,
      comments: 12,
      isLiked: true,
      commentsList: [
        {
          id: 6,
          userId: '6',
          userName: 'Fatima Ibrahim',
          userAvatar: 'FI',
          content: 'Congratulations! You\'re an amazing teacher! 🏆',
          timestamp: '20 hours ago',
          likes: 15,
          isLiked: true,
        },
      ],
    },
    {
      id: 4,
      type: 'study_group',
      userName: 'Fatima Ibrahim',
      userAvatar: 'FI',
      timestamp: '2 days ago',
      title: 'Study Group Session',
      description: 'Organizing a Chemistry study group for final exam preparation. Join us this weekend!',
      likes: 18,
      comments: 5,
      isLiked: false,
      commentsList: [
        {
          id: 7,
          userId: '7',
          userName: 'Ahmed Hassan',
          userAvatar: 'AH',
          content: 'Count me in! What time are we meeting?',
          timestamp: '1 day ago',
          likes: 3,
          isLiked: false,
        },
      ],
    },
  ]);

  // Comments modal state
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);

  // Sample user profiles for demonstration
  const getUserProfile = (userName: string, userAvatar: string): UserProfileData => {
    const profiles: { [key: string]: UserProfileData } = {
      'Ahmed Hassan': {
        id: '1',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        role: 'STUDENT',
        avatar: 'AH',
        country: 'Palestine',
        city: 'Ramallah',
        subjects: ['Mathematics', 'Physics'],
        languages: ['Arabic', 'English'],
        bio: 'Dedicated mathematics student with a passion for problem-solving and analytical thinking.',
        totalLessons: 45,
        joinedDate: '2023-09-15',
      },
      'Sarah Mohamed': {
        id: '2',
        name: 'Sarah Mohamed',
        email: 'sarah.mohamed@example.com',
        role: 'TEACHER',
        avatar: 'SM',
        country: 'Egypt',
        city: 'Cairo',
        subjects: ['Physics', 'Chemistry'],
        teachingStyle: ['Interactive', 'Problem-based learning', 'Visual aids'],
        languages: ['Arabic', 'English', 'French'],
        experience: '8+ years of teaching experience in international schools',
        education: 'PhD in Physics from Cairo University',
        rating: 4.8,
        totalLessons: 156,
        hourlyRate: 25,
        availability: ['Monday 2-6 PM', 'Wednesday 10 AM-2 PM', 'Friday 3-7 PM'],
        bio: 'Experienced Physics teacher with 8+ years of teaching experience. Specialized in making complex concepts simple and engaging.',
        joinedDate: '2022-03-20',
      },
      'Omar Ali': {
        id: '3',
        name: 'Omar Ali',
        email: 'omar.ali@example.com',
        role: 'TEACHER',
        avatar: 'OA',
        country: 'Jordan',
        city: 'Amman',
        subjects: ['Mathematics', 'Computer Science'],
        teachingStyle: ['Hands-on', 'Project-based', 'Collaborative'],
        languages: ['Arabic', 'English'],
        experience: '5 years of teaching experience',
        education: 'Master\'s in Computer Science',
        rating: 4.9,
        totalLessons: 89,
        hourlyRate: 30,
        availability: ['Tuesday 1-5 PM', 'Thursday 9 AM-1 PM', 'Saturday 2-6 PM'],
        bio: 'Passionate about mathematics and computer science education with innovative teaching methods.',
        joinedDate: '2023-01-10',
      },
      'Fatima Ibrahim': {
        id: '4',
        name: 'Fatima Ibrahim',
        email: 'fatima.ibrahim@example.com',
        role: 'STUDENT',
        avatar: 'FI',
        country: 'Lebanon',
        city: 'Beirut',
        subjects: ['Chemistry', 'Biology'],
        languages: ['Arabic', 'English'],
        bio: 'Chemistry enthusiast preparing for medical school entrance exams.',
        totalLessons: 23,
        joinedDate: '2024-02-05',
      },
    };

    return profiles[userName] || {
      id: '0',
      name: userName,
      email: 'user@example.com',
      role: 'STUDENT',
      avatar: userAvatar,
      country: 'Palestine',
      languages: ['Arabic', 'English'],
      bio: 'Aqra platform user',
      joinedDate: '2024-01-01',
    };
  };

  const handleUserProfilePress = (userName: string, userAvatar: string) => {
    const userProfile = getUserProfile(userName, userAvatar);
    navigation.navigate('UserProfile', { user: userProfile });
  };

  const handleCommentsPress = (feedItem: FeedItem) => {
    setSelectedFeedItem(feedItem);
    setCommentsModalVisible(true);
  };

  const handleAddComment = (content: string) => {
    if (!selectedFeedItem) return;

    const newComment: Comment = {
      id: Date.now(), // Simple ID generation
      userId: 'current-user',
      userName: 'You', // In a real app, this would come from user context
      userAvatar: 'YU',
      content,
      timestamp: t('home.justNow'),
      likes: 0,
      isLiked: false,
    };

    setFeedData(prevData =>
      prevData.map(item => {
        if (item.id === selectedFeedItem.id) {
          const updatedCommentsList = [...(item.commentsList || []), newComment];
          return {
            ...item,
            commentsList: updatedCommentsList,
            comments: updatedCommentsList.length,
          };
        }
        return item;
      })
    );

    // Update selected item for modal
    setSelectedFeedItem(prev => prev ? {
      ...prev,
      commentsList: [...(prev.commentsList || []), newComment],
      comments: (prev.commentsList?.length || 0) + 1,
    } : null);
  };

  const handleLikeComment = (commentId: number) => {
    if (!selectedFeedItem) return;

    const updatedCommentsList = selectedFeedItem.commentsList?.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        };
      }
      return comment;
    }) || [];

    setFeedData(prevData =>
      prevData.map(item => {
        if (item.id === selectedFeedItem.id) {
          return {
            ...item,
            commentsList: updatedCommentsList,
          };
        }
        return item;
      })
    );

    setSelectedFeedItem(prev => prev ? {
      ...prev,
      commentsList: updatedCommentsList,
    } : null);
  };

  const handleLike = (id: number) => {
    setFeedData(prevData =>
      prevData.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1,
          };
        }
        return item;
      })
    );
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return '✅';
      case 'new_teacher':
        return '👨‍🏫';
      case 'achievement':
        return '🏆';
      case 'study_group':
        return '👥';
      default:
        return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return t('home.feed.lessonCompleted');
      case 'new_teacher':
        return t('home.feed.newTeacher');
      case 'achievement':
        return t('home.feed.achievement');
      case 'study_group':
        return t('home.feed.studyGroup');
      default:
        return t('home.feed.update');
    }
  };

  const handleCreatePost = (title: string, description: string, type: string) => {
    const newPost: FeedItem = {
      id: Math.max(...feedData.map(item => item.id)) + 1,
      type: type as any,
      userName: t('createPost.yourName'),
      userAvatar: 'YOU',
      timestamp: t('createPost.justNow'),
      title: title,
      description: description,
      likes: 0,
      comments: 0,
      isLiked: false,
      commentsList: [],
    };

    // Add the new post to the beginning of the feed
    setFeedData(prevData => [newPost, ...prevData]);
  };

  const renderFeedCard = (item: FeedItem) => (
    <View key={item.id} style={styles.feedCard}>
      <View style={[styles.feedHeader, { flexDirection }]}>
        <View style={styles.feedAvatar}>
          <Text style={styles.feedAvatarText}>{item.userAvatar}</Text>
        </View>
        <View style={styles.feedUserInfo}>
          <TouchableOpacity onPress={() => handleUserProfilePress(item.userName, item.userAvatar)}>
            <Text style={[styles.feedUserName, styles.clickableUserName, { textAlign }]}>{item.userName}</Text>
          </TouchableOpacity>
          <Text style={[styles.feedTimestamp, { textAlign }]}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.feedType, { textAlign: isRTLLayout ? 'left' : 'right' }]}>{getTypeLabel(item.type)}</Text>
      </View>
      
      <View style={styles.feedContent}>
        <Text style={[styles.feedTitle, { textAlign }]}>
          {getTypeEmoji(item.type)} {item.title}
        </Text>
        <Text style={[styles.feedDescription, { textAlign }]}>{item.description}</Text>
      </View>
      
      <View style={styles.feedActions}>
        <View style={[styles.feedStats, { flexDirection }]}>
          <TouchableOpacity style={styles.feedAction} onPress={() => handleLike(item.id)}>
            <Text>{item.isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.feedActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedAction} onPress={() => handleCommentsPress(item)}>
            <Text>💬</Text>
            <Text style={styles.feedActionText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.feedContainer}>
            {feedData.map(renderFeedCard)}
          </View>
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        comments={selectedFeedItem?.commentsList || []}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        feedTitle={selectedFeedItem?.title || ''}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onSubmit={handleCreatePost}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { [isRTLLayout ? 'left' : 'right']: 20 }]}
        onPress={() => setCreatePostModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>✍️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
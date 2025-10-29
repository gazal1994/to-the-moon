import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../../services/apiClient';
import { useUser } from '../../../contexts/UserContext';
import { COLORS, SIZES, FONT_SIZES } from '../../../constants';
import { styles } from './SentRequestsScreen.styles';

interface SentRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  requestedTime: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const SentRequestsScreen: React.FC = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [requests, setRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch actual requests from backend
      const response = await apiClient.get('/requests?role=student');
      
      console.log('📥 API Response:', JSON.stringify(response, null, 2));
      
      if (!response) {
        console.error('❌ No response from API');
        setRequests([]);
        return;
      }
      
      if (response.success && Array.isArray(response.requests)) {
        // Map backend data to frontend format
        const formattedRequests: SentRequest[] = response.requests.map((req: any) => ({
          id: req.id,
          teacherId: req.teacherId || req.teacher_id,
          teacherName: req.teacher?.name || 'Unknown Teacher',
          teacherAvatar: req.teacher?.avatarUrl || req.teacher?.avatar_url,
          subject: req.subject,
          requestedTime: formatRequestedTime(req.preferredTime || req.preferred_time),
          message: req.message || '',
          status: req.status,
          createdAt: req.createdAt || req.created_at,
        }));
        
        setRequests(formattedRequests);
        console.log('✅ Loaded sent requests:', formattedRequests.length);
      } else {
        console.log('⚠️ No requests found or invalid response format');
        setRequests([]);
      }
    } catch (error: any) {
      console.error('Failed to load requests:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setRequests([]);
      // Don't show alert on first load, just log the error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatRequestedTime = (dateString: string): string => {
    if (!dateString) return 'Time not specified';
    
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return `${dayName} ${time}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      Alert.alert(
        'Cancel Request',
        'Are you sure you want to cancel this request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                // Update request status to 'cancelled' in backend
                const response = await apiClient.patch(`/requests/${requestId}`, {
                  status: 'cancelled'
                });
                
                if (response.success) {
                  // Remove request from list
                  setRequests(prev => prev.filter(req => req.id !== requestId));
                  Alert.alert('Request Cancelled', 'Your lesson request has been cancelled.');
                } else {
                  Alert.alert('Error', response.error || 'Failed to cancel request');
                }
              } catch (error: any) {
                console.error('Failed to cancel request:', error);
                Alert.alert('Error', error?.message || 'Failed to cancel request');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to cancel request:', error);
      Alert.alert('Error', 'Failed to cancel request');
    }
  };

  const handleMessageTeacher = (request: SentRequest) => {
    // Navigate to messages with the teacher
    // @ts-ignore
    navigation.navigate('Messages', {
      openConversation: {
        id: request.teacherId,
        otherUser: {
          id: request.teacherId,
          name: request.teacherName,
          avatar: request.teacherAvatar,
          role: 'teacher'
        }
      }
    });
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };

  const renderRequest = ({ item }: { item: SentRequest }) => (
    <View style={styles.requestCard}>
      {/* Teacher Info */}
      <View style={styles.teacherInfo}>
        {item.teacherAvatar ? (
          <Image source={{ uri: item.teacherAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.teacherName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.teacherDetails}>
          <Text style={styles.teacherName}>{item.teacherName}</Text>
          <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: 
              item.status === 'accepted' ? '#d4edda' : 
              item.status === 'rejected' ? '#f8d7da' : 
              '#fff3cd' 
          }
        ]}>
          <Text style={[
            styles.statusText,
            { 
              color: 
                item.status === 'accepted' ? '#155724' : 
                item.status === 'rejected' ? '#721c24' : 
                '#856404' 
            }
          ]}>
            {item.status === 'accepted' ? 'Accepted' : 
             item.status === 'rejected' ? 'Rejected' : 
             'Pending'}
          </Text>
        </View>
      </View>

      {/* Request Details */}
      <View style={styles.requestDetails}>
        <Text style={styles.subjectLabel}>Subject:</Text>
        <Text style={styles.subjectText}>{item.subject}</Text>
        
        <Text style={styles.timeLabel}>Requested Time:</Text>
        <Text style={styles.timeText}>{item.requestedTime}</Text>
        
        <Text style={styles.messageLabel}>Your Message:</Text>
        <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessageTeacher(item)}
        >
          <Text style={styles.messageButtonText}>Message Teacher</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sent Requests</Text>
        <Text style={styles.subtitle}>Track your lesson requests</Text>
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📤</Text>
          <Text style={styles.emptyTitle}>No Sent Requests</Text>
          <Text style={styles.emptyText}>
            Request lessons from teachers to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRequests();
              }}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SentRequestsScreen;
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { RequestWithDetails, RequestStatus } from '../../types';
import { COLORS } from '../../constants';
import { getInitials, formatDateTime, getTimeAgo } from '../../utils';
import { styles, getEmojiIcon } from './RequestCard.styles';

interface RequestCardProps {
  request: RequestWithDetails;
  onPress: () => void;
  viewAs: 'student' | 'teacher';
  style?: ViewStyle;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onPress,
  viewAs,
  style,
}) => {
  const otherUser = viewAs === 'student' ? request.teacher : request.student;
  
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return COLORS.warning;
      case RequestStatus.ACCEPTED:
        return COLORS.success;
      case RequestStatus.REJECTED:
        return COLORS.error;
      case RequestStatus.COMPLETED:
        return COLORS.primary;
      case RequestStatus.CANCELED:
        return COLORS.gray400;
      default:
        return COLORS.gray400;
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return 'time-outline';
      case RequestStatus.ACCEPTED:
        return 'checkmark-circle-outline';
      case RequestStatus.REJECTED:
        return 'close-circle-outline';
      case RequestStatus.COMPLETED:
        return 'trophy-outline';
      case RequestStatus.CANCELED:
        return 'ban-outline';
      default:
        return 'help-outline';
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {otherUser.avatarUrl ? (
            <Image source={{ uri: otherUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{getInitials(otherUser.name)}</Text>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser.name}
            </Text>
            <Text style={styles.subject}>{request.subject}</Text>
            <Text style={styles.time}>
              {formatDateTime(request.preferredTime)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
            <Text style={[styles.emojiIcon, { fontSize: 14, color: getStatusColor(request.status) }]}>
              {getEmojiIcon(getStatusIcon(request.status))}
            </Text>
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {request.status}
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {getTimeAgo(request.createdAt)}
          </Text>
        </View>
      </View>
      
      {request.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.message} numberOfLines={2}>
            {request.message}
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.modeContainer}>
          <Text style={[styles.emojiIcon, { fontSize: 14, color: COLORS.primary }]}>
            {getEmojiIcon(request.preferredMode === 'online' ? 'videocam-outline' : 'person-outline')}
          </Text>
          <Text style={styles.modeText}>
            {request.preferredMode === 'online' ? 'Online' : 'In-person'}
          </Text>
        </View>
        
        <Text style={[styles.emojiIcon, { fontSize: 16, color: COLORS.gray400 }]}>
          {getEmojiIcon('chevron-forward')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default RequestCard;
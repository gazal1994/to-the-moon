import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { apiClient } from '../../../services/apiClient';
import { useUser } from '../../../contexts/UserContext';
import { styles } from './MessagesScreen.styles';

type MessagesScreenRouteProp = RouteProp<
  { 
    Messages: { 
      openConversation?: Conversation 
    } 
  },
  'Messages'
>;

interface Conversation {
  id: number;
  participants: number[];
  lastMessage: string;
  lastMessageAt: string;
  otherUser: {
    id: number;
    name: string;
    avatar?: string;
    role: string;
  };
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesScreen: React.FC = () => {
  const { user } = useUser();
  const route = useRoute<MessagesScreenRouteProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  // Handle opening conversation from navigation params
  useEffect(() => {
    if (route.params?.openConversation) {
      setSelectedConversation(route.params.openConversation);
      loadMessages(route.params.openConversation.id);
    }
  }, [route.params?.openConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/messages/conversations');
      if (response.success && response.data) {
        // response.data is the actual API response { success, data }
        if (response.data.success) {
          setConversations(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
      if (response.success && response.data && response.data.success) {
        setMessages(response.data.data.data);
        // Mark messages as read
        response.data.data.data.forEach((msg: Message) => {
          if (!msg.isRead && msg.receiverId === user?.id) {
            markAsRead(msg.id);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiClient.patch(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const otherUserId = selectedConversation.otherUser.id;
      
      const response = await apiClient.post('/messages', {
        receiverId: otherUserId,
        content: messageText.trim(),
        type: 'text'
      });

      if (response.success && response.data && response.data.success) {
        setMessages([...messages, response.data.data]);
        setMessageText('');
        loadConversations(); // Refresh conversation list
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    loadConversations(); // Refresh to update unread counts
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openConversation(item)}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser.avatar ? (
          <Image source={{ uri: item.otherUser.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.otherUser.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.otherUser.name}</Text>
          <Text style={styles.conversationTime}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount && item.unreadCount > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          <Text style={styles.roleLabel}>{item.otherUser.role}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={closeConversation} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              {selectedConversation.otherUser.avatar ? (
                <Image
                  source={{ uri: selectedConversation.otherUser.avatar }}
                  style={styles.chatHeaderAvatar}
                />
              ) : (
                <View style={[styles.chatHeaderAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.chatHeaderAvatarText}>
                    {selectedConversation.otherUser.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.chatHeaderName}>{selectedConversation.otherUser.name}</Text>
                <Text style={styles.chatHeaderRole}>{selectedConversation.otherUser.role}</Text>
              </View>
            </View>
          </View>

          {/* Messages List */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!messageText.trim() || sendingMessage) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a66c2" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation by messaging a teacher or student
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadConversations();
              }}
              tintColor="#0a66c2"
            />
          }
          contentContainerStyle={styles.conversationsList}
        />
      )}
    </SafeAreaView>
  );
};

export default MessagesScreen;
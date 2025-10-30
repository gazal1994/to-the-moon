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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { apiClient } from '../../../services/apiClient';
import { useUser } from '../../../contexts/UserContext';
import { useSocket } from '../../../contexts/SocketContext';
import { useUnreadMessages } from '../../../contexts/UnreadMessagesContext';
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
  id: string | number;
  participants?: string[];
  lastMessage: string;
  lastMessageAt: string;
  otherUser: {
    id: string | number;
    name: string;
    avatar?: string;
    role: string;
  };
  unreadCount?: number;
}

interface Message {
  id: string | number;
  conversationId?: string | number;
  senderId: string | number;
  receiverId: string | number;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const MessagesScreen: React.FC = () => {
  const { user } = useUser();
  const { socket, connected, onMessage, offMessage } = useSocket();
  const { refreshUnreadCount } = useUnreadMessages();
  const route = useRoute<MessagesScreenRouteProp>();
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Refresh conversations when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 MessagesScreen focused - refreshing conversations');
      loadConversationsSilently();
    });

    return unsubscribe;
  }, [navigation]);

  // Set up polling as fallback when Socket.IO is not connected
  useEffect(() => {
    // If Socket.IO is connected, don't use polling
    if (socket && connected) {
      return;
    }

    // Use polling if Socket.IO is not available
    console.log('ℹ️  Using HTTP polling for conversations (Socket.IO not connected)');
    const pollInterval = setInterval(() => {
      loadConversationsSilently();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [socket, connected]);

  // Set up WebSocket listener for conversation updates (when available)
  useEffect(() => {
    if (!socket || !connected) {
      console.log('⚠️ WebSocket not available for MessagesScreen');
      return;
    }

    console.log('✅ WebSocket connected - MessagesScreen will receive real-time updates');

    const handleSocketMessage = (payload: any) => {
      const { event, data } = payload;

      if (event === 'conversation_updated') {
        console.log('🔄 Conversation updated via WebSocket:', data);
        
        // Update conversation in real-time
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === data.conversationId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: data.lastMessage || updated[index].lastMessage,
              lastMessageAt: data.lastMessageAt || new Date().toISOString(),
              unreadCount: data.unreadCount ?? updated[index].unreadCount
            };
            // Move to top
            updated.unshift(updated.splice(index, 1)[0]);
            return updated;
          }
          return prev;
        });
      } else if (event === 'receive_message') {
        console.log('📩 New message received via WebSocket, updating conversations');
        
        // Update the conversation with the new message
        setConversations(prev => {
          const conversationId = data.senderId === user?.id ? data.receiverId : data.senderId;
          const index = prev.findIndex(c => c.id === conversationId);
          
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: data.content,
              lastMessageAt: data.createdAt || new Date().toISOString(),
              unreadCount: data.senderId !== user?.id ? (updated[index].unreadCount || 0) + 1 : updated[index].unreadCount || 0
            };
            // Move to top
            updated.unshift(updated.splice(index, 1)[0]);
            return updated;
          } else {
            // New conversation - refresh the list
            loadConversationsSilently();
          }
          return prev;
        });
      } else if (event === 'messages_read') {
        console.log('✅ Messages marked as read via WebSocket');
        
        // Reset unread count for this conversation
        setConversations(prev => prev.map(c => 
          c.id === data.userId ? { ...c, unreadCount: 0 } : c
        ));
      }
    };

    // Register listener
    onMessage(handleSocketMessage);

    return () => {
      offMessage(handleSocketMessage);
    };
  }, [socket, connected, user?.id]);

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
      console.log('Loading conversations...');
      const response = await apiClient.get('/messages/conversations');
      console.log('📥 Conversations API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // The apiClient returns backend response directly: {success: true, data: conversations}
        const conversationsData = response.data as any[];
        console.log('✅ Conversations loaded:', conversationsData.length);
        
        // Ensure all data is properly formatted
        const formattedConversations = conversationsData.map((conv: any) => ({
          id: String(conv.id),
          participants: conv.participants || [],
          lastMessage: String(conv.lastMessage || ''),
          lastMessageAt: String(conv.lastMessageAt || new Date().toISOString()),
          otherUser: {
            id: String(conv.otherUser?.id || ''),
            name: String(conv.otherUser?.name || 'Unknown'),
            avatar: conv.otherUser?.avatar || conv.otherUser?.avatarUrl,
            role: String(conv.otherUser?.role || '')
          },
          unreadCount: conv.unreadCount || 0
        }));
        
        console.log('📋 Formatted conversations:', formattedConversations.length);
        setConversations(formattedConversations);
      } else {
        console.log('⚠️ No conversations found');
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadConversationsSilently = async () => {
    try {
      // Don't update if currently loading or refreshing
      if (loading || refreshing) return;

      const response = await apiClient.get('/messages/conversations');
      
      if (response.success && response.data) {
        const conversationsData = response.data as any[];
        
        const formattedConversations = conversationsData.map((conv: any) => ({
          id: String(conv.id),
          participants: conv.participants || [],
          lastMessage: String(conv.lastMessage || ''),
          lastMessageAt: String(conv.lastMessageAt || new Date().toISOString()),
          otherUser: {
            id: String(conv.otherUser?.id || ''),
            name: String(conv.otherUser?.name || 'Unknown'),
            avatar: conv.otherUser?.avatar || conv.otherUser?.avatarUrl,
            role: String(conv.otherUser?.role || '')
          },
          unreadCount: conv.unreadCount || 0
        }));
        
        setConversations(formattedConversations);
      }
    } catch (error) {
      // Silently fail for background polling
      console.log('Background polling error:', error);
    }
  };

  const loadMessages = async (conversationId: string | number) => {
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      const response = await apiClient.get(`/messages/conversations/${conversationId}/messages`);
      console.log('📥 Messages API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // The apiClient returns backend response directly: {success: true, data: {data: messages, total, page...}}
        const responseData = response.data as any;
        const messagesData = responseData.data || [];
        console.log('✅ Messages loaded:', messagesData.length);
        
        // Format messages to ensure all fields are strings
        const formattedMessages = messagesData.map((msg: any) => ({
          id: String(msg.id),
          conversationId: msg.conversationId || msg.conversation_id,
          senderId: String(msg.senderId || msg.sender_id),
          receiverId: String(msg.receiverId || msg.receiver_id),
          content: String(msg.content || ''),
          type: String(msg.type || msg.messageType || msg.message_type || 'text'),
          isRead: Boolean(msg.isRead || msg.is_read),
          createdAt: String(msg.createdAt || msg.created_at || new Date().toISOString())
        }));
        
        console.log('📋 Setting', formattedMessages.length, 'formatted messages');
        setMessages(formattedMessages);
        
        // Mark messages as read
        formattedMessages.forEach((msg: Message) => {
          if (!msg.isRead && String(msg.receiverId) === String(user?.id)) {
            markAsRead(msg.id);
          }
        });
      } else {
        console.log('⚠️ No messages found');
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setMessages([]);
    }
  };

  const markAsRead = async (messageId: string | number) => {
    try {
      await apiClient.patch(`/messages/${messageId}/read`);
      // Refresh unread messages count
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const otherUserId = selectedConversation.otherUser.id;
      
      console.log('📤 Sending message to:', otherUserId);
      const response = await apiClient.post('/messages', {
        receiverId: otherUserId,
        content: messageText.trim(),
        type: 'text'
      });

      console.log('📥 Send message response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        // The apiClient returns backend response directly: {success: true, data: message}
        const messageData = response.data as any;
        
        // Format the new message
        const newMessage: Message = {
          id: String(messageData.id),
          conversationId: messageData.conversationId || messageData.conversation_id,
          senderId: String(messageData.senderId || messageData.sender_id),
          receiverId: String(messageData.receiverId || messageData.receiver_id),
          content: String(messageData.content),
          type: String(messageData.messageType || messageData.message_type || messageData.type || 'text'),
          isRead: Boolean(messageData.isRead || messageData.is_read),
          createdAt: String(messageData.createdAt || messageData.created_at || new Date().toISOString())
        };
        
        console.log('✅ Adding new message:', newMessage);
        setMessages([...messages, newMessage]);
        setMessageText('');
        loadConversations(); // Refresh conversation list
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const openConversation = (conversation: Conversation) => {
    // Reset unread count immediately for better UX
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    ));
    
    // Navigate to Chat screen
    navigation.navigate('Chat' as never, {
      userId: conversation.otherUser.id,
      userName: conversation.otherUser.name,
      userAvatar: conversation.otherUser.avatar,
    } as never);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    loadConversations(); // Refresh to update unread counts
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // Safety check for data integrity
    if (!item || !item.otherUser) {
      console.warn('Invalid conversation item:', item);
      return null;
    }
    
    // Ensure all values are strings
    const safeName = String(item.otherUser?.name || 'Unknown');
    const safeLastMessage = String(item.lastMessage || 'No messages yet');
    const safeRole = String(item.otherUser?.role || '');
    const safeTime = item.lastMessageAt ? formatTime(item.lastMessageAt) : '';
    const safeUnreadCount = item.unreadCount ? String(item.unreadCount) : '';
    const safeAvatar = item.otherUser?.avatar ? String(item.otherUser.avatar) : '';
    
    return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openConversation(item)}
    >
      <View style={styles.avatarContainer}>
        {safeAvatar ? (
          <Image source={{ uri: safeAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {safeName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        {item.unreadCount && item.unreadCount > 0 && safeUnreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{safeUnreadCount}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{safeName}</Text>
          {safeTime ? <Text style={styles.conversationTime}>{safeTime}</Text> : null}
        </View>
        <View style={styles.conversationFooter}>
          {safeLastMessage ? (
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount && item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {safeLastMessage}
            </Text>
          ) : null}
          {safeRole ? <Text style={styles.roleLabel}>{safeRole}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item || !item.content) {
      console.warn('Invalid message item:', item);
      return null;
    }
    
    const isMe = item.senderId === user?.id;
    const messageTime = formatTime(item.createdAt);

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
            {String(item.content)}
          </Text>
          {messageTime ? (
            <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
              {messageTime}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  if (selectedConversation) {
    // Ensure safe values for rendering
    const safeName = String(selectedConversation.otherUser?.name || 'Unknown');
    const safeRole = String(selectedConversation.otherUser?.role || '');
    
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
                    {safeName.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.chatHeaderName}>{safeName}</Text>
                {safeRole ? <Text style={styles.chatHeaderRole}>{safeRole}</Text> : null}
              </View>
            </View>
          </View>

          {/* Messages List */}
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
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
          keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
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
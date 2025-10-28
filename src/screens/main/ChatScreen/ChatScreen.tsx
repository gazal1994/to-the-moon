import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiClient } from '../../../services/apiClient';
import { useUser } from '../../../contexts/UserContext';
import { styles } from './ChatScreen.styles';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isMine: boolean;
}

interface RouteParams {
  userId: string;
  userName: string;
  userAvatar?: string;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { userId, userName, userAvatar } = route.params as RouteParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Set header title
    navigation.setOptions({
      headerTitle: userName,
    });
    
    // Load existing messages
    loadMessages();
  }, [userName, navigation, userId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/messages/conversations/${userId}/messages`);
      
      // Response structure: { success: true, data: { data: [...messages], total, page, etc } }
      if (response.success && response.data) {
        const messagesData = response.data.data || response.data;
        
        if (Array.isArray(messagesData)) {
          // Transform backend messages to UI format
          const formattedMessages: Message[] = messagesData.map((msg: any) => ({
            id: String(msg.id),
            text: msg.content,
            senderId: String(msg.senderId || msg.sender_id),
            senderName: String(msg.senderId || msg.sender_id) === String(user?.id) ? 'Me' : userName,
            timestamp: new Date(msg.createdAt || msg.created_at),
            isMine: String(msg.senderId || msg.sender_id) === String(user?.id),
          }));
          
          setMessages(formattedMessages);
          
          // Scroll to bottom after loading
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Start with empty messages array on error (new conversation)
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || sending) return;

    const messageText = inputText.trim();
    setInputText(''); // Clear input immediately for better UX

    try {
      setSending(true);
      
      const response = await apiClient.post('/messages', {
        receiverId: userId,
        content: messageText,
        type: 'text'
      });

      // Response is already the backend response: { success: true, data: messageObject }
      if (response.success && response.data) {
        const msg = response.data as any;
        
        const newMessage: Message = {
          id: String(msg.id),
          text: msg.content,
          senderId: String(msg.senderId || msg.sender_id),
          senderName: 'Me',
          timestamp: new Date(msg.createdAt || msg.created_at || new Date()),
          isMine: true,
        };

        setMessages(prev => [...prev, newMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the input text on error
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isMine ? styles.myMessageContainer : styles.theirMessageContainer,
      ]}
    >
      {!item.isMine && (
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            </View>
          )}
        </View>
      )}
      
      <View
        style={[
          styles.messageBubble,
          item.isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isMine ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isMine ? styles.myTimestamp : styles.theirTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a66c2" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <>
            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>No messages yet</Text>
                  <Text style={styles.emptySubtext}>Start a conversation!</Text>
                </View>
              }
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || sending) && styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
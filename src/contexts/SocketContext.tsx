import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useUser } from './UserContext';

// Using native WebSocket API (built into React Native)
// This communicates with Socket.IO server using WebSocket transport
const ENABLE_WEBSOCKET = true;

interface SocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  registerUser: (userId: string) => void;
  sendMessage: (data: MessageData) => void;
  markMessageRead: (messageId: string, userId: string) => void;
  typing: (receiverId: string, senderId: string) => void;
  stopTyping: (receiverId: string, senderId: string) => void;
  onMessage: (callback: (data: any) => void) => void;
  offMessage: (callback: (data: any) => void) => void;
}

interface MessageData {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const WS_URL = 'ws://10.0.2.2:3000/socket.io/?EIO=4&transport=websocket'; // Socket.IO WebSocket endpoint

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser(); // Get user from UserContext
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const messageCallbacks = useRef<Set<(data: any) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Socket.IO protocol: Send Engine.IO packets
  const sendEngineIOPacket = (ws: WebSocket, type: string, data?: any) => {
    // Engine.IO packet format: <type>[<data>]
    // Types: 0=open, 1=close, 2=ping, 3=pong, 4=message, 5=upgrade, 6=noop
    if (type === 'ping') {
      ws.send('2'); // Ping packet
    } else if (type === 'message') {
      // Socket.IO packet format: <type>[<namespace>,][<ack id>][<json>]
      // Types: 0=CONNECT, 1=DISCONNECT, 2=EVENT, 3=ACK, 4=CONNECT_ERROR, 5=BINARY_EVENT, 6=BINARY_ACK
      const payload = JSON.stringify(data);
      ws.send(`42${payload}`); // 4=message, 2=EVENT
    }
  };

  // Initialize WebSocket connection when user is available
  useEffect(() => {
    if (!ENABLE_WEBSOCKET) {
      console.log('ℹ️  WebSocket is disabled. Using HTTP polling for messages.');
      return;
    }

    if (!user?.id) {
      console.log('⚠️ No user available, skipping WebSocket initialization');
      return;
    }

    console.log('🔌 Attempting WebSocket connection to:', WS_URL);
    console.log('👤 User ID:', user.id);

    const initializeWebSocket = async () => {
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('✅ WebSocket transport connected, waiting for Engine.IO handshake...');
        };

        ws.onmessage = (event) => {
          const message = event.data;
          
          // Handle Engine.IO packets
          if (message.startsWith('0')) {
            // Open packet - connection established, parse handshake data
            console.log('✓ Engine.IO open packet received:', message);
            
            // Send Socket.IO CONNECT packet (type 40 = 4 + 0)
            ws.send('40');
            console.log('✓ Sent Socket.IO CONNECT packet');
            
            // Now we're fully connected
            setConnected(true);
            reconnectAttemptsRef.current = 0;
            
            // Register user with server
            setTimeout(() => {
              sendEngineIOPacket(ws, 'message', ['register', user.id]);
              console.log('✓ User registered:', user.id);
            }, 100);
          } else if (message === '40') {
            // Socket.IO connected acknowledgment
            console.log('✅ Socket.IO CONNECTED successfully!');
          } else if (message === '2') {
            // Ping packet from server - respond with pong
            ws.send('3');
            console.log('🏓 Ping received, sent pong');
          } else if (message === '3') {
            // Pong packet from server (response to our ping)
            console.log('🏓 Pong received');
          } else if (message.startsWith('42')) {
            // Socket.IO event packet
            try {
              const data = JSON.parse(message.substring(2));
              const [eventName, eventData] = data;
              
              console.log('📥 Received event:', eventName, eventData);
              
              // Notify all registered callbacks
              messageCallbacks.current.forEach(callback => {
                callback({ event: eventName, data: eventData });
              });
            } catch (error) {
              console.error('Error parsing Socket.IO message:', error);
            }
          }
        };

        ws.onerror = (error: any) => {
          console.error('❌ WebSocket error:', error);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error type:', error.type);
          setConnected(false);
        };

        ws.onclose = (event: any) => {
          console.log('✗ WebSocket disconnected');
          console.log('   Close code:', event.code);
          console.log('   Close reason:', event.reason);
          console.log('   Was clean:', event.wasClean);
          setConnected(false);
          
          // Attempt reconnection
          if (reconnectAttemptsRef.current < 5) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              initializeWebSocket();
            }, delay);
          }
        };

        setSocket(ws);

        return () => {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          ws.close();
        };
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
      }
    };

    initializeWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [user?.id]); // Re-initialize when user changes

  // Handle app state changes (pause/resume connection)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (socket) {
        if (nextAppState === 'active') {
          // App came to foreground - reconnect if needed
          if (socket.readyState === WebSocket.CLOSED) {
            // Will trigger reconnection via onclose handler
            console.log('🔄 App active, reconnecting WebSocket...');
          }
        } else if (nextAppState === 'background') {
          // App went to background - keep connection alive
          console.log('📱 App backgrounded, maintaining WebSocket connection');
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [socket]);

  // Register user with socket
  const registerUser = useCallback((userId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendEngineIOPacket(socket, 'message', ['register', userId]);
      setUserId(userId);
    }
  }, [socket]);

  // Send message via socket
  const sendMessage = useCallback((data: MessageData) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendEngineIOPacket(socket, 'message', ['send_message', data]);
    }
  }, [socket]);

  // Mark message as read
  const markMessageRead = useCallback((messageId: string, userId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendEngineIOPacket(socket, 'message', ['mark_read', { messageId, userId }]);
    }
  }, [socket]);

  // Typing indicator
  const typing = useCallback((receiverId: string, senderId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendEngineIOPacket(socket, 'message', ['typing', { receiverId, senderId }]);
    }
  }, [socket]);

  // Stop typing indicator
  const stopTyping = useCallback((receiverId: string, senderId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendEngineIOPacket(socket, 'message', ['stop_typing', { receiverId, senderId }]);
    }
  }, [socket]);

  // Register message callback
  const onMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacks.current.add(callback);
  }, []);

  // Unregister message callback
  const offMessage = useCallback((callback: (data: any) => void) => {
    messageCallbacks.current.delete(callback);
  }, []);

  const value = {
    socket,
    connected,
    registerUser,
    sendMessage,
    markMessageRead,
    typing,
    stopTyping,
    onMessage,
    offMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

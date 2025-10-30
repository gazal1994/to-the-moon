import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from '../types';
import { COLORS } from '../constants';
import { useUnreadMessages } from '../contexts/UnreadMessagesContext';

// Import screens
import HomeScreen from '../screens/main/HomeScreen/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen/SearchScreen';
import MessagesScreen from '../screens/main/MessagesScreen/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen/ProfileScreen';
import RequestsScreen from '../screens/main/RequestsScreen/RequestsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Helper function to get emoji icons for tab bar
const getTabIcon = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case 'Home':
      return focused ? '🏠' : '🏡';
    case 'Search':
      return '🔍';
    case 'Messages':
      return focused ? '💬' : '💭';
    case 'Requests':
      return focused ? '📄' : '📃';
    case 'Profile':
      return focused ? '👤' : '👥';
    default:
      return '🏠';
  }
};

export const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { unreadMessagesCount } = useUnreadMessages();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const emoji = getTabIcon(route.name, focused);
          return (
            <Text style={{ fontSize: size - 2, color }}>
              {emoji}
            </Text>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: t('navigation.search') }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ 
          title: t('navigation.messages'),
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error || '#FF3B30',
            color: COLORS.white || '#FFFFFF',
            fontSize: 10,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
          }
        }}
      />
      <Tab.Screen 
        name="Requests" 
        component={RequestsScreen}
        options={{ title: t('navigation.requests') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};
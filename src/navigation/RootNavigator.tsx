import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadStoredAuth } from '../store/slices/authSlice';

// Import screens
import OnboardingScreen from '../screens/OnboardingScreen';
import TeacherProfileScreen from '../screens/main/TeacherProfileScreen/TeacherProfileScreen';
import RequestDetailsScreen from '../screens/main/RequestDetailsScreen/RequestDetailsScreen';
import ChatScreen from '../screens/main/ChatScreen/ChatScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen/EditProfileScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen/UserProfileScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen/HelpSupportScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state.auth);
  const { isOnboardingCompleted, isLoading: appLoading } = useAppSelector(state => state.app);

  useEffect(() => {
    // Load stored auth state when app starts
    dispatch(loadStoredAuth());
  }, [dispatch]);

  if (authLoading || appLoading) {
    console.log('🔄 Loading state:', { authLoading, appLoading });
    // You can replace this with a proper loading screen
    return null;
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    console.log('🔍 Navigation state:', { isOnboardingCompleted, isAuthenticated });
    // Skip onboarding and go directly to Login/Auth
    if (!isAuthenticated) return 'Auth';
    return 'Main';
  };

  const initialRoute = getInitialRouteName();
  console.log('📱 Initial route:', initialRoute);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainNavigator}
          options={{ gestureEnabled: false }}
        />
        
        {/* Modal screens */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen 
            name="TeacherProfile" 
            component={TeacherProfileScreen}
            options={{
              headerShown: true,
              title: 'Teacher Profile',
            }}
          />
          <Stack.Screen 
            name="RequestDetails" 
            component={RequestDetailsScreen}
            options={{
              headerShown: true,
              title: 'Request Details',
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: true,
              title: 'Chat',
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{
              headerShown: false,
              title: 'Edit Profile',
            }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{
              headerShown: false,
              title: 'User Profile',
            }}
          />
          <Stack.Screen 
            name="HelpSupport" 
            component={HelpSupportScreen}
            options={{
              headerShown: false,
              title: 'Help & Support',
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
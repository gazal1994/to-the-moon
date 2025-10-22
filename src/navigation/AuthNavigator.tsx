import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen/RoleSelectionScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen/VerifyEmailScreen';
import VerifyPhoneScreen from '../screens/auth/VerifyPhoneScreen/VerifyPhoneScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
    </Stack.Navigator>
  );
};
export * from './user';
export * from './request';
export * from './message';
export * from './review';
export * from './api';

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  TeacherProfile: { teacherId: string };
  RequestDetails: { requestId: string };
  Chat: { conversationId: string; otherUserId: string };
  EditProfile: undefined;
  UserProfile: { user: any };
  HelpSupport: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  VerifyPhone: { phone: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Messages: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type RequestTabParamList = {
  Received: undefined;
  Sent: undefined;
};

// Props types
export interface ScreenProps<T = any> {
  navigation: any;
  route: {
    params?: T;
  };
}
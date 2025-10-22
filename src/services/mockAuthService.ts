import {
  LoginRequest,
  RegisterRequest,
  VerificationRequest,
  ResetPasswordRequest,
  AuthTokens,
  UserWithProfile,
  ApiResponse,
} from '../types';

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUser: UserWithProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  role: 'STUDENT',
  isEmailVerified: true,
  isPhoneVerified: true,
  profile: {
    id: '1',
    userId: '1',
    bio: 'Software developer and learner',
    avatar: null,
    location: 'New York, NY',
    dateOfBirth: null,
    gender: null,
    interests: ['Programming', 'Technology'],
    socialLinks: {},
    isProfileComplete: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 3600,
  tokenType: 'Bearer',
};

// Mock storage for users (in development)
const mockUsers: { [email: string]: { user: UserWithProfile; password: string } } = {
  'john@example.com': {
    user: mockUser,
    password: 'password123',
  },
};

export const mockAuthService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: UserWithProfile; tokens: AuthTokens }>> {
    await mockDelay(800);

    const { email, password } = credentials;
    const mockUserData = mockUsers[email.toLowerCase()];

    if (!mockUserData || mockUserData.password !== password) {
      return {
        success: false,
        error: 'Invalid email or password',
        data: null,
      };
    }

    return {
      success: true,
      data: {
        user: mockUserData.user,
        tokens: mockTokens,
      },
      error: null,
    };
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: UserWithProfile; tokens: AuthTokens }>> {
    await mockDelay(1200);

    const { name, email, password, phone } = userData;

    // Check if user already exists
    if (mockUsers[email.toLowerCase()]) {
      return {
        success: false,
        error: 'User with this email already exists',
        data: null,
      };
    }

    // Create new mock user
    const newUser: UserWithProfile = {
      ...mockUser,
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      profile: {
        ...mockUser.profile,
        id: Date.now().toString(),
        userId: Date.now().toString(),
        bio: `Hello! I'm ${name}`,
      },
    };

    // Store in mock storage
    mockUsers[email.toLowerCase()] = {
      user: newUser,
      password,
    };

    return {
      success: true,
      data: {
        user: newUser,
        tokens: mockTokens,
      },
      error: null,
    };
  },

  async verifyEmail(data: VerificationRequest): Promise<ApiResponse<void>> {
    await mockDelay(500);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async verifyPhone(data: VerificationRequest): Promise<ApiResponse<void>> {
    await mockDelay(500);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    await mockDelay(800);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    await mockDelay(800);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    await mockDelay(300);
    return {
      success: true,
      data: {
        ...mockTokens,
        accessToken: 'mock-refreshed-access-token-' + Date.now(),
      },
      error: null,
    };
  },

  async logout(): Promise<ApiResponse<void>> {
    await mockDelay(300);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async resendEmailVerification(email: string): Promise<ApiResponse<void>> {
    await mockDelay(500);
    return {
      success: true,
      data: null,
      error: null,
    };
  },

  async resendPhoneVerification(phone: string): Promise<ApiResponse<void>> {
    await mockDelay(500);
    return {
      success: true,
      data: null,
      error: null,
    };
  },
};
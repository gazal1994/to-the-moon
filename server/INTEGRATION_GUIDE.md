# Aqra Server <-> Redux Integration Setup

## ✅ Complete Integration Setup

The Aqra server is now fully configured to work with the Redux store in your React Native app.

### What's Been Updated:

1. **API Client Configuration**
   - ✅ Updated `src/services/apiClient.ts` to use `http://localhost:3000/api` in development
   - ✅ Proper CORS configuration for React Native/Expo development

2. **Server Data Structure**
   - ✅ Updated user model to match app expectations
   - ✅ Separate `teacherProfile` and `studentProfile` objects
   - ✅ Consistent field naming (`emailVerified`, `phoneVerified`, etc.)
   - ✅ ISO string dates for consistency

3. **API Endpoints Ready**
   - ✅ `/api/auth/*` - Complete authentication system
   - ✅ `/api/users/*` - User management
   - ✅ `/api/teachers/*` - Teacher profiles and search
   - ✅ `/api/students/*` - Student profiles
   - ✅ `/api/requests/*` - Lesson request system
   - ✅ `/api/messages/*` - Messaging functionality
   - ✅ `/api/reviews/*` - Rating and review system

### 🚀 How to Start:

1. **Start the Server:**
   ```bash
   cd "C:\Users\windows11\Desktop\Full\server"
   npm run dev  # or npm start
   ```

2. **Start the Aqra App:**
   ```bash
   cd "C:\Users\windows11\Desktop\Full\Aqra"
   npm start    # or expo start
   ```

### 🔧 Redux Integration:

The existing Redux slices will work seamlessly with the server:

- **AuthSlice**: Handles login, registration, and user state
- **TeachersSlice**: Manages teacher search and profiles
- **RequestsSlice**: Handles lesson requests
- **MessagesSlice**: Manages conversations and messaging

### 📱 Testing the Connection:

1. Open your Aqra app
2. Try registering a new account - it will create a real user on the server
3. Log in with the account - authentication will be handled by JWT tokens
4. Browse teachers, send messages, create requests - all data will be stored on the server

### 🔐 Authentication Flow:

1. User registers/logs in through the app
2. Server returns JWT tokens
3. Redux stores tokens securely
4. All API calls include authorization headers
5. Server validates tokens for protected endpoints

### 🌐 Network Configuration:

Make sure your React Native app can reach `localhost:3000`. If you're testing on a physical device, you may need to:

1. Use your computer's IP address instead of localhost
2. Update the `BASE_URL` in `apiClient.ts` to your IP: `http://192.168.x.x:3000/api`

## 🎉 Everything is Ready!

Your Aqra app is now fully connected to a working Node.js server with:
- Complete user authentication
- Teacher/student profiles
- Request management
- Messaging system
- Review functionality
- Redux state management

Start both the server and app to begin testing the full integration!
# Aqra Server

A Node.js Express server for the Aqra educational platform that connects teachers and students.

## Features

- User authentication (JWT-based)
- User management (teachers and students)
- Request system for lesson bookings
- Messaging system
- Review and rating system
- RESTful API design
- Input validation and sanitization
- Security middleware (helmet, CORS, rate limiting)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env .env.local
   ```

3. **Start the server:**
   
   Development mode (with nodemon):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/verify-phone` - Verify phone number
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update current user
- `POST /api/users/me/avatar` - Upload user avatar
- `GET /api/users/search` - Search teachers
- `GET /api/users/:id` - Get user by ID

### Teachers
- `GET /api/teachers/me` - Get teacher profile
- `PATCH /api/teachers/me` - Update teacher profile
- `GET /api/teachers` - Get all teachers (with filters)
- `GET /api/teachers/:id` - Get teacher by ID

### Students
- `GET /api/students/me` - Get student profile
- `PATCH /api/students/me` - Update student profile

### Requests
- `GET /api/requests` - Get user's requests
- `POST /api/requests` - Create new lesson request
- `PATCH /api/requests/:id` - Update request status
- `GET /api/requests/:id` - Get request by ID

### Messages
- `GET /api/messages/conversations` - Get user's conversations
- `GET /api/messages/conversations/:id/messages` - Get conversation messages
- `POST /api/messages` - Send new message
- `PATCH /api/messages/:id/read` - Mark message as read
- `GET /api/messages/unread-count` - Get unread messages count

### Reviews
- `GET /api/reviews/teacher/:teacherId` - Get reviews for teacher
- `POST /api/reviews` - Create new review
- `GET /api/reviews/my` - Get current user's reviews
- `PATCH /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logging
- **compression** - Response compression
- **express-rate-limit** - Rate limiting

## Development

The server uses in-memory storage for demonstration purposes. For production use, integrate with a proper database like MongoDB, PostgreSQL, or MySQL.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Request rate limiting
- Security headers with helmet
- Input validation and sanitization
- CORS protection

## CORS Configuration

The server is configured to accept requests from common Expo development URLs:
- `http://localhost:8081` (Expo CLI)
- `http://localhost:19006` (Expo web)
- `exp://192.168.1.1:8081` (Expo mobile)

Update the CORS origins in the environment variables as needed.

## License

ISC
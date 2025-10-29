# PostgreSQL Database Setup for Aqra Server

## Prerequisites

1. **Install PostgreSQL** (if not already installed):
   - Windows: Download from https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for the `postgres` user

2. **Start PostgreSQL Service**:
   - Windows: PostgreSQL should start automatically after installation
   - You can check in Services (services.msc) for "postgresql" service

## Database Setup Steps

### 1. Create Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
-- Connect as postgres user
-- Password: (the one you set during installation)

-- Create the database
CREATE DATABASE aqra_db;

-- Create a user for the application (optional but recommended)
CREATE USER aqra_user WITH ENCRYPTED PASSWORD 'aqra_password';
GRANT ALL PRIVILEGES ON DATABASE aqra_db TO aqra_user;
```

### 2. Update Environment Variables

Edit `.env` file in the server directory:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aqra_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/aqra_db
```

**Important**: Replace `your_postgres_password` with the actual password you set during PostgreSQL installation.

### 3. Install Dependencies

```bash
cd "C:\Users\windows11\Desktop\Full\server"
npm install
```

### 4. Seed the Database

Run the seed script to create tables and add mock data:

```bash
npm run seed
```

Or manually:
```bash
node database/seed.js
```

### 5. Start the Server

```bash
npm run dev
```

## Database Schema

The database includes these tables:
- `users` - User accounts (teachers and students)
- `teacher_profiles` - Teacher-specific information
- `student_profiles` - Student-specific information
- `lesson_requests` - Lesson booking requests
- `messages` - Chat messages
- `conversations` - Message conversations
- `reviews` - Teacher reviews and ratings

## Test Data

After seeding, you'll have:

### Teachers:
- **Dr. Ahmed Hassan** - Mathematics, Physics (ahmed.hassan@email.com / password123)
- **Sarah Johnson** - English, Literature (sarah.johnson@email.com / password123)
- **Maria Garcia** - Biology, Chemistry (maria.garcia@email.com / password123)
- **Omar Al-Rashid** - Computer Science (omar.alrashid@email.com / password123)
- **Lisa Chen** - Volunteer teacher (lisa.chen@email.com / password123)

### Students:
- **Yasmin Mohamed** - High school student (yasmin.mohamed@email.com / password123)
- **John Smith** - University student (john.smith@email.com / password123)
- **Emma Wilson** - Primary student (emma.wilson@email.com / password123)

## Troubleshooting

### Connection Issues:
1. Make sure PostgreSQL service is running
2. Check username/password in `.env`
3. Verify database name exists
4. Check if PostgreSQL is listening on port 5432

### Permission Issues:
1. Make sure the database user has proper permissions
2. Try connecting with the postgres superuser first

### Port Issues:
1. Default PostgreSQL port is 5432
2. Check if another service is using the port
3. Update `DB_PORT` in `.env` if using different port

## Commands

```bash
# Install dependencies
npm install

# Seed database with mock data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## Next Steps

1. Start the server: `npm run dev`
2. Start the Aqra React Native app
3. Try logging in with any of the test accounts
4. Data will now be persisted in PostgreSQL instead of memory
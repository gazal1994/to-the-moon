@echo off
echo 🔍 Testing PostgreSQL Installation...
echo.

REM Add PostgreSQL to PATH temporarily
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin

echo 📋 Checking PostgreSQL version...
psql --version

echo.
echo 🔗 Testing database connection...
echo Enter your PostgreSQL password when prompted:
psql -U postgres -h localhost -p 5432 -c "SELECT version();"

echo.
echo 📊 Creating Aqra database...
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE aqra_db;"

echo.
echo ✅ Setup complete! Press any key to exit...
pause > nul
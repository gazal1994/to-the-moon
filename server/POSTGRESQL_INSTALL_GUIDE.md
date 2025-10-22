# PostgreSQL Installation Guide

## 📋 Installation Steps

1. **Run the PostgreSQL installer as Administrator**
   - Right-click the downloaded .exe file
   - Select "Run as administrator"

2. **Installation Wizard Settings:**
   - Installation Directory: `C:\Program Files\PostgreSQL\16`
   - Data Directory: `C:\Program Files\PostgreSQL\16\data`
   - Port: `5432` (keep default)
   - Superuser: `postgres` (keep default)
   - **Password: `postgres123`** (or choose your own - REMEMBER THIS!)
   - Locale: Default

3. **Components to Install:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (web-based admin tool)
   - ✅ Stack Builder (skip additional components)
   - ✅ Command Line Tools

## 🔧 After Installation

The installer will:
- Create PostgreSQL service (auto-start)
- Add PostgreSQL to Windows Services
- Install psql command line tool
- Install pgAdmin for database management

## 🎯 Test Installation

After installation, open a new PowerShell window and run:
```powershell
# Test if PostgreSQL is installed
"C:\Program Files\PostgreSQL\16\bin\psql" --version

# Connect to database
"C:\Program Files\PostgreSQL\16\bin\psql" -U postgres -h localhost
```

## 🔑 Default Credentials

- **Host:** localhost
- **Port:** 5432
- **Username:** postgres
- **Password:** postgres123 (or what you set during installation)
- **Database:** postgres (default)
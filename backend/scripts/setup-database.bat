@echo off
REM Database Setup Script for Diet Game (Windows)
REM Week 1: Core Backend Development

setlocal enabledelayedexpansion

REM Configuration
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_USER set DB_USER=postgres
if not defined DB_PASSWORD set DB_PASSWORD=password
if not defined DB_NAME_DEV set DB_NAME_DEV=dietgame_dev
if not defined DB_NAME_TEST set DB_NAME_TEST=dietgame_test
if not defined DB_NAME_PROD set DB_NAME_PROD=dietgame_prod
if not defined APP_USER set APP_USER=dietgame_user
if not defined APP_PASSWORD set APP_PASSWORD=secure_password

echo 🚀 Setting up Diet Game Database Infrastructure
echo ==================================================

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL client (psql) not found. Please install PostgreSQL.
    exit /b 1
)

REM Check PostgreSQL connection
echo 🔍 Checking PostgreSQL connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "\q" >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to PostgreSQL. Please check your connection settings.
    echo Host: %DB_HOST%
    echo Port: %DB_PORT%
    echo User: %DB_USER%
    exit /b 1
)
echo ✅ PostgreSQL connection successful

REM Create databases
echo 🗄️  Creating databases...
echo Creating development database: %DB_NAME_DEV%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME_DEV%;" >nul 2>nul
if %errorlevel% neq 0 echo ⚠️  Database %DB_NAME_DEV% might already exist

echo Creating test database: %DB_NAME_TEST%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME_TEST%;" >nul 2>nul
if %errorlevel% neq 0 echo ⚠️  Database %DB_NAME_TEST% might already exist

echo Creating production database: %DB_NAME_PROD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME_PROD%;" >nul 2>nul
if %errorlevel% neq 0 echo ⚠️  Database %DB_NAME_PROD% might already exist
echo ✅ Databases created successfully

REM Create application user
echo 👤 Creating application user...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '%APP_USER%') THEN CREATE USER %APP_USER% WITH PASSWORD '%APP_PASSWORD%'; END IF; END $$;" >nul 2>nul
if %errorlevel% neq 0 echo ⚠️  User %APP_USER% might already exist

psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME_DEV% TO %APP_USER%; GRANT ALL PRIVILEGES ON DATABASE %DB_NAME_TEST% TO %APP_USER%; GRANT ALL PRIVILEGES ON DATABASE %DB_NAME_PROD% TO %APP_USER%;" >nul 2>nul
echo ✅ Application user created and configured

REM Run migrations
echo 📦 Running database migrations...
if not exist "migrations\001_initial_schema.sql" (
    echo ❌ Migration file 001_initial_schema.sql not found
    exit /b 1
)

if not exist "migrations\002_seed_data.sql" (
    echo ❌ Migration file 002_seed_data.sql not found
    exit /b 1
)

echo Running migrations on development database...
set PGPASSWORD=%APP_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME_DEV% -f migrations\001_initial_schema.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to run initial schema migration
    exit /b 1
)

psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME_DEV% -f migrations\002_seed_data.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to run seed data migration
    exit /b 1
)

echo Running migrations on test database...
psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME_TEST% -f migrations\001_initial_schema.sql
psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME_TEST% -f migrations\002_seed_data.sql
echo ✅ Migrations completed successfully

REM Verify setup
echo 🔍 Verifying database setup...
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %APP_USER% -d %DB_NAME_DEV% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"') do set TABLE_COUNT=%%i
set TABLE_COUNT=!TABLE_COUNT: =!

if !TABLE_COUNT! lss 10 (
    echo ❌ Development database setup incomplete. Expected at least 10 tables, found !TABLE_COUNT!
    exit /b 1
)
echo ✅ Development database has !TABLE_COUNT! tables

REM Create environment file
echo 📝 Creating environment configuration...
(
echo # Database Configuration
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_USER=%APP_USER%
echo DB_PASSWORD=%APP_PASSWORD%
echo.
echo # Database Names
echo DB_NAME_DEV=%DB_NAME_DEV%
echo DB_NAME_TEST=%DB_NAME_TEST%
echo DB_NAME_PROD=%DB_NAME_PROD%
echo.
echo # Connection Pool Settings
echo DB_POOL_MIN=2
echo DB_POOL_MAX=20
echo DB_POOL_IDLE_TIMEOUT=30000
echo DB_POOL_CONNECTION_TIMEOUT=2000
echo.
echo # SSL Settings ^(for production^)
echo DB_SSL=false
) > .env.database
echo ✅ Environment file created: .env.database

REM Display information
echo.
echo 📋 Database Setup Complete!
echo ==================================================
echo ✅ Database Information:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   User: %APP_USER%
echo   Development DB: %DB_NAME_DEV%
echo   Test DB: %DB_NAME_TEST%
echo   Production DB: %DB_NAME_PROD%
echo.
echo ✅ Connection Strings:
echo   Development: postgresql://%APP_USER%:%APP_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME_DEV%
echo   Test: postgresql://%APP_USER%:%APP_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME_TEST%
echo   Production: postgresql://%APP_USER%:%APP_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME_PROD%
echo.
echo ✅ Next Steps:
echo   1. Copy .env.database to your application's .env file
echo   2. Test database connection in your application
echo   3. Run your application's database tests
echo   4. Set up database monitoring and backups
echo.
echo ⚠️  Security Note:
echo   Remember to change the default passwords in production!
echo   Consider using environment variables or secret management.
echo.
echo 🎉 Database infrastructure setup completed successfully!

endlocal

#!/bin/bash

# Database Setup Script for Diet Game
# Week 1: Core Backend Development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME_DEV=${DB_NAME_DEV:-dietgame_dev}
DB_NAME_TEST=${DB_NAME_TEST:-dietgame_test}
DB_NAME_PROD=${DB_NAME_PROD:-dietgame_prod}
APP_USER=${APP_USER:-dietgame_user}
APP_PASSWORD=${APP_PASSWORD:-secure_password}

echo -e "${BLUE}🚀 Setting up Diet Game Database Infrastructure${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${BLUE}🔍 Checking PostgreSQL connection...${NC}"
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) not found. Please install PostgreSQL."
        exit 1
    fi
    
    if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
        print_error "Cannot connect to PostgreSQL. Please check your connection settings."
        echo "Host: $DB_HOST"
        echo "Port: $DB_PORT"
        echo "User: $DB_USER"
        exit 1
    fi
    
    print_status "PostgreSQL connection successful"
}

# Function to create databases
create_databases() {
    echo -e "${BLUE}🗄️  Creating databases...${NC}"
    
    # Create development database
    echo "Creating development database: $DB_NAME_DEV"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME_DEV;" 2>/dev/null || print_warning "Database $DB_NAME_DEV might already exist"
    
    # Create test database
    echo "Creating test database: $DB_NAME_TEST"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME_TEST;" 2>/dev/null || print_warning "Database $DB_NAME_TEST might already exist"
    
    # Create production database
    echo "Creating production database: $DB_NAME_PROD"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME_PROD;" 2>/dev/null || print_warning "Database $DB_NAME_PROD might already exist"
    
    print_status "Databases created successfully"
}

# Function to create application user
create_app_user() {
    echo -e "${BLUE}👤 Creating application user...${NC}"
    
    # Create user if it doesn't exist
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$APP_USER') THEN
                CREATE USER $APP_USER WITH PASSWORD '$APP_PASSWORD';
            END IF;
        END
        \$\$;" 2>/dev/null || print_warning "User $APP_USER might already exist"
    
    # Grant privileges
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_DEV TO $APP_USER;
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_TEST TO $APP_USER;
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME_PROD TO $APP_USER;" 2>/dev/null
    
    print_status "Application user created and configured"
}

# Function to run migrations
run_migrations() {
    echo -e "${BLUE}📦 Running database migrations...${NC}"
    
    # Check if migration files exist
    if [ ! -f "migrations/001_initial_schema.sql" ]; then
        print_error "Migration file 001_initial_schema.sql not found"
        exit 1
    fi
    
    if [ ! -f "migrations/002_seed_data.sql" ]; then
        print_error "Migration file 002_seed_data.sql not found"
        exit 1
    fi
    
    # Run migrations on development database
    echo "Running migrations on development database..."
    PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -f migrations/001_initial_schema.sql
    PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -f migrations/002_seed_data.sql
    
    # Run migrations on test database
    echo "Running migrations on test database..."
    PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_TEST -f migrations/001_initial_schema.sql
    PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_TEST -f migrations/002_seed_data.sql
    
    print_status "Migrations completed successfully"
}

# Function to verify setup
verify_setup() {
    echo -e "${BLUE}🔍 Verifying database setup...${NC}"
    
    # Check tables in development database
    echo "Checking tables in development database..."
    TABLE_COUNT=$(PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    if [ "$TABLE_COUNT" -ge 10 ]; then
        print_status "Development database has $TABLE_COUNT tables"
    else
        print_error "Development database setup incomplete. Expected at least 10 tables, found $TABLE_COUNT"
        exit 1
    fi
    
    # Check sample data
    echo "Checking sample data..."
    USER_COUNT=$(PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
    ACHIEVEMENT_COUNT=$(PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -t -c "SELECT COUNT(*) FROM achievements;" | tr -d ' ')
    QUEST_COUNT=$(PGPASSWORD=$APP_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $APP_USER -d $DB_NAME_DEV -t -c "SELECT COUNT(*) FROM quests;" | tr -d ' ')
    
    print_status "Sample data loaded: $USER_COUNT users, $ACHIEVEMENT_COUNT achievements, $QUEST_COUNT quests"
}

# Function to create environment file
create_env_file() {
    echo -e "${BLUE}📝 Creating environment configuration...${NC}"
    
    cat > .env.database << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$APP_USER
DB_PASSWORD=$APP_PASSWORD

# Database Names
DB_NAME_DEV=$DB_NAME_DEV
DB_NAME_TEST=$DB_NAME_TEST
DB_NAME_PROD=$DB_NAME_PROD

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# SSL Settings (for production)
DB_SSL=false
EOF
    
    print_status "Environment file created: .env.database"
}

# Function to display connection information
display_info() {
    echo -e "${BLUE}📋 Database Setup Complete!${NC}"
    echo "=================================================="
    echo -e "${GREEN}Database Information:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $APP_USER"
    echo "  Development DB: $DB_NAME_DEV"
    echo "  Test DB: $DB_NAME_TEST"
    echo "  Production DB: $DB_NAME_PROD"
    echo ""
    echo -e "${GREEN}Connection Strings:${NC}"
    echo "  Development: postgresql://$APP_USER:$APP_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME_DEV"
    echo "  Test: postgresql://$APP_USER:$APP_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME_TEST"
    echo "  Production: postgresql://$APP_USER:$APP_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME_PROD"
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "  1. Copy .env.database to your application's .env file"
    echo "  2. Test database connection in your application"
    echo "  3. Run your application's database tests"
    echo "  4. Set up database monitoring and backups"
    echo ""
    echo -e "${YELLOW}Security Note:${NC}"
    echo "  Remember to change the default passwords in production!"
    echo "  Consider using environment variables or secret management."
}

# Main execution
main() {
    echo "Starting database setup..."
    echo ""
    
    check_postgres
    create_databases
    create_app_user
    run_migrations
    verify_setup
    create_env_file
    display_info
    
    echo ""
    print_status "Database infrastructure setup completed successfully! 🎉"
}

# Run main function
main "$@"

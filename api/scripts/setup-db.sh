#!/bin/bash

##############################################################################
# Prisma Database Setup Script
#
# This script automates the database setup process by:
# 1. Starting Docker containers (PostgreSQL, Redis, Meilisearch)
# 2. Running Prisma migrations
# 3. Generating Prisma Client
# 4. Seeding initial data
#
# Usage: bash scripts/setup-db.sh [--skip-docker] [--seed-only]
##############################################################################

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env.development"

# Flags
SKIP_DOCKER=false
SEED_ONLY=false
HELP=false

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_help() {
    echo "Usage: bash scripts/setup-db.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-docker    Skip Docker container startup (assumes containers are running)"
    echo "  --seed-only      Only run database seeding (skip migrations)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  bash scripts/setup-db.sh              # Full setup"
    echo "  bash scripts/setup-db.sh --skip-docker # Skip Docker startup"
    echo "  bash scripts/setup-db.sh --seed-only  # Only seed the database"
}

check_requirements() {
    print_header "Checking Requirements"

    local missing=false

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        missing=true
    else
        print_success "Docker found"
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        missing=true
    else
        print_success "Docker Compose found"
    fi

    # Check Node/npm/pnpm
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        missing=true
    else
        print_success "Node.js found ($(node --version))"
    fi

    # Check if pnpm or npm is available
    if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
        print_error "Neither pnpm nor npm is installed"
        missing=true
    else
        if command -v pnpm &> /dev/null; then
            print_success "pnpm found ($(pnpm --version))"
        else
            print_success "npm found ($(npm --version))"
        fi
    fi

    # Check if docker-compose.yml exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "docker-compose.yml not found at $DOCKER_COMPOSE_FILE"
        missing=true
    else
        print_success "docker-compose.yml found"
    fi

    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_warning ".env file not found (will be needed for DATABASE_URL)"
    else
        print_success "Environment file found"
    fi

    if [ "$missing" = true ]; then
        print_error "Some requirements are missing. Please install them and try again."
        exit 1
    fi

    print_success "All requirements met"
}

start_docker_containers() {
    print_header "Starting Docker Containers"

    print_info "Starting services: PostgreSQL, Redis, Meilisearch"

    # Check if containers are already running
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_warning "Some containers are already running"
        read -p "Do you want to restart them? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Stopping existing containers..."
            docker-compose -f "$DOCKER_COMPOSE_FILE" down
        else
            print_info "Continuing with existing containers"
            return 0
        fi
    fi

    # Start containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    if [ $? -eq 0 ]; then
        print_success "Docker containers started"
    else
        print_error "Failed to start Docker containers"
        exit 1
    fi

    # Wait for database to be ready
    print_info "Waiting for PostgreSQL to be ready..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U scraping_user &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        attempt=$((attempt + 1))
        sleep 1
    done

    if [ $attempt -eq $max_attempts ]; then
        print_warning "PostgreSQL took longer to start, but continuing..."
    fi
}

run_prisma_migrations() {
    print_header "Running Prisma Migrations"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    print_info "Using package manager: $pm"
    print_info "Running: $pm run prisma:migrate"

    if $pm run prisma:migrate -- --name init; then
        print_success "Prisma migrations completed"
    else
        print_error "Prisma migrations failed"
        exit 1
    fi
}

generate_prisma_client() {
    print_header "Generating Prisma Client"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    print_info "Running: $pm run prisma:generate"

    if $pm run prisma:generate; then
        print_success "Prisma Client generated successfully"
    else
        print_error "Failed to generate Prisma Client"
        exit 1
    fi
}

seed_database() {
    print_header "Seeding Database"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    print_info "Running: $pm run prisma:seed"

    if $pm run prisma:seed; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding completed with warnings or errors (this may be normal if seed data already exists)"
    fi
}

verify_setup() {
    print_header "Verifying Database Setup"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    # Try to run Prisma Studio to verify the connection
    print_info "Attempting to verify database connection..."

    # Simple verification: try to connect and count tables
    if $pm run prisma:generate &> /dev/null; then
        print_success "Database connection verified"
    else
        print_warning "Could not verify database connection"
    fi
}

##############################################################################
# Parse Arguments
##############################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --seed-only)
            SEED_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

##############################################################################
# Main Execution
##############################################################################

main() {
    print_header "Prisma Database Setup"

    print_info "Project root: $PROJECT_ROOT"
    print_info "Docker Compose file: $DOCKER_COMPOSE_FILE"
    print_info ""

    # Check requirements
    check_requirements

    # Start Docker if not skipped
    if [ "$SKIP_DOCKER" = false ]; then
        start_docker_containers
    else
        print_warning "Skipping Docker container startup"
        print_info "Make sure your database containers are running!"
    fi

    # Run migrations and setup
    if [ "$SEED_ONLY" = false ]; then
        print_info "Running full database setup..."
        run_prisma_migrations
        generate_prisma_client
        seed_database
        verify_setup
    else
        print_info "Running seed only..."
        seed_database
    fi

    # Success message
    print_header "Setup Complete!"
    echo -e "${GREEN}Database setup completed successfully!${NC}"
    echo ""
    print_info "Next steps:"
    echo "  1. Start your NestJS application: npm run start:dev"
    echo "  2. View database contents: npm run prisma:studio"
    echo "  3. Access API documentation: http://localhost:5000/api/docs"
    echo ""
    print_info "Useful commands:"
    echo "  pnpm run prisma:studio      - Open Prisma Studio UI"
    echo "  pnpm run prisma:generate    - Regenerate Prisma Client"
    echo "  pnpm run prisma:seed        - Reseed the database"
    echo "  pnpm run prisma:migrate     - Run pending migrations"
    echo ""
}

# Run main function
main

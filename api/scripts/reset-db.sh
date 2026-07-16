#!/bin/bash

##############################################################################
# Database Reset Script
#
# This script safely resets the database by:
# 1. Backing up the current database (optional)
# 2. Deleting all data and recreating schema
# 3. Re-running migrations
# 4. Optionally reseeding with initial data
#
# WARNING: This will DELETE ALL DATA in the database!
#
# Usage: bash scripts/reset-db.sh [--backup] [--no-seed]
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
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Flags
BACKUP=false
NO_SEED=false

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

confirm_reset() {
    print_warning "This will DELETE ALL DATA in your database!"
    print_warning "This action cannot be undone!"
    echo ""
    read -p "Are you absolutely sure? Type 'yes' to confirm: " -r
    echo
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_info "Reset cancelled"
        exit 0
    fi
}

backup_database() {
    print_header "Backing Up Database"

    mkdir -p "$BACKUP_DIR"

    local backup_file="$BACKUP_DIR/prisma_backup_${TIMESTAMP}.sql"

    print_info "Backing up database to: $backup_file"

    if docker-compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres pg_dump \
        -U scraping_user \
        -d scraping_db > "$backup_file"; then
        print_success "Database backed up successfully"
        print_info "Backup location: $backup_file"
    else
        print_error "Failed to backup database"
        exit 1
    fi
}

reset_database() {
    print_header "Resetting Database"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    print_info "Running prisma migrate reset..."

    # This will delete all data and recreate the schema
    if $pm run prisma:migrate -- reset --force; then
        print_success "Database reset completed"
    else
        print_error "Failed to reset database"
        exit 1
    fi
}

reseed_database() {
    print_header "Reseeding Database"

    cd "$PROJECT_ROOT"

    # Determine which package manager to use
    local pm="npm"
    if command -v pnpm &> /dev/null; then
        pm="pnpm"
    fi

    print_info "Running: $pm run prisma:seed"

    if $pm run prisma:seed; then
        print_success "Database reseeded successfully"
    else
        print_warning "Database reseeding completed with warnings or errors"
    fi
}

##############################################################################
# Parse Arguments
##############################################################################

while [[ $# -gt 0 ]]; do
    case $1 in
        --backup)
            BACKUP=true
            shift
            ;;
        --no-seed)
            NO_SEED=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

##############################################################################
# Main Execution
##############################################################################

main() {
    print_header "Database Reset"

    print_warning "DANGER: This will permanently delete all data!"
    echo ""

    # Confirm reset
    confirm_reset

    # Backup if requested
    if [ "$BACKUP" = true ]; then
        backup_database
    fi

    # Reset database
    reset_database

    # Reseed if not disabled
    if [ "$NO_SEED" = false ]; then
        reseed_database
    fi

    # Success message
    print_header "Database Reset Complete"
    echo -e "${GREEN}Database has been successfully reset!${NC}"
    echo ""
    print_info "Next steps:"
    echo "  1. Start your application: npm run start:dev"
    echo "  2. Verify data in Prisma Studio: npm run prisma:studio"
    echo ""

    if [ "$BACKUP" = true ]; then
        print_info "Backup saved at: $BACKUP_DIR/prisma_backup_${TIMESTAMP}.sql"
    fi
}

# Run main function
main

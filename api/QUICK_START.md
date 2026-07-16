# Quick Start Guide 🚀

## One-Time Setup (First Time Only)

### 1️⃣ Install Dependencies
```bash
cd /Users/pylot/Downloads/Self/scrapping/api
pnpm install
```

### 2️⃣ Start Docker Services
```bash
docker-compose up -d
```

### 3️⃣ Initialize Database
```bash
pnpm prisma:migrate
```

**Verify Services Running:**
```bash
docker-compose ps
# Should show: postgres ✓ | redis ✓ | meilisearch ✓
```

---

## Daily Development

### ▶️ Start Development Server
```bash
pnpm start:dev
```

**Swagger API Docs**: http://localhost:5000/api/docs  
**Health Check**: http://localhost:5000/api/v1/health

### 🧪 Run Tests
```bash
pnpm test                # Run all tests once
pnpm test:watch        # Run tests in watch mode
pnpm test:cov          # Generate coverage report
```

### 🎨 Format Code
```bash
pnpm lint              # Check for linting errors
pnpm lint --fix        # Fix linting errors
pnpm format            # Format code with Prettier
```

---

## Database Management

### View Data
```bash
pnpm prisma:studio    # Opens GUI database viewer
```

### Create Migration
```bash
pnpm prisma:migrate   # After schema changes
```

### Reset Database (⚠️ Development Only)
```bash
pnpm prisma migrate reset
```

---

## Docker Commands

### ▶️ Start All Services
```bash
docker-compose up -d
```

### 🛑 Stop All Services
```bash
docker-compose down
```

### 📋 View Service Status
```bash
docker-compose ps
```

### 📝 View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f postgres      # Just PostgreSQL
docker-compose logs -f redis         # Just Redis
docker-compose logs -f meilisearch   # Just Meilisearch
```

### 🗑️ Clean Up (⚠️ Deletes Data)
```bash
docker-compose down -v
```

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:5000/api/v1` | API base URL |
| `http://localhost:5000/api/docs` | Swagger documentation |
| `http://localhost:5000/api/v1/health` | Health check |
| `http://localhost:5000/api/v1/health/live` | Liveness probe |
| `http://localhost:5000/api/v1/health/ready` | Readiness probe |

---

## Environment Variables

**File**: `.env.development`

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | development | Environment |
| `APP_PORT` | 5000 | API port |
| `DATABASE_URL` | postgresql://... | Database connection |
| `REDIS_HOST` | localhost | Redis host |
| `JWT_SECRET` | (change in prod) | JWT signing key |

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Option 1: Change in .env
APP_PORT=5001

# Option 2: Kill process using port
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker-compose logs postgres

# Check connection string
cat .env | grep DATABASE_URL
```

### Redis Connection Error
```bash
# Verify Redis is running
docker-compose logs redis

# Test connection
redis-cli ping
```

### Dependencies Installation Failed
```bash
# Clear pnpm cache
pnpm store prune

# Remove lock file and reinstall
rm pnpm-lock.yaml
pnpm install
```

### TypeScript Compilation Error
```bash
# Clear cache
rm -rf dist

# Rebuild
pnpm build
```

---

## Common Tasks

### 🔄 Restart Everything
```bash
docker-compose restart
```

### 🧹 Clean Build
```bash
rm -rf dist node_modules
pnpm install
pnpm build
```

### 📊 Check Project Health
```bash
bash verify-setup.sh
```

### 🚀 Production Build
```bash
pnpm build
```

### 🐳 Build & Run Docker Image
```bash
pnpm docker:build
pnpm docker:run
```

---

## Useful Files

| File | Purpose |
|------|---------|
| `INSTALLATION_GUIDE.md` | Detailed setup instructions |
| `PROJECT_STRUCTURE.md` | Architecture documentation |
| `SETUP_VERIFICATION.md` | Complete checklist |
| `PHASE_1_SUMMARY.md` | What was created |
| `verify-setup.sh` | Automated verification |

---

## Before Committing Code

```bash
# Check code quality
pnpm lint --fix

# Format code
pnpm format

# Run tests
pnpm test

# Ensure no TypeScript errors
pnpm build
```

---

## Example: Adding a New Feature

1. Create a new module in `src/modules/yourmodule`
2. Add tests in `src/modules/yourmodule/yourmodule.spec.ts`
3. Update database schema if needed in `prisma/schema.prisma`
4. Run: `pnpm prisma:migrate`
5. Run: `pnpm test`
6. Run: `pnpm lint --fix`
7. Commit changes

---

## Contact & Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Read: `INSTALLATION_GUIDE.md`
3. Verify: `bash verify-setup.sh`
4. Reset: `pnpm prisma migrate reset` (dev only)

---

**Last Updated**: 2026-07-16  
**Status**: ✅ Ready for Development

# API Project Structure

This is a NestJS-based API with a well-organized modular architecture.

## Project Structure Overview

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication & Authorization
│   ├── products/        # Product management
│   ├── search/          # Search functionality
│   ├── shops/           # Shop/Seller management
│   ├── providers/       # External service integrations
│   ├── cache/           # Caching layer
│   ├── queue/           # Message queue management
│   ├── jobs/            # Scheduled & background jobs
│   ├── notifications/   # Email, SMS, push notifications
│   └── admin/           # Admin dashboard & operations
│
├── common/               # Shared utilities & infrastructure
│   ├── decorators/      # Custom NestJS decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Route guards
│   ├── interceptors/    # Request/response interceptors
│   ├── pipes/           # Data transformation pipes
│   └── utils/           # Utility functions
│
├── config/               # Configuration management
├── prisma/               # Database schema & migrations
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

## Module Descriptions

### Core Modules
- **Auth**: User authentication, JWT, roles & permissions
- **Products**: Product data management and operations
- **Search**: Full-text search and advanced filtering
- **Shops**: Seller/shop management and profiles
- **Admin**: Admin operations and system management

### Infrastructure Modules
- **Providers**: External service integrations (payment, email, SMS, etc.)
- **Cache**: Redis/in-memory caching strategies
- **Queue**: Message queue and async job processing
- **Jobs**: Scheduled tasks and background jobs
- **Notifications**: Email, SMS, push, and in-app notifications

### Common Layer
- **Decorators**: Custom decorators for routes and methods
- **Filters**: Global exception handling
- **Guards**: Authentication and authorization
- **Interceptors**: Request/response logging and transformation
- **Pipes**: Data validation and transformation
- **Utils**: Reusable utility functions

## Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (if seed script exists)
npx ts-node prisma/seed.ts
```

### Running the Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Architecture Principles

1. **Modularity**: Each feature has its own module with isolated concerns
2. **Reusability**: Common utilities and infrastructure in the `common/` folder
3. **Scalability**: Support for caching, queuing, and async processing
4. **Maintainability**: Clear separation of concerns and consistent patterns
5. **Extensibility**: Easy to add new modules and features

## Best Practices

- Keep modules focused on a single responsibility
- Use DTOs for all API inputs/outputs
- Implement proper error handling with custom filters
- Use guards for authentication/authorization
- Cache frequently accessed data
- Use queues for heavy background tasks
- Follow NestJS naming conventions
- Keep business logic in services
- Use dependency injection throughout

## Development Guidelines

1. Create feature-specific modules in `src/modules/`
2. Use NestJS decorators and built-in features
3. Keep controllers thin - logic in services
4. Add proper validation to DTOs
5. Document API endpoints with Swagger/OpenAPI
6. Write unit and integration tests
7. Follow the existing code structure and patterns

## Common Tasks

### Adding a New Module
1. Create folder in `src/modules/<module-name>/`
2. Create `<module-name>.module.ts`
3. Create controller, service, and entity files
4. Add module to `app.module.ts` imports
5. Create README.md explaining the module

### Adding a Global Filter/Guard/Interceptor
1. Create in `src/common/<category>/`
2. Export from `src/common/<category>/index.ts`
3. Register in `main.ts` using `app.useGlobalFilters()`, etc.

### Database Changes
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name description`
3. Generate Prisma client: `npx prisma generate`
4. Update affected services/repositories

## Useful Commands

```bash
# Development
npm run start:dev         # Start with hot reload
npm run start:debug       # Start with debugger

# Building
npm run build            # Compile TypeScript
npm run start:prod       # Run production build

# Database
npx prisma migrate dev   # Create/apply migrations
npx prisma studio       # Open Prisma Studio
npx prisma generate     # Generate Prisma client

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage

# Linting
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

## Contributing

- Follow the established folder structure
- Use TypeScript strictly
- Write meaningful commit messages
- Update README.md when adding new modules
- Test your code before committing
- Keep dependencies up to date

## Next Steps

1. Initialize git repository
2. Set up `.env` file with environment variables
3. Configure database connection in `prisma/schema.prisma`
4. Run database migrations
5. Start developing feature modules
6. Set up testing infrastructure
7. Configure CI/CD pipeline
8. Deploy to production

---

For more information on NestJS, visit: https://docs.nestjs.com

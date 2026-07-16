# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma:generate

# Build application
RUN pnpm build

# Runtime stage
FROM node:20

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Copy package files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy prisma schema first
COPY --from=builder /app/prisma ./prisma

# Install all dependencies (including dev for development)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client in runtime stage
RUN pnpm prisma:generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -m -u 1001 -g nodejs nestjs

USER nestjs

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run application using dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

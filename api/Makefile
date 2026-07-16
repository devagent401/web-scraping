.PHONY: help install dev build test lint format docker-build docker-up docker-down db-migrate db-seed clean

help:
	@echo "Available commands:"
	@echo "  make install          - Install dependencies"
	@echo "  make dev              - Start development server"
	@echo "  make build            - Build for production"
	@echo "  make test             - Run tests"
	@echo "  make lint             - Run ESLint"
	@echo "  make format           - Run Prettier"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-up        - Start Docker Compose"
	@echo "  make docker-down      - Stop Docker Compose"
	@echo "  make db-migrate       - Run database migrations"
	@echo "  make db-seed          - Seed database"
	@echo "  make clean            - Clean build artifacts"

install:
	pnpm install

dev:
	pnpm start:dev

build:
	pnpm build

test:
	pnpm test

test-watch:
	pnpm test:watch

test-cov:
	pnpm test:cov

test-e2e:
	pnpm test:e2e

lint:
	pnpm lint

format:
	pnpm format

docker-build:
	pnpm docker:build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

db-migrate:
	pnpm prisma:migrate

db-seed:
	pnpm prisma:seed

db-studio:
	pnpm prisma:studio

clean:
	rm -rf dist coverage .eslintcache

all: clean install build test

.DEFAULT_GOAL := help

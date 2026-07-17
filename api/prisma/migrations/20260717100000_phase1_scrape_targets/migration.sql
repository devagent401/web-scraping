-- CreateEnum
CREATE TYPE "CategorySource" AS ENUM ('MANUAL', 'FROM_URL');

-- AlterEnum: JobStatus already exists

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "source" "CategorySource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_scrape_targets" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastScrapedAt" TIMESTAMP(3),
    "lastScrapeStatus" "JobStatus",
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_scrape_targets_pkey" PRIMARY KEY ("id")
);

-- AlterTable products
ALTER TABLE "products" ADD COLUMN "externalUrl" TEXT;
ALTER TABLE "products" ADD COLUMN "lastScrapedAt" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "products" ADD COLUMN "shopId" TEXT;

-- AlterTable scrape_jobs
ALTER TABLE "scrape_jobs" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "scrape_jobs" ADD COLUMN "targetId" TEXT;

-- AlterTable prices / price_history default currency
ALTER TABLE "prices" ALTER COLUMN "currency" SET DEFAULT 'BDT';
ALTER TABLE "price_history" ALTER COLUMN "currency" SET DEFAULT 'BDT';

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_name_idx" ON "categories"("name");

CREATE UNIQUE INDEX "products_externalUrl_key" ON "products"("externalUrl");
CREATE INDEX "products_shopId_idx" ON "products"("shopId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

CREATE UNIQUE INDEX "shop_scrape_targets_shopId_categoryId_url_key" ON "shop_scrape_targets"("shopId", "categoryId", "url");
CREATE INDEX "shop_scrape_targets_shopId_idx" ON "shop_scrape_targets"("shopId");
CREATE INDEX "shop_scrape_targets_categoryId_idx" ON "shop_scrape_targets"("categoryId");
CREATE INDEX "shop_scrape_targets_isActive_idx" ON "shop_scrape_targets"("isActive");

CREATE INDEX "scrape_jobs_targetId_idx" ON "scrape_jobs"("targetId");

-- AddForeignKey
ALTER TABLE "shop_scrape_targets" ADD CONSTRAINT "shop_scrape_targets_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shop_scrape_targets" ADD CONSTRAINT "shop_scrape_targets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "scrape_jobs" DROP CONSTRAINT IF EXISTS "scrape_jobs_userId_fkey";
ALTER TABLE "scrape_jobs" ADD CONSTRAINT "scrape_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "scrape_jobs" ADD CONSTRAINT "scrape_jobs_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "shop_scrape_targets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

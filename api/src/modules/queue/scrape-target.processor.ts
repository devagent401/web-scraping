import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { JobStatus, ScrapeType } from '@prisma/client';
import { Job } from 'bullmq';

import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { ScraperRegistry } from '../providers/scrapers/scraper.registry';
import { MeilisearchService } from '../search/meilisearch.service';
import { ProductSearchDocument } from '../search/product-document.interface';

import {
  SCRAPE_TARGETS_QUEUE,
  ScrapeTargetJobData,
} from './scrape-queue.constants';

@Processor(SCRAPE_TARGETS_QUEUE)
export class ScrapeTargetProcessor extends WorkerHost {
  private readonly logger = new Logger(ScrapeTargetProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scrapers: ScraperRegistry,
    private readonly products: ProductsService,
    private readonly meili: MeilisearchService,
  ) {
    super();
  }

  async process(job: Job<ScrapeTargetJobData>): Promise<{
    created: number;
    updated: number;
    total: number;
  }> {
    const { targetId, triggeredBy } = job.data;
    this.logger.log(`Processing scrape target ${targetId}`);

    const target = await this.prisma.shopScrapeTarget.findUnique({
      where: { id: targetId },
      include: { shop: true, category: true },
    });

    if (!target) {
      throw new Error(`Scrape target ${targetId} not found`);
    }

    if (!target.isActive) {
      this.logger.warn(`Target ${targetId} is inactive; skipping`);
      return { created: 0, updated: 0, total: 0 };
    }

    const scraper = this.scrapers.get(target.shop.provider);
    if (!scraper) {
      const msg = `No scraper registered for provider "${target.shop.provider}"`;
      await this.markFailed(targetId, msg);
      throw new Error(msg);
    }

    const scrapeJob = await this.prisma.scrapeJob.create({
      data: {
        userId: triggeredBy ?? null,
        targetId: target.id,
        name: `Scrape ${target.shop.name} / ${target.category.name}`,
        url: target.url,
        type: ScrapeType.PLAYWRIGHT,
        status: JobStatus.RUNNING,
      },
    });

    const started = Date.now();

    try {
      await this.prisma.shopScrapeTarget.update({
        where: { id: targetId },
        data: { lastScrapeStatus: JobStatus.RUNNING, lastError: null },
      });

      const parsed = await scraper.scrape(target.url, { maxPages: 5 });
      const { created, updated, products } =
        await this.products.upsertScrapedBatch(
          parsed,
          target.shopId,
          target.categoryId,
        );

      const docs: ProductSearchDocument[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        shop: target.shop.name,
        shopId: target.shopId,
        category: target.category.name,
        categorySlug: target.category.slug,
        url: p.externalUrl || p.url || '',
        image: p.image,
        updatedAt: (p.lastScrapedAt ?? p.updatedAt).getTime(),
      }));

      await this.meili.indexProducts(docs);

      const duration = Date.now() - started;

      await this.prisma.scrapeResult.create({
        data: {
          jobId: scrapeJob.id,
          data: {
            created,
            updated,
            total: products.length,
            sample: parsed.slice(0, 5),
          } as object,
          statusCode: 200,
          duration,
          indexed: true,
          indexedAt: new Date(),
        },
      });

      await this.prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          status: JobStatus.COMPLETED,
          lastRunAt: new Date(),
        },
      });

      await this.prisma.shopScrapeTarget.update({
        where: { id: targetId },
        data: {
          lastScrapedAt: new Date(),
          lastScrapeStatus: JobStatus.COMPLETED,
          lastError: null,
        },
      });

      this.logger.log(
        `Target ${targetId} done: +${created} / ~${updated} (${products.length} total)`,
      );

      return { created, updated, total: products.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const duration = Date.now() - started;

      await this.prisma.scrapeResult.create({
        data: {
          jobId: scrapeJob.id,
          data: {},
          error: message,
          duration,
        },
      });

      await this.prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: { status: JobStatus.FAILED },
      });

      await this.markFailed(targetId, message);
      throw err;
    }
  }

  private async markFailed(targetId: string, error: string): Promise<void> {
    await this.prisma.shopScrapeTarget.update({
      where: { id: targetId },
      data: {
        lastScrapeStatus: JobStatus.FAILED,
        lastError: error.slice(0, 2000),
        lastScrapedAt: new Date(),
      },
    });
  }
}

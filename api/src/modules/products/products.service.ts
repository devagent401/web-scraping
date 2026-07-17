import { Injectable, Logger } from '@nestjs/common';
import { Product } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { ParsedProduct } from '../providers/scrapers/scraper.interface';

export interface UpsertBatchResult {
  created: number;
  updated: number;
  products: Product[];
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert scraped products by externalUrl.
   * Updates Price for today and appends PriceHistory when price changes.
   */
  async upsertScrapedBatch(
    items: ParsedProduct[],
    shopId: string,
    categoryId: string,
  ): Promise<UpsertBatchResult> {
    let created = 0;
    let updated = 0;
    const products: Product[] = [];
    const now = new Date();
    const dayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    for (const item of items) {
      try {
        const existing = await this.prisma.product.findUnique({
          where: { externalUrl: item.productUrl },
        });

        const previousPrice = existing?.price ?? null;

        const product = await this.prisma.product.upsert({
          where: { externalUrl: item.productUrl },
          create: {
            name: item.name,
            price: item.price,
            image: item.image,
            url: item.productUrl,
            externalUrl: item.productUrl,
            sku: item.sku,
            shopId,
            categoryId,
            lastScrapedAt: now,
          },
          update: {
            name: item.name,
            price: item.price,
            image: item.image ?? undefined,
            url: item.productUrl,
            sku: item.sku ?? undefined,
            shopId,
            categoryId,
            lastScrapedAt: now,
          },
        });

        if (existing) {
          updated++;
        } else {
          created++;
        }

        await this.prisma.price.upsert({
          where: {
            productId_shopId_date: {
              productId: product.id,
              shopId,
              date: dayStart,
            },
          },
          create: {
            productId: product.id,
            shopId,
            price: item.price,
            currency: item.currency || 'BDT',
            date: dayStart,
          },
          update: {
            price: item.price,
            currency: item.currency || 'BDT',
          },
        });

        if (previousPrice !== null && previousPrice !== item.price) {
          const change =
            previousPrice === 0
              ? 0
              : ((item.price - previousPrice) / previousPrice) * 100;
          await this.prisma.priceHistory.create({
            data: {
              productId: product.id,
              price: item.price,
              currency: item.currency || 'BDT',
              priceChange: Math.round(change * 100) / 100,
              note: 'Scraped price update',
              date: now,
            },
          });
        } else if (!existing) {
          await this.prisma.priceHistory.create({
            data: {
              productId: product.id,
              price: item.price,
              currency: item.currency || 'BDT',
              note: 'Initial scrape',
              date: now,
            },
          });
        }

        products.push(product);
      } catch (err) {
        this.logger.warn(
          `Failed to upsert ${item.productUrl}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { created, updated, products };
  }
}

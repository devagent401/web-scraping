import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

import { ProductSearchDocument } from './product-document.interface';

const INDEX_UID = 'products';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client!: MeiliSearch;
  private index!: Index<ProductSearchDocument>;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host =
      this.config.get<string>('meilisearch.host') ||
      process.env.MEILISEARCH_HOST ||
      'http://localhost:7700';
    const apiKey =
      this.config.get<string>('meilisearch.apiKey') ||
      process.env.MEILISEARCH_API_KEY ||
      'masterKey';

    this.client = new MeiliSearch({ host, apiKey });
    await this.ensureIndex();
  }

  private async ensureIndex(): Promise<void> {
    try {
      try {
        await this.client.getIndex(INDEX_UID);
      } catch {
        await this.client.createIndex(INDEX_UID, { primaryKey: 'id' });
        this.logger.log(`Created Meilisearch index "${INDEX_UID}"`);
      }

      this.index = this.client.index<ProductSearchDocument>(INDEX_UID);

      await this.index.updateSettings({
        searchableAttributes: ['name', 'category'],
        filterableAttributes: ['shopId', 'categorySlug', 'shop'],
        sortableAttributes: ['price', 'updatedAt'],
        displayedAttributes: [
          'id',
          'name',
          'price',
          'shop',
          'shopId',
          'category',
          'categorySlug',
          'url',
          'image',
          'updatedAt',
        ],
        typoTolerance: {
          enabled: true,
          minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
        },
      });

      this.logger.log(`Meilisearch index "${INDEX_UID}" ready`);
    } catch (err) {
      this.logger.error(
        `Failed to init Meilisearch: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async indexProducts(docs: ProductSearchDocument[]): Promise<void> {
    if (docs.length === 0) return;
    try {
      await this.index.addDocuments(docs);
      this.logger.log(`Indexed ${docs.length} products in Meilisearch`);
    } catch (err) {
      this.logger.error(
        `Meilisearch index failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
  }

  async search(
    query: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<{ hits: ProductSearchDocument[]; estimatedTotalHits: number }> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    try {
      const result = await this.index.search(query, {
        limit,
        offset,
        attributesToRetrieve: [
          'id',
          'name',
          'price',
          'shop',
          'shopId',
          'category',
          'categorySlug',
          'url',
          'image',
          'updatedAt',
        ],
      });

      return {
        hits: (result.hits as ProductSearchDocument[]) ?? [],
        estimatedTotalHits: result.estimatedTotalHits ?? result.hits.length,
      };
    } catch (err) {
      this.logger.error(
        `Meilisearch search failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { hits: [], estimatedTotalHits: 0 };
    }
  }
}

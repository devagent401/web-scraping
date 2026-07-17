import { Injectable } from '@nestjs/common';

import { DarazScraper } from './daraz.scraper';
import { StoreScraper } from './scraper.interface';

@Injectable()
export class ScraperRegistry {
  private readonly scrapers: Map<string, StoreScraper>;

  constructor(daraz: DarazScraper) {
    this.scrapers = new Map([[daraz.provider, daraz]]);
  }

  get(provider: string): StoreScraper | undefined {
    return this.scrapers.get(provider.toLowerCase());
  }

  has(provider: string): boolean {
    return this.scrapers.has(provider.toLowerCase());
  }
}

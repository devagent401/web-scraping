import { Module } from '@nestjs/common';

import { DarazScraper } from './scrapers/daraz.scraper';
import { ScraperRegistry } from './scrapers/scraper.registry';

@Module({
  providers: [DarazScraper, ScraperRegistry],
  exports: [DarazScraper, ScraperRegistry],
})
export class ProvidersModule {}

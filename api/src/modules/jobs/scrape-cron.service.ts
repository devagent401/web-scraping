import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ScrapeQueueService } from '../queue/scrape-queue.service';

@Injectable()
export class ScrapeCronService {
  private readonly logger = new Logger(ScrapeCronService.name);

  constructor(private readonly scrapeQueue: ScrapeQueueService) {}

  /** Daily at 2:00 AM server time */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyScrape(): Promise<void> {
    this.logger.log('Daily scrape cron started');
    try {
      const { enqueued } = await this.scrapeQueue.enqueueAllActive();
      this.logger.log(`Daily scrape enqueued ${enqueued} targets`);
    } catch (err) {
      this.logger.error(
        `Daily scrape failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

import { Module } from '@nestjs/common';

import { QueueModule } from '../queue/queue.module';

import { ScrapeCronService } from './scrape-cron.service';

@Module({
  imports: [QueueModule],
  providers: [ScrapeCronService],
  exports: [ScrapeCronService],
})
export class JobsModule {}

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DatabaseModule } from '../../database/database.module';
import { ProductsModule } from '../products/products.module';
import { ProvidersModule } from '../providers/providers.module';
import { SearchModule } from '../search/search.module';

import { SCRAPE_TARGETS_QUEUE } from './scrape-queue.constants';
import { ScrapeQueueService } from './scrape-queue.service';
import { ScrapeTargetProcessor } from './scrape-target.processor';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ProvidersModule,
    ProductsModule,
    SearchModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host:
            config.get<string>('redis.host') ||
            process.env.REDIS_HOST ||
            'localhost',
          port:
            config.get<number>('redis.port') ||
            parseInt(process.env.REDIS_PORT || '6379', 10),
          password: config.get<string>('redis.password') || undefined,
          db: config.get<number>('redis.db') ?? 0,
        },
      }),
    }),
    BullModule.registerQueue({ name: SCRAPE_TARGETS_QUEUE }),
  ],
  providers: [ScrapeQueueService, ScrapeTargetProcessor],
  exports: [ScrapeQueueService, BullModule],
})
export class QueueModule {}

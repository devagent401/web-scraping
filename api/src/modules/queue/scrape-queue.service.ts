import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PrismaService } from '../../database/prisma.service';

import {
  SCRAPE_TARGETS_QUEUE,
  ScrapeTargetJobData,
} from './scrape-queue.constants';

@Injectable()
export class ScrapeQueueService {
  constructor(
    @InjectQueue(SCRAPE_TARGETS_QUEUE) private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async enqueueTarget(
    targetId: string,
    triggeredBy?: string,
  ): Promise<{ jobId: string }> {
    const job = await this.queue.add(
      'scrape-target',
      { targetId, triggeredBy } satisfies ScrapeTargetJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
    return { jobId: String(job.id) };
  }

  async enqueueAllActive(): Promise<{ enqueued: number }> {
    const targets = await this.prisma.shopScrapeTarget.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const t of targets) {
      await this.enqueueTarget(t.id);
    }

    return { enqueued: targets.length };
  }
}

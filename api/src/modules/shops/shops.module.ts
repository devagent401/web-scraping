import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';

/**
 * Shops domain module — CRUD is exposed via AdminModule for Phase 1.
 * Kept for future public shop listing endpoints.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ShopsModule {}

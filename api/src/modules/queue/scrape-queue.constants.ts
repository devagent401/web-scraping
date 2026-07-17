export const SCRAPE_TARGETS_QUEUE = 'scrape-targets';

export interface ScrapeTargetJobData {
  targetId: string;
  triggeredBy?: string; // userId if manual
}

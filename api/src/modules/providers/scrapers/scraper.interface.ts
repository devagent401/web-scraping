export interface ParsedProduct {
  name: string;
  price: number;
  currency: string;
  image?: string;
  productUrl: string;
  sku?: string;
}

export interface ScrapeOptions {
  maxPages?: number;
  timeout?: number;
  userAgent?: string;
}

export interface StoreScraper {
  readonly provider: string;
  scrape(url: string, options?: ScrapeOptions): Promise<ParsedProduct[]>;
}

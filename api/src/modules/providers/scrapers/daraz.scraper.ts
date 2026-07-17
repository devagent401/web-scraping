import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium, Browser } from 'playwright';

import {
  ParsedProduct,
  ScrapeOptions,
  StoreScraper,
} from './scraper.interface';

/**
 * Daraz BD category/listing scraper.
 * Prefers Daraz's `?ajax=true` JSON endpoint; falls back to Playwright DOM parse.
 */
@Injectable()
export class DarazScraper implements StoreScraper {
  readonly provider = 'daraz';
  private readonly logger = new Logger(DarazScraper.name);

  constructor(private readonly config: ConfigService) {}

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ParsedProduct[]> {
    const maxPages = options.maxPages ?? 5;
    const timeout =
      options.timeout ??
      this.config.get<number>('scraper.timeout') ??
      30000;
    const userAgent =
      options.userAgent ??
      this.config.get<string>('scraper.userAgent') ??
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    const all: ParsedProduct[] = [];
    const seen = new Set<string>();

    for (let page = 1; page <= maxPages; page++) {
      const pageUrl = this.withPage(url, page);
      this.logger.log(`Scraping Daraz page ${page}: ${pageUrl}`);

      let products = await this.scrapeAjax(pageUrl, timeout, userAgent);
      if (products.length === 0) {
        this.logger.warn(
          `AJAX returned 0 products on page ${page}; trying Playwright`,
        );
        products = await this.scrapeWithPlaywright(pageUrl, timeout, userAgent);
      }

      if (products.length === 0) {
        this.logger.log(`No products on page ${page}; stopping pagination`);
        break;
      }

      let newCount = 0;
      for (const p of products) {
        if (seen.has(p.productUrl)) continue;
        seen.add(p.productUrl);
        all.push(p);
        newCount++;
      }

      if (newCount === 0) break;
    }

    this.logger.log(`Daraz scrape finished: ${all.length} products`);
    return all;
  }

  private withPage(url: string, page: number): string {
    const u = new URL(url);
    u.searchParams.set('page', String(page));
    return u.toString();
  }

  private toAjaxUrl(url: string): string {
    const u = new URL(url);
    u.searchParams.set('ajax', 'true');
    if (!u.searchParams.has('isFirstRequest')) {
      u.searchParams.set('isFirstRequest', 'true');
    }
    return u.toString();
  }

  private async scrapeAjax(
    url: string,
    timeout: number,
    userAgent: string,
  ): Promise<ParsedProduct[]> {
    const ajaxUrl = this.toAjaxUrl(url);
    try {
      const { data } = await axios.get(ajaxUrl, {
        timeout,
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://www.daraz.com.bd/',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const items = (data?.mods?.listItems ?? []) as unknown[];
      return items
        .map((raw) => this.mapListItem(raw, url))
        .filter((p): p is ParsedProduct => p !== null);
    } catch (err) {
      this.logger.warn(
        `AJAX fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  private async scrapeWithPlaywright(
    url: string,
    timeout: number,
    userAgent: string,
  ): Promise<ParsedProduct[]> {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--disable-blink-features=AutomationControlled'],
      });
      const context = await browser.newContext({
        userAgent,
        locale: 'en-BD',
        viewport: { width: 1440, height: 900 },
      });
      await context.addInitScript(
        `Object.defineProperty(navigator, 'webdriver', { get: () => undefined });`,
      );
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await new Promise((r) => setTimeout(r, 5000));
      const html = await page.content();
      return this.parseHtml(html, url);
    } catch (err) {
      this.logger.error(
        `Playwright scrape failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }

  parseHtml(html: string, baseUrl: string): ParsedProduct[] {
    return this.parseDom(html, baseUrl);
  }

  private mapListItem(raw: unknown, baseUrl: string): ParsedProduct | null {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Record<string, unknown>;

    const name = String(item.name ?? item.title ?? '').trim();
    if (!name) return null;

    const priceRaw =
      item.price ?? item.priceShow ?? item.originalPrice ?? item.discountPrice;
    const price = this.parsePrice(String(priceRaw ?? '0'));
    if (price <= 0) return null;

    let productUrl = String(
      item.itemUrl ?? item.productUrl ?? item.url ?? '',
    ).trim();
    if (!productUrl && item.itemId) {
      productUrl = `https://www.daraz.com.bd/products/i${item.itemId}.html`;
    }
    if (!productUrl) return null;
    if (productUrl.startsWith('//')) productUrl = `https:${productUrl}`;
    if (productUrl.startsWith('/')) {
      const origin = new URL(baseUrl).origin;
      productUrl = `${origin}${productUrl}`;
    }

    const imageRaw = String(
      item.image ?? item.img ?? item.thumbnail ?? item.imageUrl ?? '',
    ).trim();
    let image: string | undefined;
    if (imageRaw && !imageRaw.startsWith('data:')) {
      image = imageRaw.startsWith('//') ? `https:${imageRaw}` : imageRaw;
    }

    const sku = item.itemId
      ? String(item.itemId)
      : item.skuId
        ? String(item.skuId)
        : undefined;

    return {
      name,
      price,
      currency: 'BDT',
      image,
      productUrl: productUrl.split('?')[0],
      sku,
    };
  }

  private parseDom(html: string, baseUrl: string): ParsedProduct[] {
    const $ = cheerio.load(html);
    const products: ParsedProduct[] = [];
    const origin = new URL(baseUrl).origin;

    const cards = $(
      '[data-qa-locator="product-item"], .Bm3ON, .box--pRqdD, .gridItem--Yd0sa, .product-card',
    );

    cards.each((_, el) => {
      const card = $(el);
      const linkEl = card.find('a[href*="/products/"], a[href*="-i"]').first();
      let href = linkEl.attr('href') ?? '';
      if (!href) return;
      if (href.startsWith('//')) href = `https:${href}`;
      if (href.startsWith('/')) href = `${origin}${href}`;

      const name =
        card.find('.title--wFj93, .RfADt, [class*="title"]').first().text().trim() ||
        linkEl.attr('title')?.trim() ||
        linkEl.text().trim();
      if (!name) return;

      const priceText =
        card
          .find('.price--NVB62, .ooOxS, [class*="price"]')
          .first()
          .text()
          .trim() || '0';
      const price = this.parsePrice(priceText);
      if (price <= 0) return;

      let image =
        card.find('img').first().attr('src') ||
        card.find('img').first().attr('data-src') ||
        undefined;
      if (image?.startsWith('//')) image = `https:${image}`;

      products.push({
        name,
        price,
        currency: 'BDT',
        image,
        productUrl: href.split('?')[0],
      });
    });

    return products;
  }

  private parsePrice(raw: string): number {
    const cleaned = raw
      .replace(/[^\d.,]/g, '')
      .replace(/,/g, '')
      .trim();
    const value = parseFloat(cleaned);
    return Number.isFinite(value) ? value : 0;
  }
}

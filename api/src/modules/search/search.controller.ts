import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators';

import { SearchQueryDto } from './dto/search.dto';
import { MeilisearchService } from './meilisearch.service';

@ApiTags('Search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly meili: MeilisearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Fuzzy product search (Meilisearch)' })
  @ApiResponse({
    status: 200,
    description: 'Search results with shop, price, url, image',
  })
  async search(@Query() query: SearchQueryDto) {
    const q = (query.q || '').trim();
    if (!q) {
      return {
        query: q,
        total: 0,
        results: [],
        message: 'Provide a search query via ?q=',
      };
    }

    const { hits, estimatedTotalHits } = await this.meili.search(q, {
      limit: query.limit,
      offset: query.offset,
    });

    const results = hits.map((h) => ({
      id: h.id,
      name: h.name,
      price: h.price,
      shop: h.shop,
      url: h.url,
      image: h.image,
      category: h.category,
      updatedAt: h.updatedAt
        ? new Date(h.updatedAt).toISOString()
        : null,
    }));

    return {
      query: q,
      total: estimatedTotalHits,
      results,
      message:
        results.length === 0
          ? 'No products found. Try another query or wait for the next scrape.'
          : undefined,
    };
  }

  @Public()
  @Get('compare')
  @ApiOperation({
    summary: 'Search and group results by product name for store comparison',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparisons grouped by name with lowestPrice',
  })
  async compare(@Query() query: SearchQueryDto) {
    const base = await this.search(query);
    const groups = new Map<
      string,
      Array<(typeof base.results)[number]>
    >();

    for (const item of base.results) {
      const key = item.name.toLowerCase().trim();
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }

    return {
      query: base.query,
      total: base.total,
      comparisons: Array.from(groups.entries()).map(([name, stores]) => ({
        name: stores[0]?.name ?? name,
        stores: stores.map((s) => ({
          shop: s.shop,
          price: s.price,
          url: s.url,
          image: s.image,
          updatedAt: s.updatedAt,
        })),
        lowestPrice: Math.min(
          ...stores.map((s) => s.price ?? Number.POSITIVE_INFINITY),
        ),
      })),
      message: base.message,
    };
  }
}

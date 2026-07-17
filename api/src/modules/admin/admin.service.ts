import { Injectable } from '@nestjs/common';
import { CategorySource } from '@prisma/client';

import {
  ConflictException,
  ResourceNotFoundException,
  ValidationException,
} from '../../common/exceptions/custom.exception';
import { slugify, titleFromSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../database/prisma.service';
import { ScrapeQueueService } from '../queue/scrape-queue.service';

import {
  CreateCategoryDto,
  CreateScrapeTargetDto,
  CreateShopDto,
  UpdateScrapeTargetDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scrapeQueue: ScrapeQueueService,
  ) {}

  // --------------------------------------------------------------------------
  // Shops
  // --------------------------------------------------------------------------

  async createShop(dto: CreateShopDto) {
    const existing = await this.prisma.shop.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Shop "${dto.name}" already exists`);
    }

    return this.prisma.shop.create({
      data: {
        name: dto.name,
        url: dto.url,
        provider: dto.provider.toLowerCase(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listShops() {
    return this.prisma.shop.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { scrapeTargets: true, products: true } },
      },
    });
  }

  // --------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------

  async createCategory(dto: CreateCategoryDto) {
    const source = dto.source ?? (dto.url ? CategorySource.FROM_URL : CategorySource.MANUAL);

    let slug = dto.slug;
    let name = dto.name;

    if (source === CategorySource.FROM_URL) {
      if (!dto.url) {
        throw new ValidationException('url is required when source is FROM_URL');
      }
      slug = slugify(dto.url);
      name = name || titleFromSlug(slug);
    } else {
      if (!name && !slug) {
        throw new ValidationException('Provide name or slug for MANUAL category');
      }
      slug = slug || slugify(name!);
      name = name || titleFromSlug(slug);
    }

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category slug "${slug}" already exists`);
    }

    return this.prisma.category.create({
      data: { name, slug, source },
    });
  }

  async listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  // --------------------------------------------------------------------------
  // Scrape targets
  // --------------------------------------------------------------------------

  async createScrapeTarget(dto: CreateScrapeTargetDto) {
    const shop = await this.prisma.shop.findUnique({ where: { id: dto.shopId } });
    if (!shop) {
      throw new ResourceNotFoundException('Shop', dto.shopId);
    }

    let categoryId = dto.categoryId;

    if (!categoryId) {
      const source =
        dto.categorySource ??
        (dto.categoryName ? CategorySource.MANUAL : CategorySource.FROM_URL);
      const slug = slugify(dto.categoryName || dto.url);
      const name =
        dto.categoryName || titleFromSlug(slugify(dto.url));

      const category = await this.prisma.category.upsert({
        where: { slug },
        create: { name, slug, source },
        update: {},
      });
      categoryId = category.id;
    } else {
      const cat = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!cat) {
        throw new ResourceNotFoundException('Category', categoryId);
      }
    }

    const duplicate = await this.prisma.shopScrapeTarget.findFirst({
      where: {
        shopId: dto.shopId,
        categoryId,
        url: dto.url,
      },
    });
    if (duplicate) {
      throw new ConflictException('This scrape target already exists');
    }

    return this.prisma.shopScrapeTarget.create({
      data: {
        shopId: dto.shopId,
        categoryId,
        url: dto.url,
        isActive: dto.isActive ?? true,
      },
      include: { shop: true, category: true },
    });
  }

  async listScrapeTargets() {
    return this.prisma.shopScrapeTarget.findMany({
      orderBy: { createdAt: 'desc' },
      include: { shop: true, category: true },
    });
  }

  async updateScrapeTarget(id: string, dto: UpdateScrapeTargetDto) {
    const target = await this.prisma.shopScrapeTarget.findUnique({
      where: { id },
    });
    if (!target) {
      throw new ResourceNotFoundException('ScrapeTarget', id);
    }

    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!cat) {
        throw new ResourceNotFoundException('Category', dto.categoryId);
      }
    }

    return this.prisma.shopScrapeTarget.update({
      where: { id },
      data: {
        url: dto.url,
        isActive: dto.isActive,
        categoryId: dto.categoryId,
      },
      include: { shop: true, category: true },
    });
  }

  async runScrapeTarget(id: string, userId?: string) {
    const target = await this.prisma.shopScrapeTarget.findUnique({
      where: { id },
    });
    if (!target) {
      throw new ResourceNotFoundException('ScrapeTarget', id);
    }

    const { jobId } = await this.scrapeQueue.enqueueTarget(id, userId);
    return {
      success: true,
      targetId: id,
      queueJobId: jobId,
      message: 'Scrape job enqueued',
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import {
  AuthUser,
  AuthenticatedUser,
  Roles,
} from '../../common/decorators';

import { AdminService } from './admin.service';
import {
  CreateCategoryDto,
  CreateScrapeTargetDto,
  CreateShopDto,
  UpdateScrapeTargetDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'admin', version: '1' })
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ---- Shops ----

  @Post('shops')
  @ApiOperation({ summary: 'Create a shop (e.g. Daraz)' })
  @ApiResponse({ status: 201, description: 'Shop created' })
  @ApiResponse({ status: 403, description: 'Admin only' })
  @ApiResponse({ status: 409, description: 'Shop name already exists' })
  createShop(@Body() dto: CreateShopDto) {
    return this.admin.createShop(dto);
  }

  @Get('shops')
  @ApiOperation({ summary: 'List all shops' })
  @ApiResponse({ status: 200, description: 'List of shops with counts' })
  listShops() {
    return this.admin.listShops();
  }

  // ---- Categories ----

  @Post('categories')
  @ApiOperation({
    summary: 'Create a category (manual name/slug or derive from URL)',
  })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  listCategories() {
    return this.admin.listCategories();
  }

  // ---- Scrape targets ----

  @Post('scrape-targets')
  @ApiOperation({
    summary: 'Add a scrape target (shop + category + listing URL)',
  })
  @ApiResponse({ status: 201, description: 'Scrape target created' })
  @ApiResponse({ status: 404, description: 'Shop or category not found' })
  createScrapeTarget(@Body() dto: CreateScrapeTargetDto) {
    return this.admin.createScrapeTarget(dto);
  }

  @Get('scrape-targets')
  @ApiOperation({ summary: 'List all scrape targets' })
  @ApiResponse({ status: 200, description: 'List of scrape targets with shop/category' })
  listScrapeTargets() {
    return this.admin.listScrapeTargets();
  }

  @Patch('scrape-targets/:id')
  @ApiOperation({ summary: 'Update scrape target (URL, active flag, category)' })
  @ApiParam({ name: 'id', description: 'Scrape target id' })
  @ApiResponse({ status: 200, description: 'Updated scrape target' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateScrapeTarget(
    @Param('id') id: string,
    @Body() dto: UpdateScrapeTargetDto,
  ) {
    return this.admin.updateScrapeTarget(id, dto);
  }

  @Post('scrape-targets/:id/run')
  @ApiOperation({
    summary: 'Enqueue a manual scrape job for this target',
  })
  @ApiParam({ name: 'id', description: 'Scrape target id' })
  @ApiResponse({
    status: 201,
    description: 'Job enqueued; returns queueJobId',
  })
  @ApiResponse({ status: 404, description: 'Target not found' })
  runScrapeTarget(
    @Param('id') id: string,
    @AuthUser() user: AuthenticatedUser,
  ) {
    return this.admin.runScrapeTarget(id, user.id);
  }
}

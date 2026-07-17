import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CategorySource } from '@prisma/client';

export class CreateShopDto {
  @ApiProperty({ example: 'Daraz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'https://www.daraz.com.bd' })
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({
    example: 'daraz',
    description: 'Provider key used to pick the scraper (e.g. daraz)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  provider!: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @ApiPropertyOptional({ example: 'Mobile Phones' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'mobile-phones' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    example: 'https://www.daraz.com.bd/phones-tablets/',
    description: 'When source is FROM_URL, slug/name are derived from this',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({
    enum: CategorySource,
    example: CategorySource.FROM_URL,
  })
  @IsOptional()
  @IsEnum(CategorySource)
  source?: CategorySource;
}

export class CreateScrapeTargetDto {
  @ApiProperty({ description: 'Shop id from POST /admin/shops' })
  @IsString()
  @IsNotEmpty()
  shopId!: string;

  @ApiPropertyOptional({ description: 'Existing category id (optional)' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'Mobile Phones',
    description: 'Create category inline if categoryId not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryName?: string;

  @ApiProperty({
    example: 'https://www.daraz.com.bd/phones-tablets/',
    description: 'Category listing URL to scrape',
  })
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({
    enum: CategorySource,
    example: CategorySource.FROM_URL,
  })
  @IsOptional()
  @IsEnum(CategorySource)
  categorySource?: CategorySource;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScrapeTargetDto {
  @ApiPropertyOptional({
    example: 'https://www.daraz.com.bd/phones-tablets/',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

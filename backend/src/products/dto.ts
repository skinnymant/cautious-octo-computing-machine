import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../common/pagination';

export class QueryProductDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Slug danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Slug thương hiệu' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['featured', 'new', 'sale', 'bestseller'] })
  @IsOptional()
  @IsString()
  tag?: 'featured' | 'new' | 'sale' | 'bestseller';

  @ApiPropertyOptional({ description: 'true để chỉ lấy hàng còn kho' })
  @IsOptional()
  @IsBooleanString()
  inStock?: string;
}

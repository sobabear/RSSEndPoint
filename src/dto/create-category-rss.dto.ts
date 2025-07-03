import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCategoryRssDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  feedUrl: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
} 
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RssItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  feedUrl: string;

  @IsString()
  @IsNotEmpty()
  domain: string;
}

export class CountryRssImportDto {
  @IsString()
  @IsNotEmpty()
  countryName: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RssItemDto)
  feeds: RssItemDto[];
}

export class CategoryRssImportDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RssItemDto)
  feeds: RssItemDto[];
}

export class BulkImportRssDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryRssImportDto)
  @IsOptional()
  countries?: CountryRssImportDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryRssImportDto)
  @IsOptional()
  categories?: CategoryRssImportDto[];
} 
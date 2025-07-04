import { IsString, IsUrl, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class RssFeedItemDto {
  @IsString()
  title: string;

  @IsUrl()
  feedUrl: string;

  @IsString()
  domain: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;
}

export enum ImportSourceType {
  GITHUB_REPO = 'github_repo',
  MANUAL_DATA = 'manual_data',
  RSS_OPML = 'rss_opml',
}

export class BulkImportRssDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RssFeedItemDto)
  feeds: RssFeedItemDto[];

  @IsOptional()
  @IsEnum(ImportSourceType)
  sourceType?: ImportSourceType;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  defaultCategory?: string;

  @IsOptional()
  @IsString()
  defaultCountry?: string;
} 
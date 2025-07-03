import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCountryRssDto {
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
  countryCode?: string;

  @IsNumber()
  @IsOptional()
  countryId?: number;
} 
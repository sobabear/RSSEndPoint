import { IsString, IsOptional } from 'class-validator';

export class RssQueryDto {
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  category?: string;
} 
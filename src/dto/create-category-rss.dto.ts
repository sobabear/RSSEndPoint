import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
} 
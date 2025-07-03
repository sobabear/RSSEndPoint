import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  countryId: number;
} 
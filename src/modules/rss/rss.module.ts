import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { Country } from '../../entities/country.entity';
import { CountryRss } from '../../entities/country-rss.entity';
import { Category } from '../../entities/category.entity';
import { CategoryRss } from '../../entities/category-rss.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, CountryRss, Category, CategoryRss]),
  ],
  controllers: [RssController],
  providers: [RssService],
})
export class RssModule {} 
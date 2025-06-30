import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CountryRss } from '../../entities/country-rss.entity';
import { Category } from '../../entities/category.entity';
import { CategoryRss } from '../../entities/category-rss.entity';

@Injectable()
export class RssService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(CountryRss)
    private countryRssRepository: Repository<CountryRss>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryRss)
    private categoryRssRepository: Repository<CategoryRss>,
  ) {}

  async getAllRssByCountry(countryCode: string) {
    const country = await this.countryRepository.findOne({
      where: { code: countryCode },
      relations: ['rssFeeds'],
    });
    return country?.rssFeeds || [];
  }

  async getAllRssExceptCountry() {
    return this.categoryRssRepository.find({
      relations: ['category'],
    });
  }

  async getAllRssByCategory(categoryName: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
      relations: ['rssFeeds'],
    });
    return category?.rssFeeds || [];
  }
} 
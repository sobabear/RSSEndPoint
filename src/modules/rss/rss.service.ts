import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CountryRss } from '../../entities/country-rss.entity';
import { Category } from '../../entities/category.entity';
import { CategoryRss } from '../../entities/category-rss.entity';
import { CreateCountryRssDto } from '../../dto/create-country-rss.dto';
import { CreateCategoryRssDto } from '../../dto/create-category-rss.dto';

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

  async createCountryRss(createCountryRssDto: CreateCountryRssDto) {
    const { countryId, ...rssData } = createCountryRssDto;
    
    const country = await this.countryRepository.findOne({
      where: { id: countryId },
    });
    
    if (!country) {
      throw new Error(`Country with ID ${countryId} not found`);
    }

    const countryRss = this.countryRssRepository.create({
      ...rssData,
      country,
    });

    return this.countryRssRepository.save(countryRss);
  }

  async createCategoryRss(createCategoryRssDto: CreateCategoryRssDto) {
    const { categoryId, ...rssData } = createCategoryRssDto;
    
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    const categoryRss = this.categoryRssRepository.create({
      ...rssData,
      category,
    });

    return this.categoryRssRepository.save(categoryRss);
  }

  async getAllCountries() {
    return this.countryRepository.find();
  }

  async getAllCategories() {
    return this.categoryRepository.find();
  }
} 
import { Injectable, BadRequestException } from '@nestjs/common';
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
    const { countryId, countryCode, ...rssData } = createCountryRssDto;
    
    let country: Country | null = null;

    if (countryId) {
      country = await this.countryRepository.findOne({
        where: { id: countryId },
      });
    } else if (countryCode) {
      country = await this.countryRepository.findOne({
        where: { code: countryCode },
      });
    } else {
      // Create a default country if none specified
      country = await this.countryRepository.findOne({
        where: { code: 'US' },
      });
      
      if (!country) {
        // Create default country if it doesn't exist
        country = this.countryRepository.create({
          name: 'United States',
          code: 'US',
        });
        country = await this.countryRepository.save(country);
      }
    }
    
    if (!country) {
      throw new BadRequestException(`Country not found`);
    }

    const countryRss = this.countryRssRepository.create({
      ...rssData,
      country,
    });

    return this.countryRssRepository.save(countryRss);
  }

  async createCategoryRss(createCategoryRssDto: CreateCategoryRssDto) {
    const { categoryId, categoryName, ...rssData } = createCategoryRssDto;
    
    let category: Category | null = null;

    if (categoryId) {
      category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
    } else if (categoryName) {
      category = await this.categoryRepository.findOne({
        where: { name: categoryName },
      });
    } else {
      // Create a default category if none specified
      category = await this.categoryRepository.findOne({
        where: { name: 'General' },
      });
      
      if (!category) {
        // Create default category if it doesn't exist
        category = this.categoryRepository.create({
          name: 'General',
        });
        category = await this.categoryRepository.save(category);
      }
    }
    
    if (!category) {
      throw new BadRequestException(`Category not found`);
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
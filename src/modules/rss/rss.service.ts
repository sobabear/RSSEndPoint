import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CountryRss } from '../../entities/country-rss.entity';
import { Category } from '../../entities/category.entity';
import { CategoryRss } from '../../entities/category-rss.entity';
import { CreateCountryRssDto } from '../../dto/create-country-rss.dto';
import { CreateCategoryRssDto } from '../../dto/create-category-rss.dto';
import { BulkImportRssDto, CountryRssImportDto, CategoryRssImportDto } from '../../dto/bulk-import-rss.dto';

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

  async bulkImportRss(bulkImportDto: BulkImportRssDto) {
    const results = {
      countries: [] as any[],
      categories: [] as any[],
      errors: [] as any[],
    };

    // Import country RSS feeds
    if (bulkImportDto.countries) {
      for (const countryData of bulkImportDto.countries) {
        try {
          const countryResult = await this.importCountryRssFeeds(countryData);
          results.countries.push(countryResult);
        } catch (error) {
          results.errors.push({
            type: 'country',
            data: countryData.countryName,
            error: error.message,
          });
        }
      }
    }

    // Import category RSS feeds
    if (bulkImportDto.categories) {
      for (const categoryData of bulkImportDto.categories) {
        try {
          const categoryResult = await this.importCategoryRssFeeds(categoryData);
          results.categories.push(categoryResult);
        } catch (error) {
          results.errors.push({
            type: 'category',
            data: categoryData.categoryName,
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  private async importCountryRssFeeds(countryData: CountryRssImportDto) {
    // Find or create country
    let country = await this.countryRepository.findOne({
      where: { code: countryData.countryCode },
    });

    if (!country) {
      country = this.countryRepository.create({
        name: countryData.countryName,
        code: countryData.countryCode,
      });
      country = await this.countryRepository.save(country);
    }

    const savedFeeds: CountryRss[] = [];
    const errors: any[] = [];

    for (const feed of countryData.feeds) {
      try {
        // Check if feed already exists
        const existingFeed = await this.countryRssRepository.findOne({
          where: { feedUrl: feed.feedUrl, country: { id: country.id } },
        });

        if (!existingFeed) {
          const countryRss = this.countryRssRepository.create({
            ...feed,
            country,
          });
          const savedFeed = await this.countryRssRepository.save(countryRss);
          savedFeeds.push(savedFeed);
        }
      } catch (error) {
        errors.push({
          feed: feed.title,
          error: error.message,
        });
      }
    }

    return {
      country: country.name,
      savedFeeds: savedFeeds.length,
      errors,
    };
  }

  private async importCategoryRssFeeds(categoryData: CategoryRssImportDto) {
    // Find or create category
    let category = await this.categoryRepository.findOne({
      where: { name: categoryData.categoryName },
    });

    if (!category) {
      category = this.categoryRepository.create({
        name: categoryData.categoryName,
      });
      category = await this.categoryRepository.save(category);
    }

    const savedFeeds: CategoryRss[] = [];
    const errors: any[] = [];

    for (const feed of categoryData.feeds) {
      try {
        // Check if feed already exists
        const existingFeed = await this.categoryRssRepository.findOne({
          where: { feedUrl: feed.feedUrl, category: { id: category.id } },
        });

        if (!existingFeed) {
          const categoryRss = this.categoryRssRepository.create({
            ...feed,
            category,
          });
          const savedFeed = await this.categoryRssRepository.save(categoryRss);
          savedFeeds.push(savedFeed);
        }
      } catch (error) {
        errors.push({
          feed: feed.title,
          error: error.message,
        });
      }
    }

    return {
      category: category.name,
      savedFeeds: savedFeeds.length,
      errors,
    };
  }
} 
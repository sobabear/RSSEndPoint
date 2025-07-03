import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Country } from '../entities/country.entity';
import { CountryRss } from '../entities/country-rss.entity';
import { Category } from '../entities/category.entity';
import { CategoryRss } from '../entities/category-rss.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'rss_feed',
  entities: [Country, CountryRss, Category, CategoryRss],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
}; 
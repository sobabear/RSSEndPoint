import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssQueryDto } from '../../dto/rss-query.dto';
import { CreateCountryRssDto } from '../../dto/create-country-rss.dto';
import { CreateCategoryRssDto } from '../../dto/create-category-rss.dto';

@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('country')
  async getAllRssByCountry(@Query('code') countryCode: string) {
    return this.rssService.getAllRssByCountry(countryCode);
  }

  @Post('country')
  async createCountryRss(@Body() createCountryRssDto: CreateCountryRssDto) {
    return this.rssService.createCountryRss(createCountryRssDto);
  }

  @Get()
  async getAllRssExceptCountry() {
    return this.rssService.getAllRssExceptCountry();
  }

  @Get('category')
  async getAllRssByCategory(@Query('name') categoryName: string) {
    return this.rssService.getAllRssByCategory(categoryName);
  }

  @Post('category')
  async createCategoryRss(@Body() createCategoryRssDto: CreateCategoryRssDto) {
    return this.rssService.createCategoryRss(createCategoryRssDto);
  }

  @Get('countries')
  async getAllCountries() {
    return this.rssService.getAllCountries();
  }

  @Get('categories')
  async getAllCategories() {
    return this.rssService.getAllCategories();
  }
} 
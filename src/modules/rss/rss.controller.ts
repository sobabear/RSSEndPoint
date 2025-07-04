import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssImportService } from './rss-import.service';
import { RssQueryDto } from '../../dto/rss-query.dto';
import { CreateCountryRssDto } from '../../dto/create-country-rss.dto';
import { CreateCategoryRssDto } from '../../dto/create-category-rss.dto';
import { BulkImportRssDto } from '../../dto/bulk-import-rss.dto';

@Controller('')
export class RssController {
  constructor(
    private readonly rssService: RssService,
    private readonly rssImportService: RssImportService,
  ) {}

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

  @Post('bulk-import')
  async bulkImportRss(@Body() bulkImportRssDto: BulkImportRssDto) {
    return this.rssImportService.bulkImportRssFeeds(bulkImportRssDto);
  }

  @Post('import-from-github')
  async importFromGitHub(@Body() body: { repoUrl: string; defaultCategory?: string; defaultCountry?: string }) {
    const { repoUrl, defaultCategory = 'AI/ML', defaultCountry = 'US' } = body;
    return this.rssImportService.importFromGitHubRepo(repoUrl, defaultCategory, defaultCountry);
  }

  @Post('import-predefined-ai')
  async importPredefinedAI() {
    return this.rssImportService.importPredefinedAIFeeds();
  }
} 
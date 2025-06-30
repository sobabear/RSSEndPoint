import { Controller, Get, Query } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssQueryDto } from '../../dto/rss-query.dto';

@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('country')
  async getAllRssByCountry(@Query('code') countryCode: string) {
    return this.rssService.getAllRssByCountry(countryCode);
  }

  @Get()
  async getAllRssExceptCountry() {
    return this.rssService.getAllRssExceptCountry();
  }

  @Get('category')
  async getAllRssByCategory(@Query('name') categoryName: string) {
    return this.rssService.getAllRssByCategory(categoryName);
  }
} 
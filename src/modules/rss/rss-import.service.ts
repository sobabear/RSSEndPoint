import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../entities/country.entity';
import { CountryRss } from '../../entities/country-rss.entity';
import { Category } from '../../entities/category.entity';
import { CategoryRss } from '../../entities/category-rss.entity';
import { BulkImportRssDto, RssFeedItemDto, ImportSourceType } from '../../dto/bulk-import-rss.dto';
import axios from 'axios';

@Injectable()
export class RssImportService {
  private readonly logger = new Logger(RssImportService.name);

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

  async bulkImportRssFeeds(bulkImportDto: BulkImportRssDto) {
    const { feeds, defaultCategory = 'General', defaultCountry = 'US' } = bulkImportDto;
    
    this.logger.log(`Starting bulk import of ${feeds.length} RSS feeds`);
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      duplicates: 0,
    };

    // Ensure default category and country exist
    await this.ensureDefaultCategoryExists(defaultCategory);
    await this.ensureDefaultCountryExists(defaultCountry);

    for (const feed of feeds) {
      try {
        await this.importSingleFeed(feed, defaultCategory, defaultCountry);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorMessage = `Failed to import "${feed.title}": ${error.message}`;
        results.errors.push(errorMessage);
        this.logger.error(errorMessage);
        
        if (error.message.includes('duplicate')) {
          results.duplicates++;
        }
      }
    }

    this.logger.log(`Bulk import completed: ${results.success} success, ${results.failed} failed, ${results.duplicates} duplicates`);
    return results;
  }

  async importFromGitHubRepo(repoUrl: string, defaultCategory = 'AI/ML', defaultCountry = 'US') {
    try {
      this.logger.log(`Importing RSS feeds from GitHub repository: ${repoUrl}`);
      
      // Parse GitHub URL to get raw content
      const rawUrl = this.convertGitHubUrlToRaw(repoUrl);
      
      const response = await axios.get(rawUrl);
      const content = response.data;
      
      // Parse the content based on file type
      let feeds: RssFeedItemDto[] = [];
      
      if (repoUrl.includes('allainews_sources')) {
        feeds = this.parseAllAINewsContent(content);
      } else if (repoUrl.includes('awesome-AI-feeds')) {
        feeds = this.parseAwesomeAIFeedsContent(content);
      } else {
        feeds = this.parseGenericMarkdownContent(content);
      }

      // Bulk import the parsed feeds
      return await this.bulkImportRssFeeds({
        feeds,
        sourceType: ImportSourceType.GITHUB_REPO,
        sourceUrl: repoUrl,
        defaultCategory,
        defaultCountry,
      });
    } catch (error) {
      this.logger.error(`Failed to import from GitHub repo: ${error.message}`);
      throw new BadRequestException(`Failed to import from GitHub repository: ${error.message}`);
    }
  }

  async importPredefinedAIFeeds() {
    this.logger.log('Importing predefined AI/ML RSS feeds');
    
    const aiFeeds: RssFeedItemDto[] = [
      // AI News Sources
      {
        title: 'OpenAI Blog',
        feedUrl: 'https://openai.com/blog/rss/',
        domain: 'openai.com',
        description: 'Latest news and updates from OpenAI',
        categoryName: 'AI News',
      },
      {
        title: 'DeepMind Blog',
        feedUrl: 'https://deepmind.com/blog/feed/basic/',
        domain: 'deepmind.com',
        description: 'Research breakthroughs from DeepMind',
        categoryName: 'AI Research',
      },
      {
        title: 'The Gradient',
        feedUrl: 'https://thegradient.pub/rss/',
        domain: 'thegradient.pub',
        description: 'AI publication about artificial intelligence',
        categoryName: 'AI News',
      },
      {
        title: 'Towards Data Science',
        feedUrl: 'https://towardsdatascience.com/feed',
        domain: 'towardsdatascience.com',
        description: 'Data science and machine learning articles',
        categoryName: 'Data Science',
      },
      {
        title: 'Machine Learning Mastery',
        feedUrl: 'https://machinelearningmastery.com/blog/feed',
        domain: 'machinelearningmastery.com',
        description: 'Machine learning tutorials and guides',
        categoryName: 'Machine Learning',
      },
      {
        title: 'AI News - VentureBeat',
        feedUrl: 'https://venturebeat.com/category/ai/feed/',
        domain: 'venturebeat.com',
        description: 'AI news and analysis from VentureBeat',
        categoryName: 'AI News',
      },
      {
        title: 'MIT Technology Review AI',
        feedUrl: 'https://www.technologyreview.com/feed/',
        domain: 'technologyreview.com',
        description: 'AI coverage from MIT Technology Review',
        categoryName: 'AI News',
      },
      {
        title: 'Artificial Intelligence News - ScienceDaily',
        feedUrl: 'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml',
        domain: 'sciencedaily.com',
        description: 'Latest AI research news from ScienceDaily',
        categoryName: 'AI Research',
      },
      {
        title: 'Google AI Blog',
        feedUrl: 'http://googleaiblog.blogspot.com/atom.xml',
        domain: 'ai.googleblog.com',
        description: 'Research and updates from Google AI',
        categoryName: 'AI Research',
      },
      {
        title: 'Hugging Face Blog',
        feedUrl: 'https://huggingface.co/blog/feed.xml',
        domain: 'huggingface.co',
        description: 'NLP and machine learning from Hugging Face',
        categoryName: 'NLP',
      },
      // ArXiv feeds
      {
        title: 'arXiv Computer Science - Machine Learning',
        feedUrl: 'https://arxiv.org/rss/cs.LG',
        domain: 'arxiv.org',
        description: 'Latest machine learning papers from arXiv',
        categoryName: 'Academic Papers',
      },
      {
        title: 'arXiv Computer Science - Computer Vision',
        feedUrl: 'https://arxiv.org/rss/cs.CV',
        domain: 'arxiv.org',
        description: 'Latest computer vision papers from arXiv',
        categoryName: 'Academic Papers',
      },
      {
        title: 'arXiv Computer Science - Computation and Language',
        feedUrl: 'https://arxiv.org/rss/cs.CL',
        domain: 'arxiv.org',
        description: 'Latest NLP papers from arXiv',
        categoryName: 'Academic Papers',
      },
      // Tech News with AI Focus
      {
        title: 'TechCrunch AI',
        feedUrl: 'https://techcrunch.com/feed/',
        domain: 'techcrunch.com',
        description: 'Tech news including AI developments',
        categoryName: 'Tech News',
      },
      {
        title: 'The Verge AI',
        feedUrl: 'https://www.theverge.com/rss/index.xml',
        domain: 'theverge.com',
        description: 'Technology news including AI coverage',
        categoryName: 'Tech News',
      },
    ];

    return await this.bulkImportRssFeeds({
      feeds: aiFeeds,
      sourceType: ImportSourceType.MANUAL_DATA,
      defaultCategory: 'AI/ML',
      defaultCountry: 'US',
    });
  }

  private convertGitHubUrlToRaw(githubUrl: string): string {
    // Convert GitHub URL to raw content URL
    if (githubUrl.includes('github.com') && githubUrl.includes('/blob/')) {
      return githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return githubUrl;
  }

  private parseAllAINewsContent(content: string): RssFeedItemDto[] {
    const feeds: RssFeedItemDto[] = [];
    const lines = content.split('\n');
    
    let currentCategory = 'General';
    
    for (const line of lines) {
      // Detect category headers
      if (line.startsWith('## ') && !line.includes('Contents') && !line.includes('About')) {
        currentCategory = line.replace('## ', '').trim();
        continue;
      }
      
      // Parse RSS feed lines
      const rssMatch = line.match(/\* (.+?) \\- (.+?) \(RSS feed: <(.+?)>\)/);
      if (rssMatch) {
        const [, title, description, feedUrl] = rssMatch;
        const domain = this.extractDomain(feedUrl);
        
        feeds.push({
          title: title.trim(),
          feedUrl: feedUrl.trim(),
          domain,
          description: description.trim(),
          categoryName: currentCategory,
        });
      }
    }
    
    return feeds;
  }

  private parseAwesomeAIFeedsContent(content: string): RssFeedItemDto[] {
    const feeds: RssFeedItemDto[] = [];
    const lines = content.split('\n');
    
    let currentCategory = 'General';
    
    for (const line of lines) {
      // Detect category headers
      if (line.startsWith('## ') && !line.includes('About')) {
        currentCategory = line.replace('## ', '').trim();
        continue;
      }
      
      // Parse table rows with RSS feeds
      const tableMatch = line.match(/\| \[(.+?)\]\(.+?\) \| <(.+?)> \|/);
      if (tableMatch) {
        const [, title, feedUrl] = tableMatch;
        const domain = this.extractDomain(feedUrl);
        
        feeds.push({
          title: title.trim(),
          feedUrl: feedUrl.trim(),
          domain,
          categoryName: currentCategory,
        });
      }
    }
    
    return feeds;
  }

  private parseGenericMarkdownContent(content: string): RssFeedItemDto[] {
    const feeds: RssFeedItemDto[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for URLs that might be RSS feeds
      const urlMatch = line.match(/https?:\/\/[^\s]+/g);
      if (urlMatch) {
        for (const url of urlMatch) {
          if (this.isLikelyRssFeed(url)) {
            const domain = this.extractDomain(url);
            feeds.push({
              title: `RSS Feed from ${domain}`,
              feedUrl: url,
              domain,
            });
          }
        }
      }
    }
    
    return feeds;
  }

  private isLikelyRssFeed(url: string): boolean {
    const rssIndicators = ['/rss', '/feed', '/atom', '.xml', '.rss'];
    return rssIndicators.some(indicator => url.toLowerCase().includes(indicator));
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  private async importSingleFeed(feed: RssFeedItemDto, defaultCategory: string, defaultCountry: string) {
    // Check for duplicates
    const existingFeed = await this.categoryRssRepository.findOne({
      where: { feedUrl: feed.feedUrl },
    });
    
    if (existingFeed) {
      throw new Error(`RSS feed with URL ${feed.feedUrl} already exists (duplicate)`);
    }

         // Determine category
     let category: Category;
     if (feed.categoryName) {
       let foundCategory = await this.categoryRepository.findOne({
         where: { name: feed.categoryName },
       });
       
       if (!foundCategory) {
         foundCategory = this.categoryRepository.create({
           name: feed.categoryName,
         });
         foundCategory = await this.categoryRepository.save(foundCategory);
       }
       category = foundCategory;
     } else {
       const foundCategory = await this.categoryRepository.findOne({
         where: { name: defaultCategory },
       });
       
       if (!foundCategory) {
         throw new Error(`Default category '${defaultCategory}' not found`);
       }
       category = foundCategory;
     }

     // Create RSS feed entry
     const categoryRss = this.categoryRssRepository.create({
       title: feed.title,
       feedUrl: feed.feedUrl,
       domain: feed.domain,
       category,
     });

     await this.categoryRssRepository.save(categoryRss);
  }

  private async ensureDefaultCategoryExists(categoryName: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });
    
    if (!category) {
      const newCategory = this.categoryRepository.create({
        name: categoryName,
      });
      await this.categoryRepository.save(newCategory);
    }
  }

  private async ensureDefaultCountryExists(countryCode: string) {
    const country = await this.countryRepository.findOne({
      where: { code: countryCode },
    });
    
    if (!country) {
      const newCountry = this.countryRepository.create({
        name: this.getCountryName(countryCode),
        code: countryCode,
      });
      await this.countryRepository.save(newCountry);
    }
  }

  private getCountryName(countryCode: string): string {
    const countryMap: { [key: string]: string } = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'CA': 'Canada',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'IN': 'India',
    };
    
    return countryMap[countryCode] || countryCode;
  }
} 
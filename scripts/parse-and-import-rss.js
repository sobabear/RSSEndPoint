const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced RSS Feed Importer
 * This script can parse RSS feeds from various sources and import them into the API
 */

// Sample RSS feed data with more comprehensive coverage
const comprehensiveRssData = {
  countries: [
    {
      countryName: "United Kingdom",
      countryCode: "GB", 
      feeds: [
        {
          title: "BBC Technology",
          feedUrl: "http://feeds.bbci.co.uk/news/technology/rss.xml",
          domain: "bbc.co.uk"
        },
        {
          title: "The Guardian Technology",
          feedUrl: "https://www.theguardian.com/technology/rss",
          domain: "theguardian.com"
        },
        {
          title: "DeepMind Blog",
          feedUrl: "https://deepmind.com/blog/feed/basic",
          domain: "deepmind.com"
        },
        {
          title: "Imperial College London AI",
          feedUrl: "https://www.imperial.ac.uk/news/section/artificial-intelligence/rss",
          domain: "imperial.ac.uk"
        },
        {
          title: "Cambridge University AI",
          feedUrl: "https://www.cam.ac.uk/research/news/rss-feed",
          domain: "cam.ac.uk"
        }
      ]
    },
    {
      countryName: "Hong Kong",
      countryCode: "HK",
      feeds: [
        {
          title: "South China Morning Post Tech",
          feedUrl: "https://www.scmp.com/rss/91/feed",
          domain: "scmp.com"
        },
        {
          title: "Hong Kong Tech News",
          feedUrl: "https://www.ejinsight.com/eji/rss/technology",
          domain: "ejinsight.com"
        },
        {
          title: "HKUST AI Research",
          feedUrl: "https://www.ust.hk/news/rss/research",
          domain: "ust.hk"
        }
      ]
    },
    {
      countryName: "India", 
      countryCode: "IN",
      feeds: [
        {
          title: "Economic Times Tech",
          feedUrl: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms",
          domain: "economictimes.indiatimes.com"
        },
        {
          title: "YourStory Tech",
          feedUrl: "https://yourstory.com/feed",
          domain: "yourstory.com"
        },
        {
          title: "Analytics India Magazine",
          feedUrl: "https://analyticsindiamag.com/feed/",
          domain: "analyticsindiamag.com"
        },
        {
          title: "IIT Delhi AI Research",
          feedUrl: "https://www.iitd.ac.in/rss.xml",
          domain: "iitd.ac.in"
        },
        {
          title: "Tech in Asia India",
          feedUrl: "https://www.techinasia.com/feed",
          domain: "techinasia.com"
        }
      ]
    },
    {
      countryName: "United States",
      countryCode: "US",
      feeds: [
        {
          title: "MIT Technology Review",
          feedUrl: "https://www.technologyreview.com/feed/",
          domain: "technologyreview.com"
        },
        {
          title: "Stanford AI Lab",
          feedUrl: "https://ai.stanford.edu/blog/rss.xml",
          domain: "ai.stanford.edu"
        },
        {
          title: "Carnegie Mellon ML",
          feedUrl: "https://www.ml.cmu.edu/news/rss.xml",
          domain: "ml.cmu.edu"
        },
        {
          title: "Google AI Blog",
          feedUrl: "https://ai.googleblog.com/feeds/posts/default",
          domain: "ai.googleblog.com"
        }
      ]
    }
  ],
  categories: [
    {
      categoryName: "Android",
      feeds: [
        {
          title: "Android Central",
          feedUrl: "https://www.androidcentral.com/rss.xml",
          domain: "androidcentral.com"
        },
        {
          title: "Android Police",
          feedUrl: "https://www.androidpolice.com/feed/",
          domain: "androidpolice.com"
        },
        {
          title: "9to5Google Android",
          feedUrl: "https://9to5google.com/guides/android/feed/",
          domain: "9to5google.com"
        }
      ]
    },
    {
      categoryName: "Tech",
      feeds: [
        {
          title: "TechCrunch",
          feedUrl: "https://techcrunch.com/feed/",
          domain: "techcrunch.com"
        },
        {
          title: "The Verge",
          feedUrl: "https://www.theverge.com/rss/index.xml",
          domain: "theverge.com"
        },
        {
          title: "Ars Technica",
          feedUrl: "http://feeds.arstechnica.com/arstechnica/index",
          domain: "arstechnica.com"
        },
        {
          title: "Hacker News",
          feedUrl: "https://hnrss.org/frontpage",
          domain: "news.ycombinator.com"
        }
      ]
    },
    {
      categoryName: "Programming",
      feeds: [
        {
          title: "Stack Overflow Blog",
          feedUrl: "https://stackoverflow.blog/feed/",
          domain: "stackoverflow.blog"
        },
        {
          title: "GitHub Blog",
          feedUrl: "https://github.blog/feed/",
          domain: "github.blog"
        },
        {
          title: "Dev.to",
          feedUrl: "https://dev.to/feed",
          domain: "dev.to"
        }
      ]
    },
    {
      categoryName: "News",
      feeds: [
        {
          title: "Reuters Technology",
          feedUrl: "https://www.reuters.com/technology/rss",
          domain: "reuters.com"
        },
        {
          title: "Associated Press Technology",
          feedUrl: "https://apnews.com/apf-technology",
          domain: "apnews.com"
        }
      ]
    }
  ]
};

/**
 * Makes HTTP request to the bulk import API
 */
function makeApiRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/bulk-import',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            body: parsedBody
          });
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Fetches RSS feed data from a URL
 */
function fetchRssData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Validates RSS feed data structure
 */
function validateRssData(data) {
  const errors = [];
  
  if (!data.countries && !data.categories) {
    errors.push('No countries or categories data found');
  }
  
  if (data.countries) {
    data.countries.forEach((country, index) => {
      if (!country.countryName) {
        errors.push(`Country at index ${index} missing countryName`);
      }
      if (!country.countryCode) {
        errors.push(`Country at index ${index} missing countryCode`);
      }
      if (!country.feeds || !Array.isArray(country.feeds)) {
        errors.push(`Country at index ${index} missing feeds array`);
      }
    });
  }
  
  if (data.categories) {
    data.categories.forEach((category, index) => {
      if (!category.categoryName) {
        errors.push(`Category at index ${index} missing categoryName`);
      }
      if (!category.feeds || !Array.isArray(category.feeds)) {
        errors.push(`Category at index ${index} missing feeds array`);
      }
    });
  }
  
  return errors;
}

/**
 * Displays import statistics
 */
function displayStats(data) {
  const totalCountries = data.countries ? data.countries.length : 0;
  const totalCategories = data.categories ? data.categories.length : 0;
  
  const totalCountryFeeds = data.countries ? 
    data.countries.reduce((sum, country) => sum + country.feeds.length, 0) : 0;
  const totalCategoryFeeds = data.categories ? 
    data.categories.reduce((sum, category) => sum + category.feeds.length, 0) : 0;
  
  console.log('\n📊 Import Data Statistics:');
  console.log('═'.repeat(40));
  console.log(`🌍 Countries: ${totalCountries}`);
  console.log(`📂 Categories: ${totalCategories}`);
  console.log(`📡 Country RSS Feeds: ${totalCountryFeeds}`);
  console.log(`📡 Category RSS Feeds: ${totalCategoryFeeds}`);
  console.log(`📡 Total RSS Feeds: ${totalCountryFeeds + totalCategoryFeeds}`);
  
  if (data.countries) {
    console.log('\n🌍 Countries breakdown:');
    data.countries.forEach(country => {
      console.log(`  • ${country.countryName} (${country.countryCode}): ${country.feeds.length} feeds`);
    });
  }
  
  if (data.categories) {
    console.log('\n📂 Categories breakdown:');
    data.categories.forEach(category => {
      console.log(`  • ${category.categoryName}: ${category.feeds.length} feeds`);
    });
  }
}

/**
 * Main import function
 */
async function importRssFeeds(dryRun = false) {
  try {
    console.log('🚀 Enhanced RSS Feed Importer');
    console.log('═'.repeat(50));
    
    // Validate data structure
    const validationErrors = validateRssData(comprehensiveRssData);
    if (validationErrors.length > 0) {
      console.error('❌ Data validation failed:');
      validationErrors.forEach(error => console.error(`  • ${error}`));
      return;
    }
    
    console.log('✅ Data validation passed');
    
    // Display statistics
    displayStats(comprehensiveRssData);
    
    // Save data to file for inspection
    const filename = 'comprehensive-rss-feeds.json';
    fs.writeFileSync(filename, JSON.stringify(comprehensiveRssData, null, 2));
    console.log(`\n💾 RSS feeds data saved to ${filename}`);
    
    if (dryRun) {
      console.log('\n🔍 Dry run mode - skipping actual import');
      return;
    }
    
    console.log('\n🔄 Starting import to API...');
    
    const response = await makeApiRequest(comprehensiveRssData);
    
    console.log('\n📋 Import Results:');
    console.log('═'.repeat(30));
    console.log(`Status Code: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      const result = response.body;
      
      console.log(`✅ Categories processed: ${result.categories?.length || 0}`);
      console.log(`✅ Countries processed: ${result.countries?.length || 0}`);
      console.log(`❌ Errors encountered: ${result.errors?.length || 0}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ Import Errors:');
        result.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.type}: ${error.data} - ${error.error}`);
        });
      }
      
      // Show detailed success results
      if (result.categories && result.categories.length > 0) {
        console.log('\n📂 Category Import Results:');
        result.categories.forEach(cat => {
          const icon = cat.errors && cat.errors.length > 0 ? '⚠️' : '✅';
          console.log(`  ${icon} ${cat.category}: ${cat.savedFeeds} feeds imported`);
          if (cat.errors && cat.errors.length > 0) {
            cat.errors.forEach(err => {
              console.log(`    ❌ ${err.feed}: ${err.error}`);
            });
          }
        });
      }
      
      if (result.countries && result.countries.length > 0) {
        console.log('\n🌍 Country Import Results:');
        result.countries.forEach(country => {
          const icon = country.errors && country.errors.length > 0 ? '⚠️' : '✅';
          console.log(`  ${icon} ${country.country}: ${country.savedFeeds} feeds imported`);
          if (country.errors && country.errors.length > 0) {
            country.errors.forEach(err => {
              console.log(`    ❌ ${err.feed}: ${err.error}`);
            });
          }
        });
      }
      
      console.log('\n🎉 Import completed successfully!');
      
    } else {
      console.error(`❌ Import failed with status: ${response.statusCode}`);
      console.error('Response:', response.body);
    }
    
  } catch (error) {
    console.error('💥 Error during import:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const showHelp = args.includes('--help') || args.includes('-h');
  
  if (showHelp) {
    console.log('Enhanced RSS Feed Importer');
    console.log('Usage: node parse-and-import-rss.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run, -d    Show statistics without importing');
    console.log('  --help, -h       Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node parse-and-import-rss.js           # Import feeds');
    console.log('  node parse-and-import-rss.js --dry-run # Show stats only');
    return;
  }
  
  importRssFeeds(dryRun);
}

module.exports = { importRssFeeds, comprehensiveRssData, validateRssData }; 
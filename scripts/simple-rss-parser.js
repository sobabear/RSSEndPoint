const http = require('http');
const fs = require('fs');

/**
 * Simple RSS Feed Importer
 * Manually curated RSS feeds for reliable importing
 */

const rssFeeds = {
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
          title: "TechCrunch UK",
          feedUrl: "https://techcrunch.com/feed/",
          domain: "techcrunch.com"
        },
        {
          title: "The Register",
          feedUrl: "https://www.theregister.com/headlines.atom",
          domain: "theregister.com"
        },
        {
          title: "Wired UK",
          feedUrl: "https://www.wired.co.uk/rss",
          domain: "wired.co.uk"
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
          title: "AsiaOne Tech",
          feedUrl: "https://www.asiaone.com/rss.xml",
          domain: "asiaone.com"
        },
        {
          title: "Hong Kong Free Press Tech",
          feedUrl: "https://hongkongfp.com/feed/",
          domain: "hongkongfp.com"
        }
      ]
    },
    {
      countryName: "India",
      countryCode: "IN",
      feeds: [
        {
          title: "The Hindu Technology",
          feedUrl: "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
          domain: "thehindu.com"
        },
        {
          title: "Economic Times Tech",
          feedUrl: "https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms",
          domain: "economictimes.indiatimes.com"
        },
        {
          title: "Tech2 News",
          feedUrl: "https://www.firstpost.com/tech/feed",
          domain: "firstpost.com"
        },
        {
          title: "Analytics India Magazine",
          feedUrl: "https://analyticsindiamag.com/feed/",
          domain: "analyticsindiamag.com"
        },
        {
          title: "YourStory Tech",
          feedUrl: "https://yourstory.com/feed",
          domain: "yourstory.com"
        }
      ]
    },
    {
      countryName: "United States",
      countryCode: "US",
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
          title: "MIT Technology Review",
          feedUrl: "https://www.technologyreview.com/feed/",
          domain: "technologyreview.com"
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
          title: "9to5Google",
          feedUrl: "https://9to5google.com/feed/",
          domain: "9to5google.com"
        }
      ]
    },
    {
      categoryName: "Tech",
      feeds: [
        {
          title: "Hacker News",
          feedUrl: "https://hnrss.org/frontpage",
          domain: "news.ycombinator.com"
        },
        {
          title: "Slashdot",
          feedUrl: "http://rss.slashdot.org/Slashdot/slashdotMain",
          domain: "slashdot.org"
        },
        {
          title: "Engadget",
          feedUrl: "https://www.engadget.com/rss.xml",
          domain: "engadget.com"
        },
        {
          title: "ZDNet",
          feedUrl: "https://www.zdnet.com/news/rss.xml",
          domain: "zdnet.com"
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
 * Make HTTP request to the bulk import API
 */
function sendToApi(data) {
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
 * Display feed statistics
 */
function displayStatistics() {
  const totalCountries = rssFeeds.countries.length;
  const totalCategories = rssFeeds.categories.length;
  
  const countryFeeds = rssFeeds.countries.reduce((sum, country) => sum + country.feeds.length, 0);
  const categoryFeeds = rssFeeds.categories.reduce((sum, category) => sum + category.feeds.length, 0);
  const totalFeeds = countryFeeds + categoryFeeds;
  
  console.log('🚀 Simple RSS Feed Importer');
  console.log('═'.repeat(50));
  console.log(`📊 Statistics:`);
  console.log(`   Countries: ${totalCountries}`);
  console.log(`   Categories: ${totalCategories}`);
  console.log(`   Country RSS Feeds: ${countryFeeds}`);
  console.log(`   Category RSS Feeds: ${categoryFeeds}`);
  console.log(`   Total RSS Feeds: ${totalFeeds}`);
  
  console.log('\n🌍 Countries:');
  rssFeeds.countries.forEach(country => {
    console.log(`   ${country.countryCode} - ${country.countryName}: ${country.feeds.length} feeds`);
  });
  
  console.log('\n📂 Categories:');
  rssFeeds.categories.forEach(category => {
    console.log(`   ${category.categoryName}: ${category.feeds.length} feeds`);
  });
  
  console.log('\n📝 Sample feeds by country:');
  rssFeeds.countries.forEach(country => {
    console.log(`\n   ${country.countryName} (${country.countryCode}):`);
    country.feeds.slice(0, 2).forEach(feed => {
      console.log(`     • ${feed.title} - ${feed.domain}`);
    });
    if (country.feeds.length > 2) {
      console.log(`     ... and ${country.feeds.length - 2} more`);
    }
  });
  
  console.log('\n📝 Sample feeds by category:');
  rssFeeds.categories.forEach(category => {
    console.log(`\n   ${category.categoryName}:`);
    category.feeds.slice(0, 2).forEach(feed => {
      console.log(`     • ${feed.title} - ${feed.domain}`);
    });
    if (category.feeds.length > 2) {
      console.log(`     ... and ${category.feeds.length - 2} more`);
    }
  });
}

/**
 * Import RSS feeds to the API
 */
async function importFeeds() {
  try {
    console.log('\n🔄 Starting import to API...');
    console.log('   Endpoint: http://localhost:3000/bulk-import');
    
    const response = await sendToApi(rssFeeds);
    
    console.log('\n📋 Import Results:');
    console.log('═'.repeat(30));
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      const result = response.body;
      
      console.log('✅ Import successful!');
      console.log(`   Categories processed: ${result.categories?.length || 0}`);
      console.log(`   Countries processed: ${result.countries?.length || 0}`);
      console.log(`   Errors: ${result.errors?.length || 0}`);
      
      if (result.categories && result.categories.length > 0) {
        console.log('\n📂 Category Results:');
        result.categories.forEach(cat => {
          const status = cat.errors && cat.errors.length > 0 ? '⚠️ ' : '✅ ';
          console.log(`   ${status}${cat.category}: ${cat.savedFeeds} feeds imported`);
          if (cat.errors && cat.errors.length > 0) {
            cat.errors.forEach(err => {
              console.log(`      ❌ ${err.feed}: ${err.error}`);
            });
          }
        });
      }
      
      if (result.countries && result.countries.length > 0) {
        console.log('\n🌍 Country Results:');
        result.countries.forEach(country => {
          const status = country.errors && country.errors.length > 0 ? '⚠️ ' : '✅ ';
          console.log(`   ${status}${country.country}: ${country.savedFeeds} feeds imported`);
          if (country.errors && country.errors.length > 0) {
            country.errors.forEach(err => {
              console.log(`      ❌ ${err.feed}: ${err.error}`);
            });
          }
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log('\n❌ General Errors:');
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.type}: ${error.data} - ${error.error}`);
        });
      }
      
      console.log('\n🎉 Import completed!');
      
    } else {
      console.error(`❌ Import failed with status: ${response.statusCode}`);
      console.error('Response:', response.body);
    }
    
  } catch (error) {
    console.error('💥 Error during import:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Make sure your NestJS server is running on localhost:3000');
    }
  }
}

/**
 * Save data to JSON file
 */
function saveToFile() {
  const filename = 'simple-rss-feeds.json';
  fs.writeFileSync(filename, JSON.stringify(rssFeeds, null, 2));
  console.log(`\n💾 RSS feeds data saved to ${filename}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldImport = args.includes('--import');
  const showHelp = args.includes('--help') || args.includes('-h');
  
  if (showHelp) {
    console.log('Simple RSS Feed Importer');
    console.log('Usage: node simple-rss-parser.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --import     Import feeds to API (requires server running)');
    console.log('  --help, -h   Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node simple-rss-parser.js          # Show statistics only');
    console.log('  node simple-rss-parser.js --import # Import feeds to API');
    console.log('');
    console.log('Prerequisites for import:');
    console.log('  - NestJS server running on localhost:3000');
    console.log('  - Database configured and running');
    return;
  }
  
  // Always show statistics
  displayStatistics();
  
  // Save data to file
  saveToFile();
  
  if (shouldImport) {
    await importFeeds();
  } else {
    console.log('\n💡 To import these feeds to your API:');
    console.log('   1. Start your NestJS server: npm run start:dev');
    console.log('   2. Run: node simple-rss-parser.js --import');
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { rssFeeds, importFeeds, displayStatistics }; 
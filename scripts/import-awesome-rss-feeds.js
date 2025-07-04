const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Function to fetch the README content from GitHub
function fetchReadmeContent() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/WAI-laboratory/awesome-rss-feeds/master/README.md';
    
    https.get(url, (res) => {
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

// Function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : 'unknown.com';
  }
}

// Function to parse country RSS feeds
function parseCountryFeeds(content) {
  const countries = [];
  const countryRegex = /### �[A-Z]{2} (.+?)\n([\s\S]*?)(?=###|$)/g;
  
  let countryMatch;
  while ((countryMatch = countryRegex.exec(content)) !== null) {
    const countryName = countryMatch[1].trim();
    const countryContent = countryMatch[2];
    
    // Extract country code from flag emoji or country name
    const countryCode = getCountryCode(countryName);
    
    // Parse feeds table
    const feeds = [];
    const feedRegex = /\|([^|]+)\|([^|]+)\|/g;
    
    let feedMatch;
    while ((feedMatch = feedRegex.exec(countryContent)) !== null) {
      const title = feedMatch[1].trim();
      const feedUrl = feedMatch[2].trim();
      
      // Skip header rows
      if (title === 'Source' || title.includes('---') || !feedUrl.startsWith('http')) {
        continue;
      }
      
      feeds.push({
        title: title,
        feedUrl: feedUrl,
        domain: extractDomain(feedUrl)
      });
    }
    
    if (feeds.length > 0) {
      countries.push({
        countryName: countryName,
        countryCode: countryCode,
        feeds: feeds
      });
    }
  }
  
  return countries;
}

// Function to parse recommended category feeds
function parseCategoryFeeds(content) {
  const categories = [];
  
  // Find the "Recommended Sources" section
  const recommendedSection = content.split('## Recommended Sources')[1];
  if (!recommendedSection) return categories;
  
  const categoryRegex = /### (.+?)\n([\s\S]*?)(?=###|$)/g;
  
  let categoryMatch;
  while ((categoryMatch = categoryRegex.exec(recommendedSection)) !== null) {
    const categoryName = categoryMatch[1].trim();
    const categoryContent = categoryMatch[2];
    
    // Parse feeds table
    const feeds = [];
    const feedRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    
    let feedMatch;
    while ((feedMatch = feedRegex.exec(categoryContent)) !== null) {
      const title = feedMatch[1].trim();
      const feedUrl = feedMatch[2].trim();
      const domain = feedMatch[3].trim();
      
      // Skip header rows
      if (title === 'Title' || title.includes('---') || !feedUrl.startsWith('http')) {
        continue;
      }
      
      feeds.push({
        title: title,
        feedUrl: feedUrl,
        domain: domain
      });
    }
    
    if (feeds.length > 0) {
      categories.push({
        categoryName: categoryName,
        feeds: feeds
      });
    }
  }
  
  return categories;
}

// Function to get country code from country name
function getCountryCode(countryName) {
  const countryCodeMap = {
    'United Kingdom': 'GB',
    'Hong Kong SAR China': 'HK',
    'Indonesia': 'ID',
    'Ireland': 'IE',
    'India': 'IN',
    'Iran': 'IR',
    'Italy': 'IT',
    'Japan': 'JP',
    'Myanmar (Burma)': 'MM',
    'Mexico': 'MX',
    'Nigeria': 'NG',
    'Philippines': 'PH',
    'Pakistan': 'PK',
    'Poland': 'PL',
    'Russia': 'RU',
    'Ukraine': 'UA',
    'United States': 'US',
    'South Africa': 'ZA'
  };
  
  return countryCodeMap[countryName] || countryName.substring(0, 2).toUpperCase();
}

// Function to send data to API
async function sendToAPI(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000, // Adjust port if your API runs on a different port
      path: '/bulk-import',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('Fetching RSS feeds from WAI-laboratory/awesome-rss-feeds...');
    const content = await fetchReadmeContent();
    
    console.log('Parsing country feeds...');
    const countries = parseCountryFeeds(content);
    console.log(`Found ${countries.length} countries with RSS feeds`);
    
    console.log('Parsing category feeds...');
    const categories = parseCategoryFeeds(content);
    console.log(`Found ${categories.length} categories with RSS feeds`);
    
    // Create the bulk import payload
    const bulkImportData = {
      countries: countries,
      categories: categories
    };
    
    // Save to file for inspection
    const outputPath = path.join(__dirname, 'parsed-rss-feeds.json');
    fs.writeFileSync(outputPath, JSON.stringify(bulkImportData, null, 2));
    console.log(`Parsed data saved to ${outputPath}`);
    
    // Send to API (uncomment when ready to import)
    console.log('Sending data to API...');
    try {
      const result = await sendToAPI(bulkImportData);
      console.log('Import completed successfully!');
      console.log('Results:', JSON.stringify(result, null, 2));
    } catch (apiError) {
      console.error('Error sending to API:', apiError.message);
      console.log('You can manually import the data from:', outputPath);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  fetchReadmeContent,
  parseCountryFeeds,
  parseCategoryFeeds,
  extractDomain
}; 
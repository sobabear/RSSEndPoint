#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const RSS_API_BASE_URL = 'http://localhost:3020/rss';

const PREDEFINED_SOURCES = {
  1: {
    name: 'All AI News Sources (180+ feeds)',
    url: 'https://github.com/foorilla/allainews_sources/blob/main/README.md',
    category: 'AI/ML News'
  },
  2: {
    name: 'Awesome AI Feeds (60+ feeds)',
    url: 'https://github.com/RSS-Renaissance/awesome-AI-feeds/blob/master/README.md',
    category: 'AI Research'
  },
  3: {
    name: 'Awesome AI News Feeds (11+ feeds)',
    url: 'https://github.com/RSS-Renaissance/awesome-AI-news-feeds/blob/master/README.md',
    category: 'AI News'
  },
  4: {
    name: 'Predefined AI/ML Feeds (15+ curated feeds)',
    url: 'predefined',
    category: 'AI/ML'
  }
};

async function importFromGitHub(repoUrl, defaultCategory = 'AI/ML') {
  try {
    console.log(`\n🔄 Importing RSS feeds from: ${repoUrl}`);
    console.log(`📂 Default category: ${defaultCategory}`);
    
    const response = await axios.post(`${RSS_API_BASE_URL}/import-from-github`, {
      repoUrl,
      defaultCategory,
      defaultCountry: 'US'
    });
    
    const results = response.data;
    console.log('\n✅ Import completed!');
    console.log(`📊 Results:`);
    console.log(`   ✅ Successfully imported: ${results.success} feeds`);
    console.log(`   ❌ Failed: ${results.failed} feeds`);
    console.log(`   🔄 Duplicates skipped: ${results.duplicates} feeds`);
    
    if (results.errors && results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (results.errors.length > 5) {
        console.log(`   ... and ${results.errors.length - 5} more errors`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function importPredefinedFeeds() {
  try {
    console.log('\n🔄 Importing predefined AI/ML RSS feeds...');
    
    const response = await axios.post(`${RSS_API_BASE_URL}/import-predefined-ai`);
    
    const results = response.data;
    console.log('\n✅ Import completed!');
    console.log(`📊 Results:`);
    console.log(`   ✅ Successfully imported: ${results.success} feeds`);
    console.log(`   ❌ Failed: ${results.failed} feeds`);
    console.log(`   🔄 Duplicates skipped: ${results.duplicates} feeds`);
    
    return results;
  } catch (error) {
    console.error('❌ Import failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function showMenu() {
  console.log('\n🚀 RSS Feed Import Tool');
  console.log('========================\n');
  
  console.log('Available RSS feed sources:');
  Object.entries(PREDEFINED_SOURCES).forEach(([key, source]) => {
    console.log(`${key}. ${source.name}`);
    console.log(`   Category: ${source.category}`);
    console.log(`   Source: ${source.url === 'predefined' ? 'Built-in curated feeds' : source.url}`);
    console.log('');
  });
  
  console.log('0. Import from custom GitHub URL');
  console.log('q. Quit\n');
}

async function promptChoice() {
  return new Promise((resolve) => {
    rl.question('Select an option (0-4, q): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptCustomUrl() {
  return new Promise((resolve) => {
    rl.question('Enter GitHub repository URL (e.g., https://github.com/user/repo/blob/main/README.md): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptCategory() {
  return new Promise((resolve) => {
    rl.question('Enter default category (default: AI/ML): ', (answer) => {
      resolve(answer.trim() || 'AI/ML');
    });
  });
}

async function checkServerStatus() {
  try {
    await axios.get(`${RSS_API_BASE_URL}/categories`);
    console.log('✅ RSS API server is running');
    return true;
  } catch (error) {
    console.error('❌ RSS API server is not accessible at', RSS_API_BASE_URL);
    console.error('   Make sure your NestJS server is running on port 3020');
    console.error('   Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking server status...');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }
  
  while (true) {
    await showMenu();
    const choice = await promptChoice();
    
    if (choice === 'q' || choice === 'quit') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    try {
      if (choice === '0') {
        const customUrl = await promptCustomUrl();
        if (!customUrl) {
          console.log('❌ No URL provided');
          continue;
        }
        
        const category = await promptCategory();
        await importFromGitHub(customUrl, category);
        
      } else if (choice === '4') {
        await importPredefinedFeeds();
        
      } else if (PREDEFINED_SOURCES[choice]) {
        const source = PREDEFINED_SOURCES[choice];
        await importFromGitHub(source.url, source.category);
        
      } else {
        console.log('❌ Invalid choice. Please try again.');
        continue;
      }
      
      console.log('\n✨ Import process completed!');
      console.log('\nYou can now:');
      console.log('- View categories: GET /rss/categories');
      console.log('- View feeds by category: GET /rss/category?name=AI/ML');
      console.log('- View all feeds: GET /rss/category');
      
    } catch (error) {
      console.error('\n❌ An error occurred during import');
      console.log('Please check the error details above and try again.');
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  rl.close();
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  importFromGitHub,
  importPredefinedFeeds,
  checkServerStatus
}; 
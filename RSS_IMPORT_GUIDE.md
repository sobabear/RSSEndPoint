# RSS Feed Import Guide

This guide explains how to import large amounts of RSS feed data into your RSS Feed API server from various sources, including the awesome RSS feeds repositories on GitHub.

## 🚀 Quick Start

### Method 1: Using the Import Script (Recommended)

1. **Start your RSS API server:**
   ```bash
   npm run start:dev
   ```

2. **Run the import script:**
   ```bash
   node scripts/import-rss-feeds.js
   ```

3. **Follow the interactive menu** to choose from predefined sources or import from custom GitHub URLs.

### Method 2: Using API Endpoints Directly

You can also call the import endpoints directly using curl, Postman, or any HTTP client.

## 📚 Available Data Sources

### 1. All AI News Sources (180+ feeds)
- **Source**: [foorilla/allainews_sources](https://github.com/foorilla/allainews_sources)
- **Content**: Comprehensive list of AI, ML, and Data Science news sources
- **Categories**: AI News, Machine Learning, Neural Networks, Text Analytics, etc.

### 2. Awesome AI Feeds (60+ feeds)
- **Source**: [RSS-Renaissance/awesome-AI-feeds](https://github.com/RSS-Renaissance/awesome-AI-feeds)
- **Content**: Curated AI research and development feeds
- **Categories**: AI Research, Neural Networks, Text Analytics

### 3. Awesome AI News Feeds (11+ feeds)
- **Source**: [RSS-Renaissance/awesome-AI-news-feeds](https://github.com/RSS-Renaissance/awesome-AI-news-feeds)
- **Content**: News-focused AI feeds
- **Categories**: AI News, Research Updates

### 4. Predefined Curated Feeds (15+ feeds)
- **Source**: Built-in curated list
- **Content**: High-quality AI/ML feeds including OpenAI, DeepMind, arXiv, etc.
- **Categories**: AI News, AI Research, Machine Learning, NLP, Academic Papers

## 🔧 API Endpoints

### Import from GitHub Repository
```bash
POST /rss/import-from-github
Content-Type: application/json

{
  "repoUrl": "https://github.com/foorilla/allainews_sources/blob/main/README.md",
  "defaultCategory": "AI/ML News",
  "defaultCountry": "US"
}
```

### Import Predefined AI Feeds
```bash
POST /rss/import-predefined-ai
```

### Bulk Import Custom Data
```bash
POST /rss/bulk-import
Content-Type: application/json

{
  "feeds": [
    {
      "title": "OpenAI Blog",
      "feedUrl": "https://openai.com/blog/rss/",
      "domain": "openai.com",
      "description": "Latest news from OpenAI",
      "categoryName": "AI News"
    }
  ],
  "defaultCategory": "AI/ML",
  "defaultCountry": "US"
}
```

## 📊 Response Format

All import endpoints return a summary of the import operation:

```json
{
  "success": 45,
  "failed": 2,
  "errors": [
    "Failed to import \"Invalid Feed\": URL validation failed"
  ],
  "duplicates": 3
}
```

## 🎯 Usage Examples

### Example 1: Import All AI News Sources
```bash
curl -X POST http://localhost:3020/rss/import-from-github \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/foorilla/allainews_sources/blob/main/README.md",
    "defaultCategory": "AI/ML News"
  }'
```

### Example 2: Import Predefined Feeds
```bash
curl -X POST http://localhost:3020/rss/import-predefined-ai
```

### Example 3: Check Import Results
```bash
# View all categories created
curl http://localhost:3020/rss/categories

# View feeds in a specific category
curl "http://localhost:3020/rss/category?name=AI%20News"

# View all feeds
curl http://localhost:3020/rss/category
```

## 🔍 Viewing Imported Data

After importing, you can view your RSS feeds using these endpoints:

- **All categories**: `GET /rss/categories`
- **Feeds by category**: `GET /rss/category?name=CategoryName`
- **All feeds**: `GET /rss/category`
- **All countries**: `GET /rss/countries`

## 🛠️ Advanced Usage

### Custom GitHub Repository Import

You can import RSS feeds from any GitHub repository that contains RSS feed data in markdown format:

```javascript
// Using the script programmatically
const { importFromGitHub } = require('./scripts/import-rss-feeds.js');

await importFromGitHub(
  'https://github.com/your-username/your-repo/blob/main/feeds.md',
  'Custom Category'
);
```

### Handling Large Imports

For very large imports (1000+ feeds), the system:
- Processes feeds in batches
- Skips duplicates automatically
- Provides detailed error reporting
- Logs progress to the console

### Error Handling

Common issues and solutions:

1. **Duplicate feeds**: Automatically skipped, counted in results
2. **Invalid URLs**: Logged as errors, import continues
3. **Network timeouts**: Retry the import operation
4. **Server not running**: Ensure your NestJS server is running on port 3020

## 📝 Adding Your Own Sources

To add support for a new GitHub repository format:

1. Extend the parsing logic in `src/modules/rss/rss-import.service.ts`
2. Add a new parser method for your format
3. Update the `importFromGitHubRepo` method to detect your format

## 🚨 Important Notes

- **Duplicates**: The system automatically prevents duplicate feeds based on `feedUrl`
- **Categories**: New categories are created automatically if they don't exist
- **Performance**: Large imports may take several minutes to complete
- **Rate Limiting**: GitHub API calls are not rate-limited, but be respectful

## 🔧 Troubleshooting

### Server Connection Issues
```bash
# Check if server is running
curl http://localhost:3020/rss/categories

# Check Docker container status (if using Docker)
docker ps | grep rss-feed-api
```

### Import Script Issues
```bash
# Install dependencies if missing
npm install axios

# Run with debug output
DEBUG=* node scripts/import-rss-feeds.js
```

### Database Issues
```bash
# Check database connection
# Look for TypeORM connection logs in server output
```

## 📈 Expected Results

After importing from all sources, you should have:
- **250+ RSS feeds** from various AI/ML sources
- **15+ categories** automatically created
- **Feeds organized by**: AI News, Research, Machine Learning, NLP, etc.

## 🎉 Next Steps

After importing your RSS feeds:
1. Set up RSS feed polling/updating
2. Implement feed content parsing
3. Add search and filtering capabilities
4. Create a frontend to browse feeds
5. Set up notifications for new content

Happy RSS importing! 🚀 
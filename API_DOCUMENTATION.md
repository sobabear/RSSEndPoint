# RSS Feed API Documentation

## Overview
This is a NestJS-based RSS Feed API that allows you to manage and retrieve RSS feeds organized by countries and categories.

## Base URL
```
http://localhost:3020/rss
```

## Authentication
Currently, no authentication is required for any endpoints.

## Data Models

### Country Entity
```typescript
{
  id: number;
  name: string;
  code: string;
  rssFeeds: CountryRss[];
}
```

### Category Entity
```typescript
{
  id: number;
  name: string;
  rssFeeds: CategoryRss[];
}
```

### CountryRss Entity
```typescript
{
  id: number;
  title: string;
  feedUrl: string;
  domain: string;
  country: Country;
}
```

### CategoryRss Entity
```typescript
{
  id: number;
  title: string;
  feedUrl: string;
  domain: string;
  category: Category;
}
```

## API Endpoints

### Health Check

#### GET /
Get a simple health check message.

**Request:**
```http
GET http://localhost:3020/
```

**Response:**
```json
"Hello World!"
```

---

### RSS Feed Management

#### GET /rss/country
Get all RSS feeds for a specific country.

**Request:**
```http
GET http://localhost:3020/rss/country?code=US
```

**Query Parameters:**
- `code` (required): Country code (e.g., "US", "UK", "CA")

**Response:**
```json
[
  {
    "id": 1,
    "title": "Example News Feed",
    "feedUrl": "https://example.com/rss",
    "domain": "example.com",
    "country": {
      "id": 1,
      "name": "United States",
      "code": "US"
    }
  }
]
```

#### POST /rss/country
Create a new RSS feed associated with a country.

**Request:**
```http
POST http://localhost:3020/rss/country
Content-Type: application/json

{
  "title": "CNN News",
  "feedUrl": "https://cnn.com/rss",
  "domain": "cnn.com",
  "countryCode": "US",
  "countryId": 1
}
```

**Request Body:**
```typescript
{
  title: string;        // Required - RSS feed title
  feedUrl: string;      // Required - RSS feed URL
  domain: string;       // Required - Domain name
  countryCode?: string; // Optional - Country code
  countryId?: number;   // Optional - Country ID
}
```

**Response:**
```json
{
  "id": 2,
  "title": "CNN News",
  "feedUrl": "https://cnn.com/rss",
  "domain": "cnn.com",
  "country": {
    "id": 1,
    "name": "United States",
    "code": "US"
  }
}
```

#### GET /rss
Get all RSS feeds except country-specific ones.

**Request:**
```http
GET http://localhost:3020/rss
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Tech News",
    "feedUrl": "https://tech.com/rss",
    "domain": "tech.com",
    "category": {
      "id": 1,
      "name": "Technology"
    }
  }
]
```

#### GET /rss/category
Get all RSS feeds for a specific category.

**Request:**
```http
GET http://localhost:3020/rss/category?name=Technology
```

**Query Parameters:**
- `name` (required): Category name (e.g., "Technology", "Sports", "Business")

**Response:**
```json
[
  {
    "id": 1,
    "title": "Tech News",
    "feedUrl": "https://tech.com/rss",
    "domain": "tech.com",
    "category": {
      "id": 1,
      "name": "Technology"
    }
  }
]
```

#### POST /rss/category
Create a new RSS feed associated with a category. If the category doesn't exist, it will be created automatically.

**Request:**
```http
POST http://localhost:3020/rss/category
Content-Type: application/json

{
  "title": "TechCrunch",
  "feedUrl": "https://techcrunch.com/rss",
  "domain": "techcrunch.com",
  "categoryName": "Technology",
  "categoryId": 1
}
```

**Request Body:**
```typescript
{
  title: string;          // Required - RSS feed title
  feedUrl: string;        // Required - RSS feed URL
  domain: string;         // Required - Domain name
  categoryName?: string;  // Optional - Category name (will be created if doesn't exist)
  categoryId?: number;    // Optional - Category ID (must exist)
}
```

**Response:**
```json
{
  "id": 2,
  "title": "TechCrunch",
  "feedUrl": "https://techcrunch.com/rss",
  "domain": "techcrunch.com",
  "category": {
    "id": 1,
    "name": "Technology"
  }
}
```

#### GET /rss/countries
Get all available countries.

**Request:**
```http
GET http://localhost:3020/rss/countries
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "United States",
    "code": "US",
    "rssFeeds": [...]
  },
  {
    "id": 2,
    "name": "United Kingdom",
    "code": "UK",
    "rssFeeds": [...]
  }
]
```

#### GET /rss/categories
Get all available categories.

**Request:**
```http
GET http://localhost:3020/rss/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Technology",
    "rssFeeds": [...]
  },
  {
    "id": 2,
    "name": "Sports",
    "rssFeeds": [...]
  }
]
```

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful GET requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

---

## Validation Rules

### RSS Feed Creation
- `title`: Required, must be a string
- `feedUrl`: Required, must be a valid string
- `domain`: Required, must be a string
- `countryCode` / `categoryName`: Optional, must be a string if provided (categories are auto-created)
- `countryId` / `categoryId`: Optional, must be a number if provided (must reference existing entities)

---

## Usage Examples

### Create a Technology RSS Feed (Auto-creates category if needed)
```bash
curl -X POST http://localhost:3020/rss/category \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hacker News",
    "feedUrl": "https://hnrss.org/newest",
    "domain": "hnrss.org",
    "categoryName": "Technology"
  }'
```

### Create an Apple RSS Feed (Creates new "Apple" category)
```bash
curl -X POST http://localhost:3020/rss/category \
  -H "Content-Type: application/json" \
  -d '{
    "title": "9to5Mac",
    "feedUrl": "https://9tomac.com/feed",
    "domain": "9tomac.com",
    "categoryName": "Apple"
  }'
```

### Get All US RSS Feeds
```bash
curl http://localhost:3020/rss/country?code=US
```

### Get All Available Categories
```bash
curl http://localhost:3020/rss/categories
```

---

## Running the API

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up
```

The API will be available at `http://localhost:3020`

---

## Database
The API uses PostgreSQL with TypeORM. Make sure to configure your database connection in the environment variables or configuration files.

## Dependencies
- NestJS
- TypeORM
- PostgreSQL
- Class Validator
- Class Transformer 
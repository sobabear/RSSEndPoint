# RSS Feed API

A NestJS backend service that provides RSS feed information from various countries and categories.

## Features

- Get RSS feeds by country
- Get all RSS feeds (except country-specific ones)
- Get RSS feeds by category
- PostgreSQL database for data persistence
- Docker and Docker Compose setup
- Nginx reverse proxy

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Setup

1. Clone the repository
2. Create a `.env` file based on the environment variables in `docker-compose.yml`
3. Run the services:

```bash
docker-compose up -d
```

## API Endpoints

1. Get RSS feeds by country:
   ```
   GET /rss/country?code=US
   ```

2. Get all RSS feeds (except country-specific):
   ```
   GET /rss
   ```

3. Get RSS feeds by category:
   ```
   GET /rss/category?name=Technology
   ```

## Development
0. Set Env
```bash
echo 'DB_PASSWORD={your db password}!' > .env && cat .env
```
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run start:dev
   ```

## Database Schema

- Country (id, name, code)
  - One-to-many relationship with CountryRss
- CountryRss (id, title, feedUrl, domain)
  - Many-to-one relationship with Country
- Category (id, name)
  - One-to-many relationship with CategoryRss
- CategoryRss (id, title, feedUrl, domain)
  - Many-to-one relationship with Category

## License

MIT

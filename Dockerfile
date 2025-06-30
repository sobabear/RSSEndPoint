FROM node:18-alpine

RUN mkdir -p /var/app/rss-feed-api
WORKDIR /var/app/rss-feed-api

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 
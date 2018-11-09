const process = require('process');
const express = require('express');
const Redis = require('ioredis');
const rootHandler = require('./handlers/root');
const domainHandler = require('./handlers/domain');

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

// Redis connection options in one url
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const app = express();

// Create a connection
const redisClient = new Redis(REDIS_URL);

// Let handlers reuse redis connection
app.use((req, res, next) => {
  req.redisClient = redisClient;
  return next();
});
if (process.env.NODE_ENV === 'dev') {
  const path = require('path');

  app.use(express.static(path.join(__dirname, '../../frontend/src/')));
} else {
  app.get('/', rootHandler);
}
app.get('/domain/:domain', domainHandler);
app.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});
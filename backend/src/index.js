const express = require('express');
const Redis = require('ioredis');
const morgan = require('morgan');
const rootRoute = require('./routes/root');
const domainRoute = require('./routes/domain');
const wsRoute = require('./routes/ws');

/**
 * @const {string} Express host
 */
const hostname = process.env.HOST || '127.0.0.1';

/**
 * @const {number} Express port
 */
const port = process.env.PORT || 3000;

/**
 * @const {string} Redis connection coptios in one url
 */
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const app = express();

// Set up express-ws before all routes
require('express-ws')(app);

// Create a connection
const redisClient = new Redis(REDIS_URL);

// Let handlers reuse redis connection
app.use((req, res, next) => {
  req.redisClient = redisClient;
  return next();
});

// Serve frontend if working in dev environment and set up logging
if (process.env.NODE_ENV === 'dev') {
  const path = require('path');

  app.use(morgan('dev'));
  app.use(express.static(path.join(__dirname, '../../frontend/src/')));
  app.use('/dist', express.static(path.join(__dirname, '../../frontend/dist/')));
} else {
  app.use(morgan('combined'));
  app.get('/', rootRoute);
}

app.get('/api/checkDomain/:domain', domainRoute);
app.ws('/ws/:id', wsRoute);

app.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});

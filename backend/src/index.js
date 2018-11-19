const path = require('path');
const env = require('dotenv').config({ path: path.resolve(__dirname, '../.env') }).parsed;
const express = require('express');
const morgan = require('morgan');

const app = express();

require('express-ws')(app);

const api = require('./api');

// Set up express-ws before all routes

// Serve frontend if working in dev environment and set up logging
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));

  app.use('/', express.static(path.join(__dirname, '../../frontend/src/')));
  app.use('/dist', express.static(path.join(__dirname, '../../frontend/dist/')));
} else {
  app.use(morgan('combined'));
}

// Main api route
app.use('/api', api);

app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running at ${env.HOST}:${env.PORT}/`);
});

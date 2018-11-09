const process = require('process');
const express = require('express');
const rootHandler = require('./handlers/root');

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

const app = express();

if (process.env.NODE_ENV === 'dev') {
  const path = require('path');

  app.use(express.static(path.join(__dirname, '../../frontend/src/')));
} else {
  app.get('/', rootHandler);
}
app.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});
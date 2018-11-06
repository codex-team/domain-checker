const process = require('process');
const express = require('express');
const rootHandler = require('./handlers/root');

const hostname = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

const app = express();

app.get('/', rootHandler);

app.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});
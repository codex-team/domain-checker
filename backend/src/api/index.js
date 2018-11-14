const express = require('express');
const rootRoute = require('./root');
const domainRoute = require('./domain');
const wsRoute = require('./ws');

const app = express();
require('express-ws')(app);

const router = express.Router();

router.get('/', rootRoute);

// Route for checking domain availability
router.get('/checkDomain/:domain', domainRoute);

// Route for sending results to client
router.ws('/ws', wsRoute);

module.exports = router;

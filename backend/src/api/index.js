const express = require('express');
const rootRoute = require('./root');
const domainRoute = require('./domain');
const wsRoute = require('./ws');

// Need to register express-ws firts on Express instanse
const app = express();

require('express-ws')(app);

const router = express.Router();

router.get('/', rootRoute);

// Route for checking domain availability
router.get('/checkDomain/:domain', domainRoute);

// Route for sending results to client
router.ws('/ws/:id', wsRoute);

module.exports = router;

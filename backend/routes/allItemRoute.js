const express = require('express');
const router = express.Router();
const {allItems} = require('../controllers/allItemController');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');
const authorizeAction = require('../middleware/authorizeAction');

router.get('/allitems',authenticateJWT,authorizeAction('read'), allItems);

module.exports = router;
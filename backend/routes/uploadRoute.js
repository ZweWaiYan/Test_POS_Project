const express = require('express');
const router = express.Router();
const {upload} = require('../controllers/uploadController');
const handleImageUpload = require('../middleware/handleImageUpload');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');
const authorizeAction = require('../middleware/authorizeAction');

router.post('/upload',authenticateJWT,authorizeAction('create'), handleImageUpload,upload);

module.exports = router;
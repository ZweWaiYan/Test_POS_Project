const express = require('express');
const router = express.Router();
const {update} = require('../controllers/updateController');
const handleImageUpload = require('../middleware/handleImageUpload');
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRole = require('../middleware/authorizeRole');
const authorizeAction = require('../middleware/authorizeAction');

router.put('/update/:item_id',authenticateJWT,authorizeAction('update'), handleImageUpload,update);

module.exports = router;
const express = require('express');
const router = express.Router();
const {login} = require('../controllers/loginController');
const {logout} = require('../controllers/logoutController');

router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
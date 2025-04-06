const express = require('express');
const router = express.Router();
const {signup} = require('../controllers/signupController');
const {adminSignup} = require('../controllers/adminSignup');

router.post('/signup', signup);
router.post('/adminsignup', adminSignup)

module.exports = router;
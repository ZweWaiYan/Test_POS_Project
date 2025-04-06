const express = require('express');
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateJWT");
const { addCategory, fetchCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authorizeAction = require("../middleware/authorizeAction")

router.post('/addcategory', authenticateJWT, authorizeAction('create'), addCategory);
router.get('/fetchcategory', authenticateJWT, authorizeAction('read'), fetchCategory);
router.put('/updatecategory/:id', authenticateJWT, authorizeAction('update'), updateCategory);
router.delete('/deletecategory/:id', authenticateJWT, authorizeAction('delete'), deleteCategory);

module.exports = router;
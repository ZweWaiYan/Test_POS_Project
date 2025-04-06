const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeAction = require('../middleware/authorizeAction');

const {addsale,updatesale,deletesale,fetchsalebyId,fetchsales, getyearlyreport, gettopsellers} = require('../controllers/salesController');

router.post('/addsale',authenticateJWT,authorizeAction('create'), addsale);
//router.put('/updatesale/:sale_id',authenticateJWT,authorizeAction('update'), updatesale);
//router.delete('/deletesale/:sale_id',authenticateJWT,authorizeAction('delete'),deletesale);
router.get('/fetchsale/:saleId',authenticateJWT,authorizeAction('read'), fetchsalebyId);
router.get('/fetchsales',authenticateJWT,authorizeAction('read'), fetchsales);
router.get('/yearlyreport',authenticateJWT,authorizeAction('read'),getyearlyreport);
router.get('/topsellers',authenticateJWT,authorizeAction('read'),gettopsellers);

module.exports = router;
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
require('dotenv').config();

const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    //console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        req.user = decoded;
        //console.log(decoded)
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticateJWT;

const getDbName = require('../controllers/getDBname');
const authorizeAction = (action) => {

    return (req, res, next) => {


        if (action === 'read' && req.method === 'GET') {
            return next(); 
        }

        const role = req.user.role;
        const branch = req.user.branch;

        if (role === 'admin') {
            return next();
        }

        if (branch === getDbName(req)) {
            return next();
        }
        return res.status(403).json({ message: "Forbidden: You don't have permission to perform this action." });
    };
};

module.exports = authorizeAction;

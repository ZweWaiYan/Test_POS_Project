//with mongo
const { connectDB } = require('../mongodb_connector');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const getDbName = require('./getDBname');

async function allItems(req, res) {
    const client = await connectDB();
    
    try {
        //console.log(req.user.role)
        if (!req.user && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access." });
        }
       
        const dbName = getDbName(req);
        //console.log('dbname: ', dbName);
        
        const database = client.db(dbName);
        const collection = database.collection('items');
        const currentDate = new Date();
        const allitems = await collection.find({}).toArray();

        const formattedItems = allitems.map(item => {
            const expireDate = item.expire_date ? new Date(item.expire_date) : null;
            const alertDate = item.alert_date ? new Date(item.alert_date) : null;

            return {
                ...item,
                expire_date: expireDate ? expireDate.toISOString().split('T')[0] : null,
                alert_date: alertDate ? alertDate.toISOString().split('T')[0] : null,
                is_expired: expireDate && expireDate <= currentDate ? 1 : 0,
                is_alerted: alertDate && currentDate >= alertDate && (!expireDate || currentDate < expireDate) ? 1 : 0
            };
        });

        res.json(formattedItems);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { allItems };


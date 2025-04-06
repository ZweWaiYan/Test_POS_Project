const { MongoClient } = require('mongodb');
const { connectDB } = require('../mongodb_connector');
const getDBname = require('./getDBname');
async function viewbranchsales(req, res) {
    try {
        const store = req.params.store;
        const client = await connectDB();
        const dbname = getDBname(req)
        const database = client.db(dbname);
        const salesCollection = database.collection('sales');
        const salesData = await salesCollection.find({}).toArray();
        
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: 'Error fetching sales report' });
    }
}

async function saledetails(req, res){
    const { ObjectId } = require('mongodb');
    const store = req.params.store;
    const saleId = req.params.saleId;
    const client = await connectDB();
    const database = client.db(store)
    const salesCollection = database.collection('sales');

    try {
        const sale = await salesCollection.findOne({ saleId: saleId });

        if (!sale) {
            return res.status(404).json({ message: "No sale record found!" });
        }

        res.json(sale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching sale record" });
    }

}

module.exports = { viewbranchsales, saledetails };
const { MongoClient } = require("mongodb");
require('dotenv').config();
//&appName=${process.env.DB}
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@pharmacydb.809xe.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function connectDB() {
    try {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
            console.log("✅ Connected to MongoDB");
            //const databases = await client.db().admin().listDatabases();
            //console.log("📂 Databases:", databases);
        }
        return client;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw error;
    }
}

module.exports = { connectDB };
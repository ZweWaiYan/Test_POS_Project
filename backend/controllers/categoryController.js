const { ObjectId } = require("mongodb");
const { connectDB } = require('../mongodb_connector');
const { update } = require("./updateController");
require('dotenv').config();
const db = process.env.DB
const getDbName = require('./getDBname');
/*
let categoryCollection
async function Connectdb(){
    try{
        const client = await connectDB();
        const database = client.db(db);
        categoryCollection = database.collection('category')
    }catch(error){
        if (error.code === 8000) {
            throw new Error("You can't delete another user's data.");
        }
        console.log(error);
    }

}
Connectdb();
*/
async function addCategory(req,res){
    const name = req.body.name;
    try{
        const client = await connectDB();
        const dbName = getDbName(req);
        const database = client.db(dbName);
        const categoryCollection = database.collection('category');
        const result = await categoryCollection.updateOne(
            {name : name},
            {$setOnInsert :{name : name}},
            {upsert : true}
        );

        if(result.upsertedCount > 0){
            res.status(201).json({message:`Category ${name} inserted.`});
        }else{
            res.status(200).json({message : `Category '${name}' already exists`});
        }
    }catch(error){
        if (error.code === 8000) {
            return res.status(403).send({ message: "You can't create category on another user's database." });
        }
        return res.status(500).json({message:"Internal server error while inserting category."})
    }
}


async function fetchCategory(req,res){
    try{
        const client = await connectDB();
        const dbName = getDbName(req);
        const database = client.db(dbName);
        const categoryCollection = database.collection('category')
        const categories = await categoryCollection.find().toArray();
        res.json(categories);
    }catch(error){
        res.status(500).json({ error: "Error fetching categories"})
    }
}

async function updateCategory(req,res){
    const name = req.body.newName;
    try{
        const client = await connectDB();
        const dbName = getDbName(req);
        const database = client.db(dbName);
        const categoryCollection = database.collection('category');
        const result = await categoryCollection.updateOne(
            {_id : new ObjectId(req.params.id)},
            {$set :{name : name}}
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully" });
    }catch(error){
        if (error.code === 8000) {
            return res.status(403).send({ message: "You edit another user's data." });
        }
        res.status(500).json({message:"Error updating category."});
    }
}

async function deleteCategory(req,res){
    try{
        const client = await connectDB();
        const dbName = getDbName(req);
        const database = client.db(dbName);
        const categoryCollection = database.collection('category');
        const result = await categoryCollection.deleteOne({_id: new ObjectId(req.params.id)})
        if(result.deletedCount === 0){
            return res.status(404).json({message : "Category not found."})
        }
        res.status(200).json({message:"Category deleted successfully."})
    }catch(error){
        return res.status(500).json({message:"Error deleting category."})
    }
}

module.exports = {
    addCategory,
    fetchCategory,
    updateCategory,
    deleteCategory
}
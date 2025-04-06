//with mongodb
const { connectDB } = require('../mongodb_connector');
const Joi = require('joi');
const xss = require('xss');
const fs = require('fs').promises;
require('dotenv').config();
const getDBname = require('./getDBname');

async function uploaditem(item, req) {
    const client = await connectDB();
    const dbname = getDBname(req)
    const database = client.db(dbname);
    const collection = database.collection("items");

    try {
        const existingItem = await collection.findOne({
            $or: [{ item_code: item.item_code }, { barcode: item.barcode }]
        });

        if (existingItem) {
            throw new Error(existingItem.item_code === item.item_code ? "Item code already exists." : "Barcode already exists.");
        }

        const result = await collection.insertOne(item);
        //console.log("Inserted Item:", result.insertedId);

    } catch (error) {
        console.error("Insert Error:", error);
        if(error.code === 8000){
            throw new Error(`You can't upload on this user's page.`);
        }
        throw new Error(`Failed to upload item: ${error.message}`);
    }
}

const uploadSchema = Joi.object({
    item_code: Joi.string().pattern(/^[A-Za-z0-9-_]+$/).min(3).max(50).required(),
    barcode: Joi.string().pattern(/^[0-9]+$/).min(8).max(20).required(),
    name: Joi.string().pattern(/^[A-Za-z0-9\-_(),.& ]+$/).min(3).max(50).required(),
    category: Joi.string().pattern(/^[A-Za-z0-9\-_(),.& ]+$/).min(3).max(50).allow(null, ''),
    price: Joi.number().precision(2).positive().required(),
    expire_date: Joi.date().required(),
    alert_date: Joi.date().required(),
    quantity: Joi.number().required(),
    remark: Joi.string().pattern(/^[a-zA-Z0-9\s.,]*$/).allow('').allow(null).optional(),
    image_path: Joi.string().pattern(/^[a-zA-Z0-9\s\-_\/\\.]*$/).min(3).max(500).optional().allow(null, 'null').optional()
});

async function upload(req, res) {
    const item_code = req.body.item_code;
    const barcode = req.body.barcode;
    const name = xss(req.body.name);
    const category = xss(req.body.category);
    const price = Number(req.body.price);
    const expire_date = xss(req.body.expire_date);
    const alert_date = xss(req.body.alert_date);
    const quantity = Number(req.body.quantity);
    const remark = xss(req.body.remark);
    const image_path = req.file ? `/images/${req.file.filename}` : null;

    try {
        // Validate the input data
        const { error } = uploadSchema.validate({ item_code, barcode, name, category, price, expire_date, alert_date, quantity, remark, image_path });
        if (error) {
            console.log(error);
            if (req.file) {
                await fs.unlink(`./${image_path}`);
            }
            return res.status(400).json({ errors: error.details[0].message });
        }

        const item = {
            item_code,
            barcode,
            name,
            category: category || null,
            price,
            expire_date: new Date(expire_date),
            alert_date: new Date(alert_date),
            quantity,
            remark: remark || null,
            image_path,
            upload_date: new Date()
        };

        try {
            await uploaditem(item, req);
            res.status(201).json({ message: 'Uploaded successfully.', imagePath: image_path });
        } catch (error) {
            console.log(error);
            if (req.file) {
                await fs.unlink(`./${image_path}`);
            }
            return res.status(400).json({ message: `Failed to upload item: ${error.message}` });
        }
    } catch (error) {
        console.log(error);
        console.error('Unexpected error:', error.message);
        return res.status(500).json({ message: "Internal server error." });
    }
}

module.exports = { upload };

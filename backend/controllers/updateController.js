const { connectDB } = require('../mongodb_connector');
const Joi = require('joi');
const xss = require('xss');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const getDBname = require('./getDBname');

async function update(req, res) {
    try {
        const client = await connectDB();
        //const database = client.db(db);
        const database = client.db(getDBname(req));

        const collection = database.collection('items');

        const { item_id } = req.params;
        if (!ObjectId.isValid(item_id)) {
            return res.status(400).json({ message: 'Invalid item_id' });
        }

        const item_code = req.body.item_code;
        const barcode = req.body.barcode;
        const name = xss(req.body.name);
        const category = xss(req.body.category);
        const price = req.body.price;
        const expire_date = xss(req.body.expire_date);
        const alert_date = xss(req.body.alert_date);
        const quantity = req.body.quantity;
        const remark = xss(req.body.remark);
        const image_path = req.file ? `/images/${req.file.filename}` : null;
        const file = req.file;

        // **Validation Schema**
        const updateSchema = Joi.object({
            item_code: Joi.string().pattern(/^[A-Za-z0-9-_]+$/).min(3).max(50).allow('').allow(null).optional(),
            barcode: Joi.string().pattern(/^[0-9]+$/).min(8).max(20).allow('').allow(null).optional(),
            name: Joi.string().pattern(/^[A-Za-z0-9\-_(),.& ]+$/).min(3).max(50).allow('').allow(null).optional(),
            category: Joi.string()
                .pattern(/^[A-Za-z0-9\-_(),& ]+$/)
                .min(3)
                .max(50)
                .allow('')
                .allow(null)
                .optional()
                .messages({
                    "string.pattern.base": "Category can only contain letters, numbers, spaces, and these symbols: - _ ( ) , &"
                }),
            price: Joi.number().precision(2).positive().allow('').allow(null).optional(),
            expire_date: Joi.date().allow('').allow(null).optional(),
            alert_date: Joi.date().allow('').allow(null).optional(),
            quantity: Joi.number().min(0).allow(null).optional(),
            remark: Joi.string().pattern(/^[a-zA-Z0-9\s.,]*$/).allow('').allow(null).optional(),
            image_path: Joi.string()
                .pattern(/^[a-zA-Z0-9\s\-_\/\\.]*$/)
                .min(3)
                .max(500)
                .optional()
                .allow(null, 'null')
                .optional()
        });

        const { error } = updateSchema.validate({ item_code, barcode, name, category, price, expire_date, alert_date, quantity, remark, image_path });
        if (error) {
            if (req.file) {
                await fs.promises.unlink(`./${image_path}`);
            }
            return res.status(400).json({ message: error.details[0].message });
        }

        const updateFields = {};
        if (item_code) updateFields.item_code = item_code;
        if (barcode) updateFields.barcode = barcode;
        if (name) updateFields.name = name;
        if (category) updateFields.category = category;
        if (price) updateFields.price = price;
        if (expire_date) updateFields.expire_date = expire_date;
        if (alert_date) updateFields.alert_date = alert_date;
        if (quantity !== undefined) updateFields.quantity = quantity;
        if (remark) updateFields.remark = remark;
        if (image_path) updateFields.image_path = image_path;

        //remove old image when upload succeed
        if (file) {
            const existingItem = await collection.findOne({ _id: new ObjectId(item_id) });
            if (existingItem && existingItem.image_path) {
                const oldImagePath = path.join(__dirname, `../${existingItem.image_path}`);
                if (fs.existsSync(oldImagePath)) {
                    await fs.promises.unlink(oldImagePath);
                }
            }
        }
        console.log(updateFields.quantity)

        const result = await collection.updateOne(
            { _id: new ObjectId(item_id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.status(200).json({ message: 'Updated successfully.' });

    } catch (error) {
        console.error(error);
        if (error.code === 8000) {
            return res.status(403).send({ message: "You can't update another user's data." });
        }
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {update}
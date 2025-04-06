const { ObjectId } = require("mongodb");
const { connectDB } = require('../mongodb_connector');
const Joi = require("joi");
require('dotenv').config();
const db = process.env.DB
const getDbName = require('./getDBname');

// Validation schema
const saleSchema = Joi.object({
    saleId: Joi.string().required(),
    date: Joi.date().iso().required(),
    subtotal: Joi.number().integer().min(1).required(),
    discount: Joi.number().integer().min(0).default(0),
    cashBack: Joi.number().integer().min(0).default(0),
    total: Joi.number().integer().min(1).required(),
    amountPaid: Joi.number().integer().min(1).required(),
    remainingBalance: Joi.number().integer().min(0).default(0),
    items: Joi.array()
        .items(
            Joi.object({
                item_code: Joi.string().allow(null, ""),
                barcode: Joi.string().allow(null, ""),
                name: Joi.string().required(),
                price: Joi.number().integer().min(1).required(),
                quantity: Joi.number().integer().min(1).required(),
            })
        )
        .min(1)
        .required(),
});

async function addsale(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");
    const productsCollection = database.collection("items");

    const { saleId, date, discount, cashBack, items } = req.body;

    try {
        const itemCodes = items.map(item => item.item_code);
        const products = await productsCollection.find({ item_code: { $in: itemCodes } }).toArray();

        let subtotal = 0;
        let validatedItems = [];

        for (const item of items) {
            const product = products.find(p => p.item_code === item.item_code);
            if (!product) {
                return res.status(400).json({ message: `Invalid item: ${item.name}` });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            validatedItems.push({
                item_code: item.item_code,
                barcode: item.barcode,
                name: item.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        const validDiscount = Math.max(0, Math.min(discount, subtotal));
        const validCashBack = Math.max(0, Math.min(cashBack, subtotal - validDiscount));
        const total = subtotal - validDiscount - validCashBack;
        const amountPaid = total;
        const remainingBalance = total - amountPaid;

        const saleData = {
            saleId,
            date,
            subtotal,
            discount: validDiscount,
            cashBack: validCashBack,
            total,
            amountPaid,
            remainingBalance,
            items: validatedItems,
        };

        const { error } = saleSchema.validate(saleData);
        if (error) {
            return res.status(400).json({ message: "Invalid input", errors: error.details });
        }

        const result = await salesCollection.insertOne(saleData);
        res.status(201).json({ message: "Sale recorded successfully", saleId: result.insertedId });

    } catch (error) {
        console.error("Error processing sale:", error);
        res.status(500).json({ message: "Error processing sale", error });
    }
}

// Update sale
async function updatesale(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    const { saleId } = req.params;
    if (!ObjectId.isValid(saleId)) {
        return res.status(400).json({ message: "Invalid sale ID format" });
    }

    const updateFields = req.body;
    delete updateFields.saleId;

    try {
        const result = await salesCollection.updateOne(
            { _id: new ObjectId(saleId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json({ message: "Sale updated successfully" });
    } catch (error) {
        console.error("Error updating sale:", error);
        res.status(500).json({ message: "Error updating sale", error });
    }
}

// Delete sale
async function deletesale(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    const { saleId } = req.params;
    if (!ObjectId.isValid(saleId)) {
        return res.status(400).json({ message: "Invalid sale ID format" });
    }

    try {
        const result = await salesCollection.deleteOne({ _id: new ObjectId(saleId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json({ message: "Sale record deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Fetch sale by ID
async function fetchsalebyId(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    const { saleId } = req.params;

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

// Fetch all sales
async function fetchsales(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    try {
        const sales = await salesCollection.find().toArray();

        if (sales.length === 0) {
            return res.status(404).json({ message: "No sale records found!" });
        }

        res.json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching sale records" });
    }
}

//monthlyreport
async function getyearlyreport(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    let { store, year } = req.query;
    year = parseInt(year);

    if (!year || year < 2000 || year > new Date().getFullYear()) {
        return res.status(400).json({ message: "Invalid year" });
    }

    try {
        const yearStr = `${year}`;

        const sales = await salesCollection.aggregate([
            {
                $match: {
                    date: { $regex: `^${yearStr}` }
                }
            },
            {
                $group: {
                    _id: { $substr: ["$date", 5, 2] },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: { $toInt: "$total" } },
                    totalDiscount: { $sum: { $toInt: "$discount" } },
                    totalCashBack: { $sum: { $toInt: "$cashBack" } },
                    totalAmountPaid: { $sum: { $toInt: "$amountPaid" } },
                    //itemsSold: { $push: "$items" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]).toArray();

        if (sales.length === 0) {
            return res.status(404).json({ message: "No sales found for the given year" });
        }

        const monthlyReport = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = (i + 1).toString().padStart(2, "0");
            const monthData = sales.find(s => s._id === monthIndex);
            return {
                month: parseInt(monthIndex),
                totalSales: monthData ? monthData.totalSales : 0,
                totalRevenue: monthData ? monthData.totalRevenue : 0,
                totalDiscount: monthData ? monthData.totalDiscount : 0,
                totalCashBack: monthData ? monthData.totalCashBack : 0,
                totalAmountPaid: monthData ? monthData.totalAmountPaid : 0,
                //itemsSold: monthData ? monthData.itemsSold.flat() : []
            };
        });

        res.json({
            store,
            year,
            monthlyReport
        });
    } catch (error) {
        console.error("Error generating yearly report:", error);
        res.status(500).json({ message: "Error generating yearly report" });
    }
}


//topsellers
async function gettopsellers(req, res) {
    const client = await connectDB();
    const dbName = getDbName(req);
    const database = client.db(dbName);
    const salesCollection = database.collection("sales");

    let { store, month, year } = req.query;
    month = parseInt(month);
    year = parseInt(year);

    if (!month || !year || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month or year" });
    }

    try {
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        const yearStr = `${year}`;

        const bestSellers = await salesCollection.aggregate([
            {
                $match: {
                    date: { $regex: `^${yearStr}-${monthStr}` }
                }
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: "$items.item_code",
                    name: { $first: "$items.name" },
                    totalQuantity: { $sum: { $toInt: "$items.quantity" } }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            }
        ]).toArray();

        if (bestSellers.length === 0) {
            return res.status(404).json({ message: "No sales data available for the given month and year" });
        }

        res.json({
            store,
            month,
            year,
            top5BestSellers: bestSellers
        });
    } catch (error) {
        console.error("Error fetching best sellers:", error);
        res.status(500).json({ message: "Error fetching best sellers" });
    }
}

module.exports = {
    addsale,
    updatesale,
    deletesale,
    fetchsalebyId,
    fetchsales,
    getyearlyreport,
    gettopsellers
};
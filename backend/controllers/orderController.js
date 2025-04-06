const db = require('../database');
const Joi = require('joi');

async function insert(req,res){
    try{
        const {item_code, name,quantity, order_date, coming_date} = req.body;
        if (!item_code || !name || !quantity || !order_date || !coming_date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const query = `INSERT INTO orders (item_code, name, quantity, order_date, coming_date) VALUES (?,?,?,?,?)`;
        const values = [item_code,name,quantity,order_date,coming_date];
        await db.query(query,values);
        res.status(201).json({ message: "Order inserted successfully"});
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Error."})
    }
}

async function fetchall(req,res){
    try{
        const query = `SELECT * FROM orders`;
        const [order_items] = await db.query(query)
        if(order_items.length === 0){
            res.status(404).json({message:"No order items found."});
        }
        res.json(order_items);
    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Error"});
    }
}

async function update(req,res){
    try{
        const {id, item_code, name,quantity, order_date, coming_date} = req.body;
        const query = `UPDATE orders set item_code=?,name=?,quantity=?,order_date=?,coming_date=? where id = ?`
        const values = [id, item_code, name, quantity, order_date, coming_date];
        await db.query(query,values);
        res.status(201).json({message:"Order item updated successfully."})

    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Error Updating Order Item."})
    }
}

async function delete_order(req,res){
    try{
        const {id} = req.params;
        const query = `DELETE FROM orders where id = ?`
        await db.query(query,[id]);
        res.status(201).json({message:"Order item deleted successfully."})
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Error deleting order item."})
    }
}

async function fetchquantity(req,res){
    try{
        const {id} = req.params;
        const query = `SELECT quantity from items where id = ?`;
        const [quantity] = await db.query(query,[id]);
        res.json(quantity);
    }catch(error){
        return res.status(500).json({message:"Error fetching quantity."})
    }
}

async function fetchbycode(req,res){
    try{
        const item_code = req.body.item_code;
        const query = `SELECT * from orders where item_code = ?`;
        const [name] = await db.query(query,[item_code]);
        if(name.length === 0){
            return res.status(400).json({message:"Item not found."})
        }
        res.json(name)
    }catch(error){
        console.log(error)
        return res.status(500).json({message:"Error fetching name."})
    }
}


module.exports = {
    insert,
    fetchall,
    update,
    delete_order,
    fetchquantity,
    fetchbycode
}
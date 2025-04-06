const { connectDB } = require('../mongodb_connector');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const xss = require('xss');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;
const db = process.env.usersDB;

const loginSCHEMA = Joi.object({
    username: Joi.string().pattern(/^[a-zA-Z0-9-_ ]*$/).min(3).max(50).required().messages({
        'string.pattern.base': `"username" should only contain alphanumeric characters, hyphens, and underscores (no spaces)`,
    }),
    password: Joi.string().required(),
});

async function login(req, res) {
    const username = xss(req.body.username);
    const password = xss(req.body.password);

    const { error } = loginSCHEMA.validate({ username, password });

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const client = await connectDB();
        const database = client.db(db);
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const tokenPayload = {
            user_id: user._id,
            username: user.username,
            role: user.role,
            branch: user.branch,
        };

        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '4h' });

        return res.status(200).json({
            status: "Success",
            token: token,
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Login Error" });
    }
}

module.exports = { login };




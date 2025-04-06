const { connectDB } = require('../mongodb_connector');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const owasp = require('owasp-password-strength-test');
const xss = require('xss');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function isSuperAdminDB() {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined in .env file");
    }

    const match = mongoUri.match(/\/\/([^:]+):/);
    if (!match) {
        throw new Error("Could not extract DB username from MONGO_URI");
    }

    return match[1] === "dbUser"; // Check if DB user is "dbuser"
}

owasp.config({
    allowPassphrases: false,
    maxLength: 20,
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
});

const signupSCHEMA = Joi.object({
    username: Joi.string()
        .pattern(/^[a-zA-Z0-9-_]*$/)
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.pattern.base': `"username" should only contain alphanumeric characters, hyphens, and underscores (no spaces)`
        }),
    password1: Joi.string().min(6).required(),
});

async function adminSignup(req, res) {
    const username = xss(req.body.username);
    const password1 = xss(req.body.password);
    const password2 = xss(req.body.confirmPassword);
    const token = req.headers.authorization?.split(' ')[1];
    console.log('TOKEN',token)

    try {
        const client = await connectDB();
        const usermgmtDB = client.db(process.env.usersDB);
        const usersCollection = usermgmtDB.collection("users");

        const admindb = client.db('admin');
        const userinfo = await admindb.command({ usersInfo: process.env.DBUSER });

        const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
        console.log('role: ', decoded.role)

        const currentUserRoles = userinfo.users[0]?.roles || [];

        const isAdmin = currentUserRoles.some(role => role.role === 'atlasAdmin' && role.db === 'admin');
        const isSiteAdmin = decoded?.role === 'admin';

        if(isAdmin || isSiteAdmin){
            const existingUser = await usersCollection.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username already exists" });
            }

            if (password1 !== password2) {
                return res.status(400).json({ message: "Passwords don't match." });
            }

            const strongPassword = owasp.test(password1);
            if (!strongPassword.strong) {
                return res.status(400).json({ message: strongPassword.errors[0] });
            }

            const { error } = signupSCHEMA.validate({ username, password1 });
            if (error) {
                return res.status(400).json({ errors: error.details[0].message });
            }

            const hashedPassword = await bcrypt.hash(password1, 10);

            await usersCollection.insertOne({
                username,
                password_hash: hashedPassword,
                role: "admin"
            });

            res.status(201).json({ message: "Admin user created successfully" });
        }else {
            return res.status(403).json({ message: 'You need to be database admin or log in as an admin to create an admin account.' });
        }
    } catch (error) {
        console.error("Admin Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { adminSignup };

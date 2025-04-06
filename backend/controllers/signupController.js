const { connectDB } = require('../mongodb_connector');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const owasp = require('owasp-password-strength-test');
const xss = require('xss');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
        .pattern(/^[a-zA-Z0-9-_ ]*$/)
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.pattern.base': `"username" should only contain alphanumeric characters, hyphens, and underscores (no spaces)`
        }),
    password1: Joi.string().min(6).required(),
});

async function signup(req, res) {
    const username = xss(req.body.username);
    const password1 = xss(req.body.password);
    const password2 = xss(req.body.confirmPassword);

    try {
        const client = await connectDB();
        const usermgmtDB = client.db(process.env.usersDB);
        const usersCollection = usermgmtDB.collection("users");
        const admindb = client.db('admin');
        const userinfo = await admindb.command({ usersInfo: process.env.DBUSER });

        const currentUserRoles = userinfo.users[0]?.roles || [];
        //console.log(currentUserRoles[0].role);

        const authorized = currentUserRoles.some(role => role.role === 'readWriteAnyDatabase' && role.db === 'admin');
        if(!authorized && currentUserRoles[0].role != 'atlasAdmin'){
            return res.status(403).json({message:"You can only create accounts on your own database."})
        }
        

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

        let assignedRole = process.env.ROLE;
        let assignedBranch = process.env.DB;

        if (!assignedBranch) {
            return res.status(400).json({ message: "No branch available." });
        }

        const authToken = req.headers.authorization?.split(" ")[1];
        console.log(authToken)
        if (authToken) {
            try {
                const decoded = jwt.verify(authToken, process.env.SECRET_KEY);
                if (decoded.role === "admin") {
                    assignedRole = "admin";
                } else if (decoded.role === "branch_user") {
                    if (decoded.branch !== assignedBranch) {
                        return res.status(403).json({ message: "Access denied: Users can only register in their own branch." });
                    }
                }
            } catch (error) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
        }

        await usersCollection.insertOne({
            username,
            password_hash: hashedPassword,
            role: assignedRole,
            branch: assignedBranch
        });

        res.status(201).json({ message: `User registered successfully on branch ${assignedBranch}` });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { signup };
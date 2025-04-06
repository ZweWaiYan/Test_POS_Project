const { select } = require("framer-motion/client");
const Joi = require("joi");

function getDbName(req) {
    const selectedStore = req.query.store;

    const dbschema = Joi.string()
    .regex(/^[a-zA-Z0-9-_]+$/)
    .min(3)
    .max(50)
    .required();

    const { error } = dbschema.validate(selectedStore);

    if (error) {
        throw new Error("Invalid store name provided.");

    }

    if (req.user.role === 'admin' || selectedStore) {
        return selectedStore;
    } /*else {
        return req.user.branch;
    }*/
}

module.exports = getDbName;

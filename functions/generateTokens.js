const jwt = require("jsonwebtoken");
const config = require("../config/config.json")

module.exports = function tokenGeneration(payload) {
    // Sign Token
    const token = jwt.sign(payload, config.JWT_KEY) ;
    return('Bearer '+token)

};
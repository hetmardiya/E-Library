const jwt = require('jsonwebtoken');
require('dotenv').config();
const readerModel = require('../models/readerModel.js');

async function isLoggedIn(req, res, next) {
    if (req.cookies.jwt) {
        let data = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        req.user = data;
        next();
    } else {
        res.redirect('/LogIn');
    }
}
module.exports = isLoggedIn;
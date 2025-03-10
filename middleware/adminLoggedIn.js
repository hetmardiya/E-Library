const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel.js');

module.exports = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.jwt;
        if (!token) {
            return res.redirect('/admin/adminLogin');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if admin still exists
        const admin = await adminModel.findOne({ email: decoded.email });
        if (!admin) {
            res.clearCookie('jwt');
            return res.redirect('/admin/adminLogin');
        }

        // Attach admin to request
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Admin auth error:', error);
        res.clearCookie('jwt');
        res.redirect('/admin/adminLogin');
    }
};
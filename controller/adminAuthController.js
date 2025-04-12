const adminModel = require("../models/adminModel.js");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken.js");

module.exports.logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).render('error404', { 
                message: 'Please provide email and password' 
            });
        }

        // Find admin
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(401).render('error404', { 
                message: 'Invalid credentials' 
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).render('error404', { 
                message: 'Invalid credentials' 
            });
        }

        // Generate token
        const token = generateToken(admin);

        // Set cookie with 24 hour expiration
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 60 * 1000),
            httpOnly: true
        });

        // Redirect to dashboard
        return res.redirect('/admin/adminDashboard');

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).render('error404', { 
            message: 'Internal server error' 
        });
    }
};

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10),
        httpOnly: true
    });
    res.redirect('/');
};

// Add middleware to check if user is admin
module.exports.isAdmin = async (req, res, next) => {
    try {
        const admin = await adminModel.findOne({ email: req.user.email });
        if (!admin) {
            return res.status(403).render('error404', { 
                message: 'Access denied' 
            });
        }
        next();
    } catch (error) {
        res.status(403).render('error404', { 
            message: 'Access denied' 
        });
    }
};
const readerSchema = require('../models/readerModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken }  = require('../utils/generateToken.js');
const upload = require('../config/multer-config.js');

module.exports.register = async (req, res) => {
    try {
        const { fname, lname, email, phoneNumber, password, address } = req.body;

        // Validate required fields
        if (!fname || !lname || !email || !phoneNumber || !password || !address || !req.file) {
            return res.status(400).render('error404', { 
                message: 'All fields including profile picture are required' 
            });
        }

        // Check if email already exists
        const existingReader = await readerSchema.findOne({ email });
        if (existingReader) {
            return res.status(400).render('error404', { 
                message: 'Email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new reader
        const reader = new readerSchema({
            picture: req.file.buffer,
            fname,
            lname,
            email,
            phoneNumber,
            password: hashedPassword,
            address
        });

        // Save reader
        await reader.save();

        // Generate token and set cookie
        const token = generateToken(reader);
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            httpOnly: true
        });

        req.flash('success', 'Registration successful!');
        res.redirect('/reader/readerHomePage');

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('error404', { 
            message: 'Registration failed. Please try again.' 
        });
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const reader = await readerSchema
            .findOne({ email: email });
        if (!reader) {
            return res.status(400).render('error404', { message: 'You do not have any account for this site......' });
        }
        const isMatch = await bcrypt.compare(password, reader.password);
        if (!isMatch) {
            return res.status(400).render('error404', { message: 'Invalid credentials' });
        }
        const token = generateToken(reader);
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 60 * 1000),
            httpOnly: true
        });
        req.flash('success', 'You have successfully logged in');
        res.redirect('readerHomePage');
    }
    catch (error) {
        res.render('error404', { message: 'Internal server error' });
    }
}
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10),
        httpOnly: true
    });
    res.redirect('/');
}

module.exports.updateReader = async (req, res) => {
    try {
        const { fname, lname, email, phoneNumber, address } = req.body;
        
        // Create update object
        const updateData = {
            fname,
            lname,
            email,
            phoneNumber,
            address
        };

        // Add picture only if a new file was uploaded
        if (req.file) {
            updateData.picture = req.file.buffer;
        }

        // Find and update the reader
        const updatedReader = await readerSchema.findOneAndUpdate(
            { email: req.user.email }, // Use email from JWT token
            updateData,
            { new: true } // Return updated document
        );

        if (!updatedReader) {
            req.flash('error', 'Unable to update profile');
            return res.redirect('back');
        }

        // Update successful
        req.flash('success', 'Profile updated successfully');
        res.redirect('/reader/readerHomePage');

    } catch (error) {
        console.error('Update error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('back');
    }
};

module.exports.deleteReader = async (req, res) => {
    try {
        // Find and delete the reader
        const deletedReader = await readerSchema.findOneAndDelete({ email: req.user.email });

        if (!deletedReader) {
            req.flash('error', 'Unable to delete profile');
            return res.redirect('back');
        }

        // Delete successful
        req.flash('success', 'Profile deleted successfully');
        res.redirect('/');

    } catch (error) {
        console.error('Delete error:', error);
        req.flash('error', 'Error deleting profile');
        res.redirect('back');
    }
};


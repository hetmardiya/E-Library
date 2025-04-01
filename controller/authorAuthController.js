const authorSchema = require('../models/authorModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken.js');
const upload = require('../config/multer-config.js');

module.exports.register = async (req, res) => {
    upload.single('picture')(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.status(400).render('error404', { message: 'File upload failed' });
        }

        const { fname, lname, email, phoneNumber, password, address } = req.body;

        try {
            if (!req.file) {
                return res.status(400).render('error404', { message: 'No file uploaded' });
            }

            const existingAuthor = await authorSchema.findOne({ email });
            if (existingAuthor) {
                return res.status(400).render('error404', { message: 'Email already exists' });
            }
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            const author = new authorSchema({
                picture: req.file.buffer,
                fname,
                lname,
                email,
                phoneNumber,
                password: hashedPassword,
                address
            });

            const token = generateToken(author);
            res.cookie('jwt', token, {
                expires: new Date(Date.now() + 300000),
                httpOnly: true
            });

            await author.save();
            res.redirect('authorHomePage');

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const author = await authorSchema.findOne({ email });
        if (!author) {
            return res.status(400).render('error404', { message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, author.password);
        if (!isMatch) {
            return res.status(400).render('error404', { message: 'Invalid credentials' });
        }

        const token = generateToken(author);
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            httpOnly: true
        });

        res.redirect('authorHomePage');
    } catch (error) {
        res.render('error404', { message: 'Internal server error' });
    }
};

module.exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10),
        httpOnly: true
    });
    res.redirect('/');
};

module.exports.updateAuthor = async (req, res) => {
    try {
        const { fname, lname, email, phoneNumber, address, bio } = req.body;
        
        const updateData = {
            fname,
            lname,
            email,
            phoneNumber,
            address,
            bio
        };

        if (req.file) {
            updateData.picture = req.file.buffer;
        }

        const updatedAuthor = await authorSchema.findOneAndUpdate(
            { email: req.user.email },
            updateData,
            { new: true }
        );

        if (!updatedAuthor) {
            req.flash('error', 'Unable to update profile');
            return res.redirect('back');
        }

        req.flash('success', 'Profile updated successfully');
        res.redirect('/author/authorHomePage');
    } catch (error) {
        console.error('Update error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('back');
    }
};

module.exports.deleteAuthor = async (req, res) => {
    try {
        const deletedAuthor = await authorSchema.findOneAndDelete({ email: req.user.email });
        
        if (!deletedAuthor) {
            req.flash('error', 'Unable to delete account');
            return res.redirect('back');
        }

        res.clearCookie('jwt');
        req.flash('success', 'Account deleted successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Delete error:', error);
        req.flash('error', 'Error deleting account');
        res.redirect('back');
    }
};

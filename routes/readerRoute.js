const express = require('express');
const router = express.Router();
const readerModel = require('../models/readerModel.js');
const readerMiddleware = require('../middleware/readerLoggedIn.js');

router.get('/SignIn', (req, res) => {
    res.render('registerFormReader');
});
router.get('/LogIn', (req, res) => {
    res.render('loginFormReader');
});
const { login } = require('../controller/readerAuthController.js');
router.post('/LogIn', login);

const { logout } = require('../controller/readerAuthController.js');
router.get('/LogOut', logout);

router.get('/register', (req, res) => {
    res.render('registerFormReader');
});
const { register } = require('../controller/readerAuthController.js');
const isLoggedIn = require('../middleware/readerLoggedIn.js');
const upload = require('../config/multer-config.js');

// Update the register route to include file upload middleware
router.post('/register', upload.single('picture'), register);

router.get('/readerHomePage', isLoggedIn, async (req, res) => {
    let reader = await readerModel.findOne({ email: req.user.email });
    res.render('readerHomePage', { reader, success: req.flash('success') });
});

router.get('/browse', isLoggedIn, (req, res) => {
    res.render('browseBooks');
});

const { updateReader } = require('../controller/readerAuthController.js');

// Update profile route with proper middleware order
router.post('/update-profile', isLoggedIn, upload.single('picture'), async (req, res, next) => {
    try {
        await updateReader(req, res);
    } catch (error) {
        next(error);
    }
}
);


// Add a route to show edit profile page
router.get('/edit-profile', isLoggedIn, async (req, res) => {
    const reader = await readerModel.findOne({ email: req.user.email });
    // console.log(reader);
    res.render('editProfile', { reader });
});

// Add these new routes
router.get('/delete-account', isLoggedIn, async (req, res) => {
    const reader = await readerModel.findOne({ email: req.user.email });
    res.render('deleteAccount', { reader });
});

router.post('/confirm-delete', isLoggedIn, async (req, res) => {
    try {
        const { email } = req.body;
        if (email !== req.user.email) {
            req.flash('error', 'Email does not match your account');
            return res.redirect('back');
        }
        
        await readerModel.findOneAndDelete({ email });
        res.clearCookie('jwt');
        req.flash('success', 'Your account has been successfully deleted');
        res.redirect('/');
    } catch (error) {
        console.error('Delete error:', error);
        req.flash('error', 'Error deleting account');
        res.redirect('back');
    }
});

module.exports = router;

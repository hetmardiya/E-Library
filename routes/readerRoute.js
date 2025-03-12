const express = require('express');
const router = express.Router();
const readerModel = require('../models/readerModel.js');
const readerMiddleware = require('../middleware/readerLoggedIn.js');
const bookModel = require('../models/bookModel.js'); // Add this line

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

// Update the premium books route
router.get('/premium', readerMiddleware, async (req, res) => {
    try {
        const books = await bookModel.find({});
        res.render('premiumBooks', { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).render('error404', { 
            message: 'Error loading premium books' 
        });
    }
});

router.get('/register', (req, res) => {
    res.render('registerFormReader');
});
const { register } = require('../controller/readerAuthController.js');
const isLoggedIn = require('../middleware/readerLoggedIn.js');
const upload = require('../config/multer-config.js');

// Update the register route to include file upload middleware
router.post('/register', upload.single('picture'), register);

router.get('/readerHomePage', isLoggedIn, async (req, res) => {
    try {
        let reader = await readerModel.findOne({ email: req.user.email })
            .populate('purchasedBooks'); // Add this populate call
        res.render('readerHomePage', { 
            reader, 
            success: req.flash('success') 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error404', { message: 'Error loading homepage' });
    }
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

router.get('/purchase/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('purchaseBook', { book });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error404', { message: 'Error loading purchase page' });
    }
});

router.post('/purchase/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        const reader = await readerModel.findOne({ email: req.user.email });

        if (!book || !reader) {
            return res.status(404).render('error404', { message: 'Book or reader not found' });
        }

        // Add book to reader's purchased books
        if (!reader.purchasedBooks) {
            reader.purchasedBooks = [];
        }
        reader.purchasedBooks.push(book._id);
        await reader.save();

        // Add reader to book's purchasedBy array
        book.purchasedBy.push(reader._id);
        await book.save();

        req.flash('success', 'Book purchased successfully!');
        res.redirect('/reader/readerHomePage');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error404', { message: 'Error processing purchase' });
    }
});

router.get('/feedback', isLoggedIn, async (req, res) => {
    const reader = await readerModel.findOne({ email: req.user.email });
    res.render('feedback', { 
        userType: 'reader',
        user: reader,
        success: req.flash('success')
    });
});

router.post('/submit-feedback', isLoggedIn, async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await feedbackModel.create({
            name,
            email,
            message,
            userType: 'reader'
        });
        req.flash('success', 'Feedback submitted successfully');
        res.redirect('/reader/readerHomePage');
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).render('error404', { 
            message: 'Error submitting feedback' 
        });
    }
});

module.exports = router;

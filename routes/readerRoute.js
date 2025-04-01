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
        const reader = await readerModel.findOne({ email: req.user.email })
            .populate({
                path: 'purchasedBooks',
                select: 'title cover authorName price description'
            });
        
        res.render('readerHomePage', { 
            reader,
            books: reader.purchasedBooks,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error404', { message: 'Error loading dashboard' });
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

// Show purchase confirmation page
router.get('/purchase/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('purchaseBook', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error loading purchase page' });
    }
});

// Process purchase confirmation and show payment page
router.post('/confirm-purchase/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('paymentPage', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error processing purchase' });
    }
});

// Process payment and complete purchase
router.post('/process-payment/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        const reader = await readerModel.findOne({ email: req.user.email });
        
        if (!book || !reader) {
            req.flash('error', 'Book or reader not found');
            return res.redirect('/reader/readerHomePage');
        }

        // Check if book is already purchased
        if (reader.purchasedBooks.includes(book._id)) {
            req.flash('error', 'You already own this book');
            return res.redirect('/reader/readerHomePage');
        }

        // Add book to reader's purchased books
        reader.purchasedBooks.push(book._id);
        await reader.save();

        req.flash('success', 'Book purchased successfully!');
        res.redirect('/reader/readerHomePage');
    } catch (error) {
        console.error('Payment error:', error);
        req.flash('error', 'Payment failed');
        res.redirect('/reader/readerHomePage');
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

// Handle book details and purchase confirmation page
router.get('/book/:id', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('bookDetail', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error loading book details' });
    }
});

// Render payment page
router.get('/payment/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('paymentPage', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error loading payment page' });
    }
});

// Process payment and complete purchase
router.post('/process-payment/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        const reader = await readerModel.findOne({ email: req.user.email });
        
        if (!book || !reader) {
            req.flash('error', 'Book or reader not found');
            return res.redirect('/reader/readerHomePage');
        }

        // Check if book is already purchased
        if (reader.purchasedBooks.includes(book._id)) {
            req.flash('error', 'You already own this book');
            return res.redirect('/reader/readerHomePage');
        }

        // Add book to reader's purchased books
        reader.purchasedBooks.push(book._id);
        await reader.save();

        req.flash('success', 'Book purchased successfully!');
        res.redirect('/reader/readerHomePage');
    } catch (error) {
        console.error('Payment error:', error);
        req.flash('error', 'Payment failed');
        res.redirect('/reader/readerHomePage');
    }
});

router.get('/book/:id', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('bookDetail', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error loading book details' });
    }
});

router.get('/payment/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        if (!book) {
            return res.status(404).render('error404', { message: 'Book not found' });
        }
        res.render('paymentPage', { book });
    } catch (error) {
        res.status(500).render('error404', { message: 'Error loading payment page' });
    }
});

router.post('/process-payment/:bookId', isLoggedIn, async (req, res) => {
    try {
        const book = await bookModel.findById(req.params.bookId);
        const reader = await readerModel.findOne({ email: req.user.email });
        
        reader.purchasedBooks.push(book._id);
        await reader.save();

        req.flash('success', 'Book purchased successfully!');
        res.redirect('/reader/readerHomePage');
    } catch (error) {
        res.status(500).render('error404', { message: 'Payment failed' });
    }
});

module.exports = router;

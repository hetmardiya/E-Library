const express = require("express");
const router = express.Router();
const authorModel = require("../models/authorModel.js");
const isLoggedIn = require("../middleware/authorLoggedIn.js");
const upload = require("../config/multer-config.js");
const {
  register,
  login,
  logout,
  updateAuthor,
  deleteAuthor,
} = require("../controller/authorAuthController.js");
const bookModel = require('../models/bookModel.js');
const feedbackModel = require('../models/feedbackModel.js');

// Auth routes
router.get("/SignIn", (req, res) => res.render("registerFormAuthor"));
router.get("/LogIn", (req, res) => res.render("loginFormAuthor"));
router.post('/register', register);
router.post("/LogIn", login);
router.get("/LogOut", logout);
router.get("/BookForm",(req,res)=>{
  res.render("browseBooks");
})

// Protected routes
router.get("/authorHomePage", isLoggedIn, async (req, res) => {
  try {
    const author = await authorModel.findOne({ email: req.user.email });
    const books = await bookModel.find({ author: author._id });
    const publishedBooksCount = books.length; // Add this line
    res.render("authorHomePage", {
      author,
      books,
      publishedBooksCount, // Add this line
      success: req.flash("success"),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error404', { message: 'Error loading author page' });
  }
});

router.get("/edit-profile", isLoggedIn, async (req, res) => {
  const author = await authorModel.findOne({ email: req.user.email });
  res.render("editAuthorProfile", { author });
});

router.post(
  "/update-profile",
  isLoggedIn,
  upload.single("picture"),
  updateAuthor
);

router.get("/delete-account", isLoggedIn, async (req, res) => {
  const author = await authorModel.findOne({ email: req.user.email });
  res.render("deleteAuthorAccount", { author });
});

router.post("/confirm-delete", isLoggedIn, async (req, res) => {
  try {
    const { email } = req.body;
    if (email !== req.user.email) {
      req.flash('error', 'Email does not match your account');
      return res.redirect('back');
    }

    await authorModel.findOneAndDelete({ email });
    res.clearCookie('jwt');
    req.flash('success', 'Account deleted successfully');
    res.redirect('/');
  } catch (error) {
    console.error('Delete error:', error);
    req.flash('error', 'Error deleting account');
    res.redirect('back');
  }
});

router.post("/confirm-delete", isLoggedIn, deleteAuthor);

// Book publishing routes
router.get("/publish", isLoggedIn, (req, res) => {
    res.render("publishBook");
});

router.post("/publish-book", isLoggedIn, upload.single("cover"), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const author = await authorModel.findOne({ email: req.user.email });

        const book = new bookModel({
            title,
            description,
            cover: req.file.buffer,
            price,
            author: author._id,
            authorName: `${author.fname} ${author.lname}`
        });

        await book.save();
        
        // Update author's published books
        author.publishedBooks.push(book._id);
        await author.save();

        req.flash('success', 'Book published successfully');
        res.redirect('/author/authorHomePage');
    } catch (error) {
        console.error('Publishing error:', error);
        res.status(500).render('error404', { 
            message: 'Error publishing book' 
        });
    }
});

router.get('/feedback', isLoggedIn, async (req, res) => {
    const author = await authorModel.findOne({ email: req.user.email });
    res.render('feedback', { 
        userType: 'author',
        user: author,
        success: req.flash('success')
    });
});

router.post('/submit-feedback', isLoggedIn, async (req, res) => {
    try {
        const author = await authorModel.findOne({ email: req.user.email });
        await feedbackModel.create({
            name: `${author.fname} ${author.lname}`,
            email: author.email,
            message: req.body.message,
            userType: 'author'
        });
        req.flash('success', 'Feedback submitted successfully');
        res.redirect('/author/authorHomePage');
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).render('error404', { 
            message: 'Error submitting feedback' 
        });
    }
});

module.exports = router;

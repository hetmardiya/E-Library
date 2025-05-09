const express = require("express");
const router = express.Router();
const {
  logIn,
  logout,
  isAdmin,
} = require("../controller/adminAuthController.js");
const isLoggedIn = require("../middleware/adminLoggedIn.js");
const adminModel = require("../models/adminModel.js");
const authorModel = require("../models/authorModel.js");
const readerModel = require("../models/readerModel.js");
const feedbackModel = require("../models/feedbackModel.js"); // Add this line
const bookModel = require('../models/bookModel.js'); // Add this line
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken.js");

if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let admin = await adminModel.find();
    if (admin.length > 0) return res.send("you can't be the owner");
    let { firstName, lastName, dob, email, phone, password, friendName } =
      req.body;
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    let ownerDetails = await adminModel.create({
      firstName,
      lastName,
      dob,
      email,
      phone,
      password: hashedPassword,
      friendName,
    });
    
    const token = generateToken(ownerDetails);
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true,
    });

    await ownerDetails.save();
    res.send(ownerDetails);
});
}

// Add this before other routes
router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

// Login routes
router.get("/adminLogin", (req, res) => {
    if (req.cookies.jwt) {
        return res.redirect('/admin/adminDashboard');
    }
    res.render("adminForm");
});

router.post("/adminLogin", logIn);
router.get("/logout", isLoggedIn, logout);

// Protected admin routes
router.get("/adminDashboard", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const admin = await adminModel.findOne({ email: req.user.email });
        res.render("adminHomePage", {
            admin,
            success: req.flash("success")
        });
    } catch (error) {
        res.status(500).render('error404', { 
            message: 'Error loading dashboard' 
        });
    }
});

// Author management routes
router.get("/authorDetail", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const authors = await authorModel.find({}); // Changed from adminModel to authorModel
        res.render("adminAuthorTable", { authors });
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).render('error404', { 
            message: 'Error loading authors' 
        });
    }
});

router.delete("/delete-author/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const deletedAuthor = await authorModel.findByIdAndDelete(req.params.id); // Changed from adminModel to authorModel
        if (!deletedAuthor) {
            return res.status(404).json({ message: 'Author not found' });
        }
        res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error) {
        console.error('Error deleting author:', error);
        res.status(500).json({ message: 'Error deleting author' });
    }
});

// Reader management routes
router.get("/readerDetail", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const readers = await readerModel.find({});
        res.render("adminReaderTable", { readers });
    } catch (error) {
        console.error('Error fetching readers:', error);
        res.status(500).render('error404', { 
            message: 'Error loading readers' 
        });
    }
});

router.delete("/delete-reader/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const deletedReader = await readerModel.findByIdAndDelete(req.params.id);
        if (!deletedReader) {
            return res.status(404).json({ message: 'Reader not found' });
        }
        res.status(200).json({ message: 'Reader deleted successfully' });
    } catch (error) {
        console.error('Error deleting reader:', error);
        res.status(500).json({ message: 'Error deleting reader' });
    }
});

// Feedback routes
router.get("/authorFeedbacks", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({ userType: 'author' })
            .sort({ createdAt: -1 }); // Sort by newest first
        res.render("adminAuthorFeedback", { feedbacks });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error404', { message: 'Error loading feedbacks' });
    }
});

router.get("/readerFeedbacks", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({ userType: 'reader' });
        res.render("adminReaderFeedback", { feedbacks });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error404', { message: 'Error loading feedbacks' });
    }
});

router.delete("/delete-feedback/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const deletedFeedback = await feedbackModel.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting feedback' });
    }
});

router.get("/readerDetail", (req, res) => {
  res.render("adminReaderTable");
});
router.get("/booksDetail", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const books = await bookModel.find({}).populate('author', 'fname lname');
        res.render("adminBooksTable", { books });
    } catch (error) {
        res.status(500).render('error404', { 
            message: 'Error loading books' 
        });
    }
});

router.delete("/delete-book/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const deletedBook = await bookModel.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book' });
    }
});

router.get("/booksManagement", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const books = await bookModel.find({})
            .populate('author', 'fname lname')
            .sort({ createdAt: -1 });
        res.render("adminBooksTable", { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).render('error404', { 
            message: 'Error loading books' 
        });
    }
});

router.delete("/delete-book/:id", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const deletedBook = await bookModel.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Error deleting book' });
    }
});

router.get("/feedbackManagement", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({})
            .sort({ createdAt: -1 });
        res.render("adminFeedbackTable", { feedbacks });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).render('error404', { 
            message: 'Error loading feedbacks' 
        });
    }
});

// Add this after all routes
router.use((req, res) => {
    res.status(404).render('error404', {
        message: 'Page not found'
    });
});

module.exports = router;

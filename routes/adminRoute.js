const express = require("express");
const router = express.Router();
const {
  logIn,
  logout,
  isAdmin,
} = require("../controller/adminAuthController.js");
const isLoggedIn = require("../middleware/adminLoggedIn.js");
const adminModel = require("../models/adminModel.js");
const authorModel = require("../models/authorModel.js"); // Add this line
const readerModel = require("../models/readerModel.js"); // Add this line
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

router.get("/readerDetail", (req, res) => {
  res.render("adminReaderTable");
});
router.get("/booksDetail", (req, res) => {
  res.render("adminBooksTable");
});

module.exports = router;

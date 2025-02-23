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

// Auth routes
router.get("/SignIn", (req, res) => res.render("registerFormAuthor"));
router.get("/LogIn", (req, res) => res.render("loginFormAuthor"));
router.post('/register', register);
router.post("/LogIn", login);
router.get("/LogOut", logout);

// Protected routes
router.get("/authorHomePage", isLoggedIn, async (req, res) => {
  const author = await authorModel.findOne({ email: req.user.email });
  res.render("authorHomePage", {
    author,
    success: req.flash("success"),
  });
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

module.exports = router;

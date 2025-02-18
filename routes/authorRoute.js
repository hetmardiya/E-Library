const express = require('express');
const router = express.Router();

router.get('/SignIn', (req, res) => {
    res.render('registerFormAuthor');
});
router.get('/LogIn', (req, res) => {
    res.render('loginFormAuthor');
});
router.get('/dashboard', (req, res) => {
    res.render('authorHomePage');
});
router.get('/BookForm', (req, res) => {
    res.render('authorBookForm');
});

module.exports = router;
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
router.post('/register', register);

router.get('/readerHomePage', isLoggedIn , async (req, res) => {
    let reader = await readerModel.findOne({ email: req.user.email });
    res.render('readerHomePage', { reader });
});

module.exports = router;

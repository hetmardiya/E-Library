const express = require('express');
const router = express.Router();

router.get('/SignIn', (req, res) => {
    res.render('registerFormReader');
});
router.get('/LogIn', (req, res) => {
    res.render('loginFormReader');
});

module.exports = router;

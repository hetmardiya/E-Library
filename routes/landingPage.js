const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('main');
});
router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/about', (req, res) => {
    res.render('about');
});
router.get('/feedback', (req, res) => {
    res.render('feedback');
});
router.get('/index', (req, res) => {
    res.render('index');
});
router.get('/help', (req, res) => {
    res.render('help');
});


module.exports = router;
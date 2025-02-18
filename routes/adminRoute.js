const express = require('express');
const router = express.Router();

router.get('/adminLogin', (req, res) => {
    res.render('adminForm');
});
router.get('/homePage', (req, res) => {
    res.render('adminHomePage');
});
router.get('/authorDetail', (req, res) => {
    res.render('adminAuthorTable');
});
router.get('/readerDetail', (req, res) => {
    res.render('adminReaderTable');
});
router.get('/booksDetail', (req, res) => {
    res.render('adminBooksTable');
});


module.exports = router;
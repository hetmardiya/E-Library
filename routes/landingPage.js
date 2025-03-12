const express = require('express');
const router = express.Router();
const feedbackModel = require('../models/feedbackModel.js');

router.get('/', (req, res) => {
    res.render('main', {success: ""});
});
router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/about', (req, res) => {
    res.render('about');
});
router.get('/feedback', async (req, res) => {
    res.render('feedback', {
        userType: 'visitor', // Changed from empty string to 'visitor'
        user: {
            fname: '',
            lname: '',
            email: ''
        },
        success: req.flash('success')
    });
});
router.get('/index', (req, res) => {
    res.render('index' , {success: ""});
});
router.get('/help', (req, res) => {
    res.render('help');
});

router.post('/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await feedbackModel.create({
            name,
            email,
            message,
            userType: 'visitor' // For general visitors
        });
        req.flash('success', 'Feedback submitted successfully');
        res.redirect('/');
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).render('error404', { 
            message: 'Error submitting feedback' 
        });
    }
});

module.exports = router;
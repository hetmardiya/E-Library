const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
    fname: {
        type: String,
        // required: true,
        minlength: 3,
        maxlength: 50
    },
    lname: {
        type: String,
        // required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        // required: true,
        minlength: 5,
        maxlength: 255
    },
    phoneNumber: {
        type: Number,
        // required: true,
        minlength: 10,
        maxlength: 10
    },
    password: {
        type: String,
        // required: true,
        minlength: 5,
        maxlength: 1024
    },
    address: {
        type: String,
        // required: true,
        minlength: 5,
        maxlength: 255
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('reader', readerSchema);
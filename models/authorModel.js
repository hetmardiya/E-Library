const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    picture: Buffer,
    fname: String,
    lname: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: String,
    password: String,
    address: String,
    bio: {
        type: String,
        default: ''
    },
    publishedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
});

module.exports = mongoose.model('Author', authorSchema);
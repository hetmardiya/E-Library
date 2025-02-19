const readerSchema = require('../models/readerModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken }  = require('../utils/generateToken.js');
module.exports.register = async (req, res) => {
    const { fname, lname, email, phoneNumber, password, address } = req.body;
    try {

        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                const reader = await new readerSchema({
                    fname,
                    lname,
                    email,
                    phoneNumber,
                    password: hash,
                    address
                });
                const token = generateToken(reader);
                res.cookie('jwt', token, {
                    expires: new Date(Date.now() + 60000),
                    httpOnly: true
                });
                await reader.save();
                res.redirect('readerHomePage')
            });
        });




    } catch (error) {
        console.log(error);
    }
}

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const reader = await readerSchema
            .findOne({ email: email });
        if (!reader) {
            return res.status(400).send('Invalid Credentials');
        }
        const isMatch = await bcrypt.compare(password, reader.password);
        if (!isMatch) {
            return res.status(400).send('Invalid Credentials');
        }
        const token = generateToken(reader);
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true
        });
        res.redirect('readerHomePage');
    }
    catch (error) {
        console.log(error);
    }
}
module.exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 10),
        httpOnly: true
    });
    res.redirect('/');
}


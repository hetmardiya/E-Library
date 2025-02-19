const mongoose = require('mongoose');
require('dotenv').config();

const debug = require('debug')('development:mongodb-connection');
const mongodb_uri = process.env.MONGO_URI;

mongoose.connect(`${mongodb_uri}/E-Library`)
    .then(() => debug('Connected to MongoDB...'))
    .catch((error) => debug('Could not connect to MongoDB...', error));

module.exports = mongoose.connection;
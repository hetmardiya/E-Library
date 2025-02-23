const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const mongodbConnection = require('./config/mongodb-connection.js');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('connect-flash');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(path.join(__dirname,"views")));

const landingpage = require('./routes/landingPage.js');
app.use("/", landingpage);

const adminRoute = require('./routes/adminRoute.js');
app.use("/admin", adminRoute);

const authorRoute = require('./routes/authorRoute.js');
app.use("/author", authorRoute);

const readerRoute = require('./routes/readerRoute.js');
app.use("/reader", readerRoute);

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
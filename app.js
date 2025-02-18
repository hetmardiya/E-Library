const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
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
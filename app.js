require('dotenv').config();
const createError     = require('http-errors');
const express         = require('express');
const path            = require('path');
const cookieParser    = require('cookie-parser');
const logger          = require('morgan');
const bodyParser      = require('body-parser');
const schedule        = require('node-schedule');
const cors            = require('cors');
const ejsLayouts      = require("express-ejs-layouts");
const wagner          = require('wagner-core');
const helmet          = require('helmet');

var app               = express();

const port = 5032;

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({limit: '5000mb',extended: true}));
app.use(bodyParser.urlencoded({limit: '5000mb',extended: true}));
app.options('*', cors())
app.use(function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*"); 
    // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// const corsOpts = {
//     origin: '*',
  
//     methods: [
//       'GET',
//       'POST',
//     ],
  
//     allowedHeaders: [
//       'Content-Type',
//     ],
//   };
  
//   app.use(cors(corsOpts));
  
/*Setting up layouts*/

app.use(ejsLayouts); 

const mongoose = require('./utils/db')(wagner);
require("./models")(mongoose, wagner);
require('./manager')(wagner);
require('./utils/middlewares')(wagner);
require('./utils/dependencies')(wagner);
require("./routes")(app, wagner);

app.listen(port, () => console.log(`App listening on port ${port}!`));
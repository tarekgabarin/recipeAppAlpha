const express = require('express');
const passport = require('passport');
const http = require('http');
const morgan = require('morgan');
const LocalStrategy = require('passport-local').Strategy;
let path = require('path');
let mongoose = require('mongoose');
let config = require('./config/config');
let bodyParser = require('body-parser');
let recipeRouter = require('./routes/recipeRouter');
let userRouter = require('./routes/userRouter');

import {options} from 'express';



let cors = require('cors');

const app = express();
// set up DB

// mongoose.connect(process.env.MONGODB_URI);

mongoose.connect(config.mongoUrl);

// mongoose.connect(config.mongoUrl, { useMongoClient: true });

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});





// Set up App
app.use(morgan('combined'));
// app.use(bodyParser.json({type: '*/*'})); OLD !!!!

// !! NEW !! //

/*

app.use(function(req, res, next){

    const origin = req.get('origin');

   res.header('Access-Control-Allow-Origin', "*");

   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');

  /// res.header('Access-Control-Allow-Methods', true);

   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, x-auth');


});

*/

app.use(cors());

app.options('*', cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

// !! NEW !! //


app.use(express.static(path.join(__dirname, 'public')));






app.use('/users', userRouter);
app.use('/recipes',recipeRouter);


// Set up Server

const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port);
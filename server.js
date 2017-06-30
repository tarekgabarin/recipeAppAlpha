const express = require('express');
const passport = require('passport');
let mongoose = require('mongoose');
const http = require('http');
const morgan = require('morgan');
const LocalStrategy = require('passport-local').Strategy;
let path = require('path');
let recipeRouter = require('./routes/recipeRouter');
let userRouter = require('./routes/userRouter');
let bcrypt = require('bcrypt');
let config = require('./config/config');

mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

passport.use(new LocalStrategy(function(email, password, done){

    User.findOne({email: email}, (err, user) => {

        if (err) console.log(err);

        if (!user){
            return done(null, false, {message: "User is not registered"});
        }
        else {

            realPassword = String(user.password);

            let doesMatch = bcrypt.compare(password, realPassword, (err, result) => {
                if (err) throw err;
                return result
            });

            if (doesMatch){
                done(null, user)
            }
            else {
                return done(null, false, {message: 'Invalid Password'});
            }

        }

    });

}));

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user){
        if (err || !user) return done(err, null);
        done(null, user);
    });
});


const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: config.secretKey, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
    res.send('Hey, this is your database!')
});

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use((err, req, res, next) =>{
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    })
});


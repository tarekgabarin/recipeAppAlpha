let express = require('express');
let mongoose = require('mongoose');
let path = require('path');
let bodyParser = require('body-parser');
let recipeRouter = require('./routes/recipeRouter');
let userRouter = require('./routes/userRouter');
let bcrypt = require('bcrypt');
let passport = require('passport');
let config = require('./config/config');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy;
let setupController = require('./controllers/setupController');
let session = require('express-session');
mongoose.Promise = global.Promise;

mongoose.connect(config.mongoUrl);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

const app = express();

app.use(express.session({secret: 'mysecret'}));


const port = 3000;

app.listen(port);

app.use(cookieParser());

let User = require('./model/user');




app.use(express.cookieParser());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());

passport.serializeUser(function(user, done){
  done(null, user._id);
});

/// passport.deserializeUser(User.deserializeUser());


app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));

const User = require('./model/user');


app.use(passport.initialize());

passport.serializeUser(function(user, done){
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user){
    if (err || !user) return done(err, null);
    done(null, user);
  });
});

const passport = require('passport');
const User = require('../model/user');
const config = require('../config/config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

let jwtOptions = {

    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secretKey

};

/*

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user){
        if (err || !user) return done(err, null);
        done(null, user);
    });
});

*/



passport.use('jwtAuth', new JwtStrategy(jwtOptions, function(payload, done){

    User.findById(payload.sub, (err, user) => {

        if (err) return done(err, false);


        if (!user){
            done(null, false)
        }
        else{
            done(null, user)
        }
    });


}));

/// always include {usernameField: 'email', passwordField: 'password'}


/*

let localLogin = new LocalStrategy({usernameField: 'email'}, function(email, password, done){


    User.findOne({email: email}).then((user) => {
        if (!user){
            return done(null, false, {message: "User is not registered"});
        }
            user.passwordComparison(password, function(err, doesMatch){
                if (err){return done(err)}

                if (doesMatch){
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            })


    });

    */

    passport.use('localLogin', new LocalStrategy({usernameField: 'email'}, function(email, password, done){


        User.findOne({email: email}).then((user) => {
            if (!user){
                return done(null, false, {message: "User is not registered"});
            }
            user.passwordComparison(password, function(err, doesMatch){
                if (err){return done(err)}

                if (doesMatch){
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            })


        });

    }));




 /*
    User.findOne({email: email}, (err, user) => {

        if (err) return done(err);

        if (!user){
            return done(null, false, {message: "User is not registered"});
        }
        else {

            const realPassword = user.password;

            bcrypt.compare(password, realPassword, (err, result) => {
                if (err) throw err;

                if (result){
                    console.log('result is...' + result);
                    done(null, user)
                }
                else {
                    console.log('result is...' + result);
                    return done(null, false, {message: 'Invalid Password'});

                }

            });
            */

            /*

             let doesMatch = bcrypt.compare(password, realPassword, (err, result) => {
             if (err) throw err;
             return result
             });

             if (doesMatch){
             console.log('doesMatch is...' + doesMatch);
             done(null, user)
             }
             else {
             console.log('doesMatch is...' + doesMatch);
             return done(null, false, {message: 'Invalid Password'});
             }

             */






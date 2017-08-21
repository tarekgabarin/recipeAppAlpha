/**
 * Created by gabar on 2017-06-22.
 */
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token

    let token =  req.header('x-auth');

    console.log('token is...' + token);

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
                // if everything is good, save to request for use in other routes

            if (err) throw err;

            if (decoded){
                    req.decoded = decoded;
                    console.log("within jwt.verify, decoded is..." + req.decoded.id);
                    console.log('req.decoded is now...' + req.decoded);
                    console.log('req.decoded.creationDate is...' + req.decoded.creationDate);
                    console.log('req.decoded.profilePic is now...' + req.decoded.profilePic );
                    next();
                }
        });
    } else {
        // if there is no token
        // return an error
        let err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};




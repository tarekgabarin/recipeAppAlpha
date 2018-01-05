const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


exports.verifyOrdinaryUser = function (req, res, next) {

    let token =  req.header('x-auth');

    console.log('token is...' + token);

    if (token) {

        jwt.verify(token, config.secretKey, function (err, decoded) {


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

        let err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};




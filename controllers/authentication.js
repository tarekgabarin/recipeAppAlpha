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

/*

function generateUserToken(user){

      let passNum = String(user._id).charCodeAt(7);

let timeStamp = new Date().getTime();

      let arrOfId = String(user._id).split('');

      let encodeThis = (passNum + arrOfId[0] + arrOfId[9] + arrOfId[4] + String(Number(passNum * 2)));

    return jwt.encode({sub: user._id, iat: timeStamp}, config.secretKey);

}

exports.signup = function(req, res, next) {

    if (!req.body.email || !req.body.password) {
        return res.status(442).send({error: 'Make sure that you entered your email and password'});
    }

    let doesUserAlreadyExist = User.findOne({email: req.body.email}, (err, user) => {
        if (user){
            return true;
        }
        else {
            return false;
        }
    });

    let checkEmailPromise = (value_) => {

        if (typeof(value_) === 'boolean'){
            resolve(value_)
        }
        else{
            reject('doesUserAlready exist is still not a boolean value')
        }
    };


    checkEmailPromise(doesUserAlreadyExist).then((doesUserAlreadyExist) => {


        if (!doesUserAlreadyExist){

            let password = req.body.password;

            bcrypt.genSalt(10, function(err, salt){
                bcrypt.hash(password, salt, function(err, hash){
                    if (err) throw err;
                    password = hash;
                })
            }).then(() => {

            User.create({
                    username: req.body.username,
                    password: password,
                    name: req.body.name,
                    email: req.body.email,
                    profilePic: req.body.profilePic,
                    ///  userId: userid
                }).then((user) => {

                    res.json({token: generateUserToken(user)});

                })

            });

        }

        else {

            return res.status(422).send({error: "Email is already in use"});
        }

    });



};

*/


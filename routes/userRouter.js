/// You maybe should use bcryptjs instead of regular bcrypt
const bcrypt = require('bcryptjs');
const authentication = require('../controllers/authentication');
const express = require('express');
const passport = require('passport');
const passportService = require('../services/passport');
const config = require('../config/config');
const User = require('../model/user');
const router = express.Router();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.Promise = Promise;
const Recipe = require('../model/recipe');

//// const cors = require('cors');

///!!!! NEW !!!!//

const AWS = require('aws-sdk');

const fs = require('fs');


const multer = require('multer');

const multerS3 = require('multer-s3');

const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

AWS.config.update({

    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: "ca-central-1"

});

s3 = new AWS.S3();

const upload = multer({

    storage: multerS3({

        s3: s3,

        bucket: "deelishapp",

        key: function (req, file, cb) {
            console.log(file);
            cb(null, Date.now().toString()); //use Date.now() for unique file keys
        }
    })

});

/// NEW !!!!


/*

 router.use(function(req, res, next) {
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 next();
 });

 */

//// NEW !!!!


// Finally works


router.post('/uploadProfilePic', authentication.verifyOrdinaryUser, upload.single('file'), (req, res, next) => {


    Recipe.where({
        postedBy: req.decoded.id,
        postersCreationDate: req.decoded.creationDate
    }).update({$set: {chefAvatar: req.file.location}}).then(() => {

        console.log('chefAvatar Changed!')

    });

    User.findOne({_id: String(req.decoded.id), creationDate: req.decoded.creationDate}).then((user) => {


        user.set('profilePic', String(req.file.location));

        let value_ = generateUserToken(user);

        res.header('x-auth', value_).send(value_);

        user.save();

        for (let i = 0; i < user.usersReviews.length; i++) {

            Recipe.findOne({
                _id: user.usersReviews[i].reviewOf,
                postersCreationDate: user.usersReviews[i].chefsCreationDate
            }).then((recipe) => {


                for (let l = 0; l < recipe.reviewsOfRecipe.length; l++) {

                    if (recipe.reviewsOfRecipe[l].postedBy === req.decoded.id) {

                        recipe.reviewsOfRecipe[l].profilePic = req.file.location;

                        recipe.save();

                        break;

                    }

                }


            });


        }

    })


});

// !!!!NEW !!!//


// Keep the function, it's a vital part of the code

function generateUserToken(user) {


    return jwt.sign({
        id: user._id,
        creationDate: user.creationDate,
        username: user.username,
        profilePic: user.profilePic
    }, config.secretKey);


}


// To register a new user

// Works

router.post('/register', (req, res, next) => {


    if (!req.body.email || !req.body.password) {
        return res.status(442).send({error: 'Make sure that you entered your email and password'});
    }


    User.findOne({email: req.body.email})

        .then((user) => {

            if (!user) {

                let password = req.body.password;

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        if (err) throw err;
                        User.create({
                            username: req.body.username,
                            password: hash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            city: req.body.city,
                            country: req.body.country,
                            email: req.body.email,
                            profilePic: req.body.profilePic,
                        }).then((user) => {

                            let value_ = generateUserToken(user);


                            res.header('x-auth', value_).send(value_);


                        });
                    });
                });
            }

            else if (user) {

                if (user.isActive === false) {

                    let data = {
                        usersReviewedRecipes: undefined,
                        usersCreatedRecipes: undefined
                    };

                    user.set('isActive', true);

                    data.usersCreatedRecipes = user.usersRecipes;

                    data.usersReviewedRecipes = user.usersReviews;

                    user.save();

                    let getDataPromise = () => {

                        return new Promise((resolve, reject) => {

                            if (data.usersCreatedRecipes !== undefined && data.usersReviewedRecipes !== undefined) {
                                resolve();
                            }
                            else {
                                reject('data stuff is still null');
                            }

                        })

                    };

                    getDataPromise().then(() => {


                        console.log('Running getUserPromise.then callback');

                        for (let i = 0; i < data.usersCreatedRecipes.length; i++) {

                            Recipe.findByIdAndUpdate(data.usersCreatedRecipes[i].recipeId, {$set: {isActive: true}}).then(() => {

                                console.log('Recipe documents are active again');

                            })

                        }

                        for (let i = 0; i < data.usersReviewedRecipes.length; i++) {

                            Recipe.findByIdAndUpdate(data.usersReviewedRecipes[i].reviewOf).then((recipe) => {

                                for (let l = 0; l < recipe.reviewsOfRecipe.length; l++) {

                                    if (recipe.reviewsOfRecipe[l].postersName === req.body.username) {
                                        recipe.reviewsOfRecipe[l].isActive = true;
                                        recipe.save();
                                        break;
                                    }
                                }

                            });
                        }


                    });

                    res.send('Account reactivated!');

                }


            }


            else {

                return res.status(422).send({error: "Email is already in use"});
            }

        })

        .catch((err) => {
            console.log(err);
        });


});

/// To view your own profile

// Works

router.get('/myprofile', authentication.verifyOrdinaryUser, (req, res, next) => {

    User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate})

        .then((user) => {

            if (user !== null && user !== undefined) {

                res.send(user)

            }

        })

        .catch((err) => {
            console.log(err);
        });

});

// works

router.put('/editProfile', authentication.verifyOrdinaryUser, (req, res, next) => {

    User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

        if (String(user._id) === req.decoded.id) {

            let firstName = req.body.firstName;

            let lastName = req.body.lastName;

            let aboutMe = req.body.aboutMe;

            let city = req.body.city;

            let country = req.body.country;

            user.firstName = firstName;

            user.lastName = lastName;

            user.city = city;

            user.aboutMe = aboutMe;

            user.country = country;

            user.save();

            res.send(user);


        }


    })


});

/// To view another users profile

// works

router.get('/:username', (req, res, next) => {

    /// get data for viewing other users' profile

    User.findOne({username: req.params.username, isActive: true})

        .then((user) => {
            res.send(user)
        })

        .catch((err) => {

            console.log(err);
        });

});

// To view that users reviews

// Works

router.get('/:username/reviews', (req, res, next) => {

    // gets data for viewing reviews made by a user via their user profile

    User.findOne({username: req.params.username})

        .then((user) => {

            res.send(user.usersReviews);
        })

        .catch((err) => {
            console.log(err);
        });

});

// To  view that users recipes

// Works

router.get('/:username/recipes', (req, res, next) => {

    // gets data for viewing recipes made by user via their user profile

    // clicking on one of these will get you to /recipes/:category/:name route in recipeRouter

    User.findOne({username: req.params.username})

        .then((user) => {


            recipeModel = mongoose.model('Recipe');

            recipeModel.find({postedBy: user._id, postersCreationDate: user.creationDate}).then((recipes) => {
                res.json(recipes);
            });

        })

        .catch((e) => {
            console.log(e);
        });

});


// Works : )

router.post('/manage-account/deactivate', authentication.verifyOrdinaryUser, (req, res, next) => {

    let data = {
        usersReviewedRecipes: undefined,
        usersCreatedRecipes: undefined
    };


    let getUserPromise = () => {

        return new Promise((resolve, reject) => {

            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {


                user.set('isActive', false);

                data.usersCreatedRecipes = user.usersRecipes;

                data.usersReviewedRecipes = user.usersReviews;

                user.save();

                if (data.usersReviewedRecipes !== undefined && data.usersCreatedRecipes !== undefined) {

                    resolve()
                }
                else {

                    reject('data stuff is undefined');
                }

            });


        });

    };

    getUserPromise().then(() => {

        for (let i = 0; i < data.usersCreatedRecipes.length; i++) {

            Recipe.findByIdAndUpdate(data.usersCreatedRecipes[i].recipeId, {$set: {isActive: false}}).then(() => {

                console.log('Recipe documents are not active anymore');

            })

        }

        for (let i = 0; i < data.usersReviewedRecipes.length; i++) {

            Recipe.findByIdAndUpdate(data.usersReviewedRecipes[i].reviewOf).then((recipe) => {

                for (let l = 0; l < recipe.reviewsOfRecipe.length; l++) {

                    if (recipe.reviewsOfRecipe[l].postedBy === req.decoded.id) {
                        recipe.reviewsOfRecipe[l].isActive = false;
                        recipe.save();
                        break;
                    }
                }

            });
        }

        res.send('Account deactivated');


    });


});

// Works

router.get('/:username', (req, res, next) => {


    User.findOne({_id: req.params.username, isActive: true})

        .then((user) => {
            res.json(user);
        })

        .catch((e) => {
            console.log(e);
        });

});

// Works

router.post('/login', passport.authenticate('localLogin', {session: false}), (req, res, err) => {

    if (err) console.log(err);

    let value_ = generateUserToken(req.user);

    res.header('x-auth', value_).send(value_);

});


// NEW

router.get('/logout', authentication.verifyOrdinaryUser, (req, res, next) => {

    req.logOut();

    req.session.destroy(function (err) {
        if (err) throw err;


    });

    res.send('logged out');


});

// This works : )

/// Subscirbes and unsubscribes to another user

router.put('/:userid/subscribe', authentication.verifyOrdinaryUser, (req, res, err) => {

    let alreadySubbed = undefined;

    let creationNum = undefined;

    let getUserPromise = () => {

        return new Promise((resolve, reject) => {

            User.findOne({_id: req.decoded.id, isActive: true, creationDate: req.decoded.creationDate}).then((user) => {

                if (user.subscribedTo.length === 0) {

                    alreadySubbed = false;
                    resolve(user);
                }

                else {


                    for (let i = 0; i < user.subscribedTo.length; i++) {


                        if (user.subscribedTo[i].userid === req.params.userid) {
                            alreadySubbed = true;
                            creationNum = user.subscribedTo[i].creationDate;

                            res.send('Already subscribed to user');
                            resolve(user);
                            break;
                        }
                        else {
                            console.log('user was not in in subscribedTo array');
                            alreadySubbed = false;
                            resolve(user);
                        }

                    }


                }


            })

        })


    };

    getUserPromise().then((user) => {

        if (alreadySubbed === false) {

            User.findOne({_id: req.params.userid}).then((other) => {


                user.subscribedTo.push({userid: String(other._id), creationDate: other.creationDate});

                other.followedBy.push({userid: String(user._id), creationDate: user.creationDate});

                user.save();

                other.save();

                res.send('Subscirbed to user');

            })

        }
        else if (alreadySubbed === true) {


            User.findOneAndUpdate({
                _id: user._id,
                creationDate: user.creationDate
            }, {$pull: {subscribedTo: {userid: req.params.userid, creationDate: creationNum}}}).then(() => {

                console.log('removed other from your subscribedTo Array');
            });


            User.findOneAndUpdate({
                _id: req.params.userid,
                creationDate: creationNum
            }, {$pull: {followedBy: {userid: user._id, creationDate: user.creationDate}}}).then(() => {

                console.log('You were removed from the users followedBy Array');
            });

            res.send('done');

        }

    })

});

// Works like a charm :)

router.post('/recommended', authentication.verifyOrdinaryUser, (req, res) => {

    console.log('In subscribed, req.decoded.id is....' + req.decoded.id);

    let usersSubs = {
        subIds: []
    };


    let getUsersSubs = () => {

        return new Promise((resolve, reject) => {

            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {


                for (let i = 0; i < user.subscribedTo.length; i++) {

                    usersSubs.subIds.push(user.subscribedTo[i].userid);

                }

                if (usersSubs.subIds.length !== 0) {

                    resolve()

                }
                else {
                    reject('usersSubs is an empty array');
                }


            });


        })
    };

    getUsersSubs().then(() => {

        Recipe.find({postedBy: {$in: usersSubs.subIds}}).then((recipes) => {
            res.json(recipes);
        });

    });

});


module.exports = router;
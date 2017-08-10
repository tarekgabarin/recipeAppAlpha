/// You maybe should use bcryptjs instead of regular bcrypt
const bcrypt = require('bcryptjs');
const authentication = require('../controllers/authentication');
const express = require('express');
const passport = require('passport');
const passportService =require('../services/passport');
const config = require('../config/config');
const User = require('../model/user');
const router = express.Router();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.Promise = Promise;
const Recipe = require('../model/recipe');

// Keep the function, it's a vital part of the code

function generateUserToken(user){


    return jwt.sign({id: user._id, creationDate: user.creationDate, username: user.username}, config.secretKey);

    /// return jwt.encode({sub: user._id, iat: timeStamp}, config.secretKey); this for the simple version

}


// To register a new user

// Works

router.post('/register', (req, res, next) => {


        // I guess I will have to use this, and set this to true or false within findOne

    /*
        function generateUserToken(user){

            return jwt.sign({sub: user._id, creationDate: user.creationDate}, config.secretKey);

            // return jwt.sign(user._id, config.secretKey);

           /// return jwt.encode({sub: user._id, iat: timeStamp}, config.secretKey); this for the simple version

        }

        */

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
                                name: req.body.name,
                                email: req.body.email,
                                profilePic: req.body.profilePic,
                                ///  userId: userid
                            }).then((user) => {

                                let value_ = generateUserToken(user);

                                /*
                                res.json({token: value_});

                                res.set('x-auth', value_);

                                */

                                res.header('x-auth', value_).send(value_);


                            });
                        });
                    });
                }

                else if (user){

                    if (user.isActive === false){

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

                                if (data.usersCreatedRecipes !== undefined && data.usersReviewedRecipes !== undefined){
                                    resolve();
                                }
                                else {
                                    reject('data stuff is still null');
                                }

                            })

                        };

                        getDataPromise().then(() => {

                            console.log('running getDataPromise.then callback');


                            console.log('Running getUserPromise.then callback');

                            for (let i = 0; i < data.usersCreatedRecipes.length; i++){

                                Recipe.findByIdAndUpdate(data.usersCreatedRecipes[i].recipeId, {$set: {isActive: true}}).then(() => {

                                    console.log('Recipe documents are active again');

                                })

                            }

                            for (let i = 0; i < data.usersReviewedRecipes.length; i++){

                                Recipe.findByIdAndUpdate(data.usersReviewedRecipes[i].reviewOf).then((recipe) => {

                                    for (let l = 0; l < recipe.reviewsOfRecipe.length; l++){

                                        if (recipe.reviewsOfRecipe[l].postersName === req.body.username){
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

        if (user !== null && user !== undefined){

            res.send(user)

        }

        })

        .catch((err) => {
            console.log(err);
        });

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

            console.log('user._id is...' + user._id);

            console.log('user.creationDate is...' + user.creationDate);

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

    console.log('req,decoded.id...' + req.decoded.id);



    let getUserPromise = () => {

        return new Promise((resolve, reject) => {

            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                console.log('user is....' + user);

                user.set('isActive', false);

                data.usersCreatedRecipes = user.usersRecipes;

                data.usersReviewedRecipes = user.usersReviews;

                user.save();

                if (data.usersReviewedRecipes !== undefined && data.usersCreatedRecipes !== undefined){

                    resolve()
                }
                else {
                    console.log('data.usersReviewedRecipes is...' + data.usersReviewedRecipes);
                    console.log('data.usersCreatedRecipes is...' + data.usersCreatedRecipes);
                    reject('data stuff is undefined');
                }

            });



        });

    };

    getUserPromise().then(() => {

        console.log('Running getUserPromise.then callback');

        for (let i = 0; i < data.usersCreatedRecipes.length; i++){

          Recipe.findByIdAndUpdate(data.usersCreatedRecipes[i].recipeId, {$set: {isActive: false}}).then(() => {

              console.log('Recipe documents are not active anymore');

          })

        }

        for (let i = 0; i < data.usersReviewedRecipes.length; i++){

            Recipe.findByIdAndUpdate(data.usersReviewedRecipes[i].reviewOf).then((recipe) => {

                for (let l = 0; l < recipe.reviewsOfRecipe.length; l++){

                    if (recipe.reviewsOfRecipe[l].postedBy === req.decoded.id){
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

router.get('/:username', (req,res, next) => {

    /*

    User.findOne({_id: req.params.userid})

        .then((user) => {

            console.log(user);

            if (user !== undefined && user !== null){

                if (user.isActive === true){

                    res.json(user)
                }
            }

        })

        .catch((err) => {
            console.log(err);
        })

        */

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

    console.log("value_.... is" + value_);

    res.header('x-auth', value_).send(value_);

    console.log(req.user);

 ///   res.header('Authorization', generateUserToken(req.user));

});

// This works : )

/// Subscirbes and unsubscribes to another user

router.put('/:userid/subscribe', authentication.verifyOrdinaryUser, (req, res, err) => {

    let alreadySubbed = undefined;

    let creationNum = undefined;

    let getUserPromise = () => {

        return new Promise((resolve, reject) => {

            User.findOne({_id: req.decoded.id, isActive: true, creationDate: req.decoded.creationDate}).then((user) => {

                if (user.subscribedTo.length === 0){

                    alreadySubbed = false;
                    resolve(user);
                }

                else {


                    for (let i = 0; i < user.subscribedTo.length; i++){

                        console.log('In for loop, user.subscribedTo[i].userid is....' + user.subscribedTo[i].userid);


                        if (user.subscribedTo[i].userid === req.params.userid){
                            alreadySubbed = true;
                            creationNum = user.subscribedTo[i].creationDate;
                            console.log('user.subscribedTo[i].creationDate is...' + String(user.subscribedTo[i].creationDate));
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

      console.log('In callback, user is...' + user);

      console.log('In callback, user.subscribedTo is...' + user.subscribedTo);

      if (alreadySubbed === false){

          User.findOne({_id: req.params.userid}).then((other) => {

              console.log('other is...' + other);

              user.subscribedTo.push({userid: String(other._id), creationDate: other.creationDate});

              other.followedBy.push({userid: String(user._id), creationDate: user.creationDate});

              user.save();

              other.save();

              res.send('Subscirbed to user');

          })

      }
      else if (alreadySubbed === true){

          console.log('In callback, creationNum is...' + creationNum);

          User.findOneAndUpdate({_id: user._id, creationDate: user.creationDate}, {$pull: {subscribedTo: {userid: req.params.userid, creationDate: creationNum}}}).then(() => {

              console.log('removed other from your subscribedTo Array');
          });

          console.log('creationNum is....' + creationNum);

          User.findOneAndUpdate({_id: req.params.userid, creationDate: creationNum}, {$pull: {followedBy: {userid: user._id, creationDate: user.creationDate}}}).then(() => {

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


                for (let i = 0; i < user.subscribedTo.length; i++){

                    usersSubs.subIds.push(user.subscribedTo[i].userid);

                }

                if (usersSubs.subIds.length !== 0){
                    console.log('usersSubs.subIds is...' + usersSubs.subIds);
                    resolve()

                }
                else {
                    reject('usersSubs is an empty array');
                }


            });


        })
    };

    getUsersSubs().then(() => {


        console.log('In getUsersSubs callback, usersSubs.subIds...' + usersSubs.subIds);

        /// console.log('typeof(usersSubs.subIds[0]) is....' + typeof(usersSubs.subIds[0]));

        Recipe.find({postedBy: {$in: usersSubs.subIds}}).then((recipes) => {
            res.json(recipes);
        });

    });

});


module.exports = router;
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

// Keep the function, it's a vital part of the code

function generateUserToken(user){


    return jwt.sign({id: user._id, creationDate: user.creationDate, username: user.username}, config.secretKey);

    /// return jwt.encode({sub: user._id, iat: timeStamp}, config.secretKey); this for the simple version

}


// To register a new user

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

                                res.json({token: value_});

                                res.set('x-auth', value_);


                            });
                        });
                    });
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

router.get('/:username', (req, res, next) => {

    /// get data for viewing other users' profile

   User.findOne({username: req.params.username})

       .then((user) => {
           res.send(user)
       })

       .catch((err) => {

            console.log(err);
       });

});

// To view that users reviews

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

router.get(':username/recipes', (req, res, next) => {

    // gets data for viewing recipes made by user via their user profile

    // clicking on one of these will get you to /recipes/:category/:name route in recipeRouter

    User.findOne({username: req.params.username})

        .then((user) => {

            Recipe.find({_id: user._id, creationDate: user.creationDate}).then((err, recipes) => {
                if (err) console.log(err);
                res.send(recipes);
            });

        });

});

// To view your own review history

router.get('/review-history/', authentication.verifyOrdinaryUser, (req, res, next) => {


    // for viewing your own review history

    // fuck pagination through express, Angular will take care of it for you


    User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate})

        .then((user) => {

            res.send(user.usersReviews);

        })

        .catch((err) => {
            console.log(err);
        });


});

// To view your own recipes

router.delete('/myrecipes/:name', authentication.verifyOrdinaryUser, (req, res, next) => {

    /// this is for deleting a recipe

    Recipe

        .findOneAndRemove({name: req.params.name, creationDate: req.decoded.creationDate})

        .then((recipe) => {

            res.json(recipe + 'was succesfully deleted!');

        })

        .catch((err) => {
            console.log(err);
        });



});



router.delete('/manage-account/delete', authentication.verifyOrdinaryUser, (req, res, next) => {

    /// first delete all the recipes you've made as well as the reviews

    let didUpdateUsers = false;



    let getUserDoc = () => {

        User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate})

            .then((user) => {
                return user;
            });

    };


    let getUserDocPromise = () => {

        return new Promise((resolve, reject) => {

            getUserDoc().then((user) => {
                if (user !== null && user !== undefined){
                    resolve(user);
                }
                else {
                    reject('user is still undefined or null')
                }
            })

        })
    };

    getUserDocPromise().then((user) => {


        let updateUserReviewsAndFavourites = (recipeId, recipeCreationDate) => {

            Recipe.findOne({_id: recipeId, creationDate: recipeCreationDate}).then((recipe) => {

                let usersWhoReviewed = user.reviewedBy;

                let usersWhoLiked = recipe.likedBy;



                for (let i = 0; i < usersWhoReviewed.length - 1; i++){

                  User.findOne({_id: usersWhoReviewed[i][0], creationDate: usersWhoReviewed[i][1]}).then((others) => {

                      others.update({'usersReviews.reviewOf': recipeId}, {
                          $set: {
                              'usersReviews.$.recipeName': "Recipe was deleted by its chef :(",
                          }
                      });

                      others.save();

                  })

                }

                for (let i = 0; i < usersWhoLiked.length - 1; i++){

                    User.update({_id: usersWhoReviewed[i][0], creationDate: usersWhoReviewed[i][1]}, {$pull: {usersFavouriteRecipes: [recipeId, recipeCreationDate]}});

                }

            })

        };


        let recipesInfoArray = user.usersRecipes;

        for (let i = 0; i < recipesInfoArray.length - 1; i++){

            updateUserReviewsAndFavourites(recipesInfoArray[0], recipesInfoArray[1]);

        }

        let followers_ = user.followedBy;


        let updateFollowersSubs = (followerId, followerCD) => {

            User.findOne({_id: followerId, creationDate: followerCD}).then((follower) => {

                follower.update({$pull: {subscribedTo: [user._id, user.creationDate]}});

                follower.save();


            })

        };


        for (let i = 0; i < followers_.length - 1; i++){

          updateFollowersSubs(followers_[0], followers_[1]);
        }

        })

        .then((user) => {

            Recipe.remove({postedBy: user._id, postersCreationDate: user.creationDate});

        })

        .then((user) => {

            User.findOneAndRemove({_id: user._id, creationDate: user.creationDate});


        });



});

router.get('/:userid/', (req,res, next) => {

    User.findOne({_id: req.params.userid})

        .then((user) => {

            if (user !== undefined && user !== null){

                return user;

            }

        })

        .catch((err) => {
            console.log(err);
        })

});


router.post('/login', passport.authenticate('localLogin', {session: false}), (req, res, err) => {

    if (err) console.log(err);

    let value_ = generateUserToken(req.user);

    console.log("value_.... is" + value_);

   res.header('x-auth', value_).send(value_);

    console.log(req.user);

 ///   res.header('Authorization', generateUserToken(req.user));

});



// router.post('/login')

/*
router.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: 'users/login', failureFlash: true}),
(req, res) => {
  res.redirect('/')
});

*/

module.exports = router;
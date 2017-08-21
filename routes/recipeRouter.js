const passportService =require('../services/passport');
const authentication = require('../controllers/authentication');
const passport = require('passport');
const express = require('express');
const requireAuth = passport.authenticate('jwtAuth', {session: false});
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const Recipe = require('../model/recipe');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
mongoose.Promise = Promise;
const User = require('../model/user');
const reviewController = require('../controllers/reviewController');
/// const reviewSchema = require('../model/review');






///
/// use this to view the recipes by page

const router = express.Router();


const AWS = require('aws-sdk');

const fs = require('fs');


const multer = require('multer');

const multerS3 = require('multer-s3');

const accessKeyId =  process.env.AWS_ACCESS_KEY;
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

// Works


router.get('/:page', (req, res) => {

    /// the starting req.params.page is 0
    let skip_ = 10 * Number(req.params.page);

    Recipe.find({}, (err, recipes) => {

        if (err) res.send(err);

        res.json(recipes);
    }).skip(skip_).limit(10);

});

/// Get the recipe by category

// Works



router.get('/category/:category/:page', (req, res) => {

    // the first page will be zero to avoid unintentionally skipping over first 10

   let skip_ = 10 * Number(req.params.page);



    Recipe.find({category: String(req.params.category), isActive: true}, (err, recipe) => {
        if (err) res.send(err);

        res.json(recipe)
    }).skip(skip_).limit(10);



});

/// Get a specific Recipe, and view it

/// This works

router.get('/:category/:name', (req, res) => {

    /// I assume that you'll get the reviews as well as the recipe with this one



    Recipe.findOne({category: req.params.category, name: req.params.name, isActive: true}, (err, recipe) => {
        if (err) res.send(err);

        res.json(recipe);
    }).lean();

});


// Returns the top rated recipes.

/// I'm gonna first try to do this in the front end, but it does work :)


router.get('/top', authentication.verifyOrdinaryUser, (req, res) => {

    // Use aggregate

    Recipe.aggregate([

        {$match: {'isActive': true}},

        {$group: {

        _id: "$_id",

        postedBy: '$postedBy',

        name: "$name",

        postersName: "$postersName",

        category: '$category',

        numberOfRatings: '$numberOfRatings',

        totalAddedRatings: '$totalAddedRatings',

        postersCreationDate: '$postersCreationDate',

        reviewAverage: ['totalAddedRatings', 'numberOfRatings']

        }},

        {$sort: {'reviewAverage': 1}}


        ]).skip(skip_).limit(10);



});





/// This works!

router.post('/addrecipe', authentication.verifyOrdinaryUser, upload.single('file'), (req, res) => {

    console.log('the route is running now!');

    console.log('req.decoded.username is...' + req.decoded.username);



    console.log('is decoded working....' + req.decoded.id);


    Recipe.create({

        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
        category: req.body.category,
        postedBy: req.decoded.id,
        postersCreationDate: req.decoded.creationDate,
        postersName: req.decoded.username,
        isActive: req.decoded.isActive,
        profilePic: String(req.file.location),
        chefAvatar: req.decoded.profilePic
    }).then((recipe) => {

        console.log('Inserting into usersRecipes');


        User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

            console.log('The array that is being inserted into usersRecipe is...' + [recipe._id, req.decoded.creationDate]);

            user.usersRecipes.push({recipeId: recipe._id, creationDate: req.decoded.creationDate, category: req.body.category});

            console.log('usersRecipe is now...' + user.usersRecipes);

            user.save();

            res.json(recipe);
        });

    });




});





/// Adding Review and if review already exists, edits it

/// Works finally

router.post('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next) {

    let reviewScore = (Number(req.body.howGoodTaste) + Number(req.body.wouldMakeAgain) + Number(req.body.howEasyToMake)) / 3;

    console.log(reviewScore);

    console.log(typeof(reviewScore));

    let votingRecord = {
        alreadyVoted: undefined,
        alreadyDownvoted: undefined,
        alreadyUpvoted: undefined,
        gotReviewData: false,
        gotChefDocument: false,
        gotUserDocument: false,
        gotRecipeDocument: false
    };

    let dataObj = {

        chefsId: undefined,
        chefsCreationDate: undefined,
        reviewOf: undefined,
        recipeName: req.params.name,
        postersCreationDate: req.decoded.creationDate,
        postedBy: req.decoded.id,
        newEntry: undefined,
        reviewIndex: undefined,
        originalRating: undefined,
        newScore: undefined
    };





    let gotReviewDataPromise = () => {

        return new Promise((resolve, reject) => {

            console.log("votingRecord is..." + votingRecord);

            console.log('req.decoded is...' + req.decoded);

            console.log('req.body.comment is....' + String(req.body.comment));

            reviewController.checkThenGetRecipe(dataObj, votingRecord, req.params.name, req.params.category, req.decoded.id).then((recipe) => {

                if (recipe !== undefined && recipe !== null) {
                    if (votingRecord.gotRecipeDocument === true && votingRecord.gotReviewData === true) {
                        console.log('in resolve loop, recipe._id should be ...' + recipe._id);
                        console.log('The state of dataObj is...' + dataObj);
                        resolve(recipe);

                    }
                }
                ///
                else {
                    console.log('The state of dataObj is...' + dataObj.reviewOf);
                    console.log('The state of recipe is...' + recipe);
                    /// res.send('Review already submitted');
                    reject('stuff is undefined');
                }


            });


        });


    };





    gotReviewDataPromise().then((recipe) => {


        console.log('in callback, recipeDoc._id should be ...' + recipe._id);
        console.log('The state of dataObj in callback is...' + dataObj.recipeName);
        console.log('votingRecord.gotRecipeDocument: ' + votingRecord.gotRecipeDocument);
        console.log('votingRecord.gotReviewData: '+ votingRecord.gotReviewData);
        console.log('votingRecord.alreadyVoted: ' + votingRecord.alreadyVoted);
        console.log('votingRecord.alreadyUpvoted: ' + votingRecord.alreadyUpvoted);
        console.log('votingRecord.alreadyDownvoted: ' + votingRecord.alreadyDownvoted);
        console.log('dataObj.chefsId: ' + dataObj.chefsId);
        console.log('dataObj.chefsCreationDate: ' + dataObj.chefsCreationDate);
        console.log('dataObj.reviewOf: ' + dataObj.reviewOf);


        if (votingRecord.alreadyVoted === false && dataObj.newEntry === true){



            Recipe.findOneAndUpdate({_id: recipe._id, postersCreationDate: recipe.postersCreationDate},{$inc: {numberOfRatings: 1, totalAddedRatings: reviewScore}}).then(() => {

                console.log('Inserting review into recipe document');

                console.log('recipe is....' + recipe);


                recipe.reviewsOfRecipe.push({
                    wouldMakeAgain: req.body.wouldMakeAgain,
                    howGoodTaste: req.body.howGoodTaste,
                    howEasyToMake: req.body.howEasyToMake,
                    rating: reviewScore,
                    chefsId: votingRecord.chefsId,
                    postersCreationDate: req.decoded.creationDate,
                    postedBy: req.decoded.id,
                    reviewOf: dataObj.reviewOf,
                    chefsCreationDate: dataObj.chefsCreationDate,
                    recipeName: req.params.name,
                    postersName: req.decoded.username,
                    comment: String(req.body.comment),
                    postedAt: new Date(),
                    profilePic: String(req.decoded.profilePic)
                });

                if (reviewScore > 3){

                    recipe.likedBy.push({userid: String(req.decoded.id), creationDate: req.decoded.creationDate});

                }


                recipe.save();
            });


            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {
                user.usersReviews.push({
                    wouldMakeAgain: req.body.wouldMakeAgain,
                    howGoodTaste: req.body.howGoodTaste,
                    howEasyToMake: req.body.howEasyToMake,
                    rating: reviewScore,
                    chefsId: votingRecord.chefsId,
                    postersCreationDate: req.decoded.creationDate,
                    postedBy: req.decoded.id,
                    reviewOf: dataObj.reviewOf,
                    chefsCreationDate: dataObj.chefsCreationDate,
                    recipeName: req.params.name,
                    comment: String(req.body.comment)

                });
                if (reviewScore > 3) {
                    user.usersFavouriteRecipes.push({recipeId: dataObj.reviewOf, creationDate: dataObj.chefsCreationDate})
                }

                User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$pull: {cookLater: {recipeId: recipe._id, creationDate: recipe.postersCreationDate}}}).then(() => {
                    console.log('item removed from cookLater');
                });

                user.save();
            });


            if (reviewScore > 3) {

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: 1 }}).then(() => {
                    console.log('chefKarma upvoted');
                });


                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({$addToSet: {reviewedBy: [ req.decoded.id, req.decoded.creationDate]}}).then(() => {
                    console.log('chefs reviewedBy array updated');
                });





            }
            else if (reviewScore < 3){

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: -1 }}).then(() => {
                    console.log('chefKarma downvoted');
                });

            }



            res.json(recipe);


        }
        else  if (votingRecord.alreadyVoted === true && dataObj.newEntry === false) {

            console.log('review is being editied');


            recipe.reviewsOfRecipe[dataObj.reviewIndex] = {
                wouldMakeAgain: req.body.wouldMakeAgain,
                howGoodTaste: req.body.howGoodTaste,
                howEasyToMake: req.body.howEasyToMake,
                rating: reviewScore,
                comment: String(req.body.comment),
                postersCreationDate: req.decoded.creationDate,
                postedBy: req.decoded.id,
                chefsCreationDate: dataObj.chefsCreationDate,
                chefsId: dataObj.chefsId,
                reviewOf: dataObj.reviewOf,
                profilePic: String(req.decoded.profilePic)

            };


            if (reviewScore < dataObj.originalRating){

                dataObj.newScore = Math.abs(Number(recipe.totalAddedRatings) - reviewScore);

                dataObj.newScore = -dataObj.newScore;

                console.log('dataObj.newScore is...' + dataObj.newScore);

            }

            else if (reviewScore > dataObj.originalRating){

                dataObj.newScore = Math.abs(reviewScore + Number(recipe.totalAddedRatings));

                console.log('dataObj.newScore is...' + dataObj.newScore);
            }

           if (reviewScore < dataObj.originalRating || reviewScore > dataObj.originalRating) {



               console.log('outside the if statements, dataObj.newScore is....' + dataObj.newScore);

               let newTotal = Number(recipe.totalAddedRatings) + dataObj.newScore;

               console.log('newTotal is...' + newTotal);

               recipe.set('totalAddedRatings', newTotal);


               recipe.save();



               User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                   for (let i = 0; i < user.usersReviews.length; i++){



                       if (user.usersReviews[i].reviewOf === dataObj.reviewOf){

                           user.usersReviews[i] = {
                               wouldMakeAgain: req.body.wouldMakeAgain,
                               howGoodTaste: req.body.howGoodTaste,
                               howEasyToMake: req.body.howEasyToMake,
                               rating: reviewScore,
                               comment: String(req.body.comment),
                               postersCreationDate: req.decoded.creationDate,
                               postedBy: req.decoded.id,
                               chefsCreationDate: dataObj.chefsCreationDate,
                               chefsId: dataObj.chefsId,
                               reviewOf: dataObj.reviewOf,
                               profilePic: String(req.decoded.profilePic)

                           };


                           user.save();


                       }

                   }


               });



               if (reviewScore < 3 && votingRecord.alreadyUpvoted === true && votingRecord.alreadyDownvoted === false) {

                   User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: -1 }}).then(() => {
                       console.log('chefKarma downvoted');
                   });


                   User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$pull: {usersFavouriteRecipes: {recipeId: dataObj.reviewOf}}}).then(() =>{
                       console.log('Item removed from usersFavouriteRecipes');
                   });




                   Recipe.findOneAndUpdate({_id: recipe._id}, {$pull: {likedBy: {userid: req.decoded.id, creationDate: req.decoded.creationDate}}}).then(() => {

                       console.log('recipe._id is...' + recipe._id);

                       console.log('user removed from likedBy');

                   });








               }

               else if (reviewScore > 3 && votingRecord.alreadyUpvoted === false && votingRecord.alreadyDownvoted === true) {

                   User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: 1 }}).then(() => {
                       console.log('chefKarma upvoted');
                   });


               }




           }

        else if (reviewScore === dataObj.originalRating){


               User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                   for (let i = 0; i < user.usersReviews.length; i++){



                       if (user.usersReviews[i].reviewOf === dataObj.reviewOf){

                           user.usersReviews[i] = {
                               wouldMakeAgain: user.usersReviews[i].wouldMakeAgain,
                               howGoodTaste: user.usersReviews[i].howGoodTaste,
                               howEasyToMake: user.usersReviews[i].howEasyToMake,
                               rating: reviewScore,
                               comment: String(req.body.comment),
                               postersCreationDate: req.decoded.creationDate,
                               postedBy: req.decoded.id,
                               chefsCreationDate: dataObj.chefsCreationDate,
                               chefsId: dataObj.chefsId,
                               reviewOf: dataObj.reviewOf,
                               recipeName: dataObj.recipeName

                           };


                           user.save();


                       }

                   }


               });

               for (let l = 0; l < recipe.reviewsOfRecipe.length; l++){

                   if (recipe.reviewsOfRecipe[l].postedBy === req.decoded.id){

                       recipe.reviewsOfRecipe[l].comment = String(req.body.comment);

                       recipe.save();

                   }

               }


           }







        res.json(recipe);



        }


    });

});

/// Works

router.post('/:category/:name/changeProfilePic', authentication.verifyOrdinaryUser, upload.single('file'), function(req, res, next){


    Recipe.findOne({category: req.params.category, name: req.params.name}).then((recipe) => {

        if (String(req.decoded.id) === recipe.postedBy){

            recipe.set('profilePic', req.file.location);

            recipe.save();

            res.send('changed Profile Pic!')

        }
    })



});



/// Saving a recipe to cook then review later

// works as intended

router.post('/:category/:name/Saved', authentication.verifyOrdinaryUser, function(req, res, next){

    Recipe.findOne({category: req.params.category, name: req.params.name}).then((recipe) => {

        User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

            if (recipe.isActive === true){

                user.cookLater.push({recipeId: recipe._id, creationDate: recipe.postersCreationDate});

                //// user.push([recipe._id, recipe.postersCreationDate]);

                user.save();

                res.json(recipe);

            }

        });

    });

});


// Deleting a recipe

// Works :)

router.delete('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next){


    reviewController.deleteRecipeAndUserData(req.params.name, req.params.category, req.decoded.id);

    res.send('DONE');

});

/// Possibly useless route?

router.post('/:category/:name/deleteReview', authentication.verifyOrdinaryUser, function(req, res, next){

    Recipe.findOne({category: req.params.category, name: req.params.name}).then((recipe) => {

        let reviewsRating = undefined;

        let chefId = recipe.postedBy;

        let chefCD = recipe.postersCreationDate;

        let gotChefInfo = () => {

            return new Promise((resolve, reject) => {

                if (reviewsRating !== undefined && chefId !== undefined && chefCD !== undefined){

                    resolve(reviewsRating)

                }
                else {
                    reject('Stuff is undefined')
                }

            })

        };

        for (let i = 0; i < recipe.reviewsOfRecipe.length; i++) {

            if (recipe.reviewsOfRecipe[i].postedBy === req.decoded.id) {

                reviewsRating = recipe.reviewsOfRecipe[i].rating;

                recipe.reviewsOfRecipe.splice(i, 1);

                break;


            }
        }





                User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                    for (let l = 0; l < user.usersReviews.length; l++){

                        if (user.usersReviews[l].recipeName === req.params.name){

                            user.usersReviews.splice(l, 1);

                            break;

                        }

                    }

                    gotChefInfo().then((reviewsRating) => {

                        let newNumOfReviews = recipe.numberOfRatings - 1;

                        console.log("newNumOfReviews is..." + newNumOfReviews);

                        recipe.set('numberOfRatings', newNumOfReviews);

                        let newTotalAddedRatings = recipe.totalAddedRatings - reviewsRating;

                        console.log('newTotalAddedRatings is...' + newTotalAddedRatings);

                        recipe.set('totalAddedRatings', newTotalAddedRatings);

                        recipe.save();

                        console.log('within callback, reviewsRating is...' + reviewsRating);

                        console.log('within callback, chefId is...' + chefId);

                        console.log('within callback, chefCD is....' + chefCD);

                        if (reviewsRating < 3){

                            User.where({_id: chefId, creationDate: chefCD}).update({$inc: {chefKarma: 1}}).then(() => {
                                console.log('ChefKarma Updated!')
                            });

                        }

                        else if (reviewsRating > 3){

                            User.where({_id: chefId, creationDate: chefCD}).update({$inc: {chefKarma: -1}}).then(() => {
                                console.log('ChefKarma Updated!')
                            });


                            for (let i = 0; i < user.usersFavouriteRecipes.length; i++){

                                if (user.usersFavouriteRecipes[i].recipeId === String(recipe._id)){

                                    console.log('Inside if statment of if (user.usersFavourite === recipeId thing)');

                                    console.log('in the for loop that removes userFavourite, recipe._id is...' + recipe._id);

                                    user.usersFavouriteRecipes.splice(i, 1);

                                    break;


                                }

                            }



                        }






                    });



                    user.save();

                });





        res.json(recipe);

    })


});






module.exports = router;
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

// Getting all recipes. Angular already will do pagination for me

router.get('/', (req, res) => {

    /// the starting req.params.page is 0
    let skip_ = 10 * Number(req.params.page);

    Recipe.find({}, (err, recipes) => {

        if (err) res.send(err);

        res.json(recipes);
    });
});

/// Get the recipe by category

router.get('/:category/', (req, res) => {

    // the first page will be zero to avoid unintentionally skipping over first 10

    let skip_ = 10 * Number(req.params.page);

    Recipe.find({category: req.params.category}, (err, recipe) => {
        if (err) res.send(err);

        res.json(recipes)
    }).skip(skip_).limit(10);

});

/// Get a specific Recipe, and view it

router.get('/:category/:name', (req, res) => {

    /// I assume that you'll get the reviews as well as the recipe with this one

    Recipe.findOne({category: req.params.category, name: req.params.name}, (err, recipe) => {
        if (err) res.send(err);

        res.json(recipe);
    }).lean();

});

/// This works!

router.post('/addrecipe', authentication.verifyOrdinaryUser, (req, res) => {

    console.log('the route is running now!');

    //  req.decoded = decoded;


    console.log('is decoded working....' + req.decoded.id);





    Recipe.create({

        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
        ingredients: req.body.ingredients,
        category: req.body.category,
        postedBy: req.decoded.id,
        postersCreationDate: req.decoded.creationDate,
        postersName: req.decoded.username

    }).then((recipe) => {

        console.log('Inserting into usersRecipes');

        //This didn't work

        /// User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$push: {usersRecipes: [recipe._id, req.decoded.creationDate]}});

        User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

            console.log('The array that is being inserted into usersRecipe is...' + [recipe._id, req.decoded.creationDate]);

            user.usersRecipes.push([recipe._id, req.decoded.creationDate]);

            console.log('usersRecipe is now...' + user.usersRecipes);

            user.save();

            res.json(recipe);
        });

    });





    /*
     let newRecipe = new Recipe({
     name: req.body.name,
     description: req.body.description,
     steps: req.body.steps,
     ingredients: req.body.ingredients,
     category: req.body.category,
     postedBy: req.decoded.id,
     postersCreationDate: req.decoded.creationDate,
     postersName: req.decoded.username
     });
     newRecipe.save()
     .then((err, recipe) => {
     if (err) console.log(err);
     res.json(recipe);
     })
     */



});


/// Adding Review

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
        reviewIndex: undefined
    };





    let gotReviewDataPromise = () => {

        return new Promise((resolve, reject) => {

            console.log("votingRecord is..." + votingRecord);

            console.log('req.decoded is...' + req.decoded);

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
                    recipeName: req.params.name
                });

                if (reviewScore > 3){

                    recipe.likedBy.push({_id: String(req.decoded.id), creationDate: req.decoded.creationDate});

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
                    recipeName: req.params.name
                });
                if (reviewScore > 3) {
                    user.usersFavouriteRecipes.push({_id: dataObj.reviewOf, creationDate: dataObj.chefsCreationDate})
                }
                user.update({$pull: {cookLater: {_id: recipe._id, creationDate: recipe.creationDate}}});
                user.save();
            });




        /* /// This doesn't work

            User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$push: {usersReviews: {
                wouldMakeAgain: req.body.wouldMakeAgain,
                howGoodTaste: req.body.howGoodTaste,
                howEasyToMake: req.body.howEasyToMake,
                rating: reviewScore,
                chefsId: votingRecord.chefsId,
                postersCreationDate: req.decoded.creationDate,
                postedBy: req.decoded.id,
                reviewOf: dataObj.reviewOf,
                chefsCreationDate: dataObj.chefsCreationDate,
                recipeName: req.params.name

            }}});

            User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$pull: {cookLater: [recipe._id, recipe.creationDate]}});

            if (reviewScore > 3){

                User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$push: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

            }

            */



            if (reviewScore > 3) {

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: 1 }}).then(() => {
                    console.log('chefKarma upvoted');
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


            /// This works

            recipe.reviewsOfRecipe[dataObj.reviewIndex] = {
                wouldMakeAgain: req.body.wouldMakeAgain,
                howGoodTaste: req.body.howGoodTaste,
                howEasyToMake: req.body.howEasyToMake,
                rating: reviewScore,
                comment: req.body.comment,
                postersCreationDate: req.decoded.creationDate,
                postedBy: req.decoded.id,
                chefsCreationDate: dataObj.chefsCreationDate,
                chefsId: dataObj.chefsId,
                reviewOf: dataObj.reviewOf

            };



            /// TODO This does not work and its supposed to be in the other if statements below dumb dumb

           /// recipe.update({$pull: {likedBy: [String(req.decoded.id), req.decoded.creationDate]}});



            recipe.save();

            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                for (let i = 0; i < user.usersReviews.length; i++){

                    /// TODO finish this

                    if (user.usersReviews[i].reviewOf === dataObj.reviewOf){

                        user.usersReviews[i] = {
                            wouldMakeAgain: req.body.wouldMakeAgain,
                            howGoodTaste: req.body.howGoodTaste,
                            howEasyToMake: req.body.howEasyToMake,
                            rating: reviewScore,
                            comment: req.body.comment,
                            postersCreationDate: req.decoded.creationDate,
                            postedBy: req.decoded.id,
                            chefsCreationDate: dataObj.chefsCreationDate,
                            chefsId: dataObj.chefsId,
                            reviewOf: dataObj.reviewOf

                        };

                        if (reviewScore < 3 && votingRecord.alreadyUpvoted === true && votingRecord.alreadyDownvoted === false) {

                            console.log('dataObj.reviewOf is...' );

                            console.log(typeof(dataObj.reviewOf));

                            console.log('!!!!!!! recipe._id is ...' + recipe._id);

                            console.log('!!!!!! dataObj.recipeName is ' + dataObj.recipeName);

                            user.usersFavouriteRecipes.pull({_id: recipe._id});

                        }


                        user.save();


                    }

                }


            });



            if (reviewScore < 3 && votingRecord.alreadyUpvoted === true && votingRecord.alreadyDownvoted === false) {

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: -1 }}).then(() => {
                    console.log('chefKarma downvoted');
                });

                // TODO these two don't work


               /// User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$pull: {usersFavouriteRecipes: {_id: dataObj.reviewOf}}});


                Recipe.where({_id: dataObj.reviewOf, chefsCreationDate: dataObj.postersCreationDate}).update({$pull: {likedBy: {_id: req.decoded.id, creationDate: req.decoded.creationDate}}});





            }

            else if (reviewScore > 3 && votingRecord.alreadyUpvoted === false && votingRecord.alreadyDownvoted === true) {

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: { chefKarma: 1 }}).then(() => {
                    console.log('chefKarma upvoted');
                });




            }






        res.json(recipe);



        }


    });

});


// Edit a review for a recipe

router.put(':category/:name/editReview', authentication.verifyOrdinaryUser, function(req, res, next){

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
        newEntry: undefined
    };

    let gotReviewDataPromise = () => {

        return new Promise((resolve, reject) => {


            reviewController.checkThenGetRecipe(dataObj, votingRecord, req.params.name, req.params.category, req.decoded.id).then((recipe) => {

                if (recipe !== undefined && recipe !== null) {
                    if (votingRecord.gotRecipeDocument === true && votingRecord.gotReviewData === true) {
                        console.log('in resolve loop, recipe._id should be ...' + recipe._id);
                        console.log('The state of dataObj is...' + dataObj);
                        resolve(recipe)

                    }
                }
                ///
                else {
                    console.log('The state of dataObj is...' + dataObj.reviewOf);
                    console.log('The state of recipe is...' + recipe);
                    reject('Stuff is still undefined');

                }


            });


        });


    };

    gotReviewDataPromise().then((recipe) => {


        console.log('in callback, recipeDoc._id should be ...' + recipe._id);
        console.log('The state of dataObj in callback is...' + dataObj.recipeName);
        console.log('votingRecord.gotRecipeDocument: ' + votingRecord.gotRecipeDocument);
        console.log('votingRecord.gotReviewData: ' + votingRecord.gotReviewData);
        console.log('votingRecord.alreadyVoted: ' + votingRecord.alreadyVoted);
        console.log('votingRecord.alreadyUpvoted: ' + votingRecord.alreadyUpvoted);
        console.log('votingRecord.alreadyDownvoted: ' + votingRecord.alreadyDownvoted);
        console.log('dataObj.chefsId: ' + dataObj.chefsId);
        console.log('dataObj.chefsCreationDate: ' + dataObj.chefsCreationDate);
        console.log('dataObj.reviewOf: ' + dataObj.reviewOf);

        if (votingRecord.alreadyVoted === true && dataObj.newEntry === false) {

            User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({'usersReviews.reviewOf': dataObj.reviewOf}, {
                $set: {
                    'usersReviews.$.wouldMakeAgain': req.body.wouldMakeAgain,
                    'usersReviews.$.howGoodTaste': req.body.howGoodTaste,
                    'usersReviews.$.howEasyToMake': req.body.howEasyToMake,
                    'usersReviews.$.rating': reviewScore,
                    'usersReviews.$.comment': req.body.comment,
                    'usersReviews.$.chefsId': dataObj.chefsId
                }
            });

            /*

             /// Didn't test it out yet, but doesn't seem right

            User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {'usersReviews.reviewOf': dataObj.reviewOf}, {
                $set: {
                    'usersReviews.$.wouldMakeAgain': req.body.wouldMakeAgain,
                    'usersReviews.$.howGoodTaste': req.body.howGoodTaste,
                    'usersReviews.$.howEasyToMake': req.body.howEasyToMake,
                    'usersReviews.$.rating': reviewScore,
                    'usersReviews.$.comment': req.body.comment,
                    'usersReviews.$.chefsId': dataObj.chefsId
                }
            });

            */

            if (reviewScore < 3 && votingRecord.alreadyUpvoted === true && votingRecord.alreadyDownvoted === false) {

                User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

                /*
                    // Old version

                 User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

                 */

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: {chefKarma: -1}});

                /*

                /// Old Version

                 User.findOneAndUpdate({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}, { $inc: {chefKarma: -1}});


                 */

                recipe.update({$pull: {likedBy: [String(req.decoded.id), req.decoded.creationDate]}});

                recipe.save();

                /*
                    // Old version

                 Recipe.findOneAndUpdate({_id: recipe._id, postersCreationDate: recipe.postersCreationDate}, {$pull: {likedBy: [String(req.decoded.id), req.decoded.creationDate]}});


                 */

            }

            else if (reviewScore > 3 && votingRecord.alreadyUpvoted === false && votingRecord.alreadyDownvoted === true) {

                User.where({_id: req.decoded.id, creationDate: req.decoded.creationDate}).update({$push: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

                User.where({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}).update({ $inc: {chefKarma: 1}});

                recipe.update({$push: {likedBy: [String(req.decoded.id), req.decoded.creationDate]}});


                /*

                User.findOneAndUpdate({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$push: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});
                Recipe.findOneAndUpdate({_id: recipe._id, postersCreationDate: recipe.postersCreationDate}, {$push: {likedBy: [String(req.decoded.id), req.decoded.creationDate]}});
                User.findOneAndUpdate({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate}, { $inc: {chefKarma: 1}});

                */


            }

        }

        else {
            res.send('User has not submitted a review yet to be edited')
        }


    })

});



/// Saving a recipe to cook then review later

router.post('/:category/:name/Saved', authentication.verifyOrdinaryUser, function(req, res, next){

    Recipe.findOne({category: req.params.category, name: req.params.name}).then((recipe) => {

        User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

            user.push([recipe._id, recipe.postersCreationDate]);

            user.save();

        });

    });

});


// Deleting a recipe

router.delete('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next){

    Recipe.findOne({category: req.params.category, name: req.params.name}).then((recipe) => {

        if (req.decoded.id === recipe.postedBy){


            let UsersWhoReviewed = recipe.reviewedBy;

            let UsersWhoLiked = recipe.likedBy;


            for (let i = 0; i < UsersWhoLiked.length - 1; i++){

                User.findOne({_id: UsersWhoLiked[i][0], creationDate: UsersWhoLiked[i][1]}).then((user) => {

                    user.update({$pull: {usersFavouriteRecipes: [recipe._id, recipe.postersCreationDate]}});

                    user.save();

                });
            }

            for (let i = 0; i < UsersWhoReviewed.length - 1; i++){

                User.findOne({_id: UsersWhoReviewed[i][0], creationDate: UsersWhoReviewed[1]}).then((user) => {

                    user.update({$pull: {usersReviews: {reviewOf: recipe._id}}});

                    user.save();

                });
            }

            User.findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate}).then((user) => {

                user.update({$pull: {usersRecipes: [recipe._id, recipe.creationDate]}});


            });



        }




    })


        .then((recipe) => {

            if (req.decoded.id === recipe.postedBy){

                recipe.remove();


            }


        });


});

// Game plan, for deleting a review, have just the program set the comment to "" and try the user by having angular
// hide the users who have "" and also




module.exports = router;
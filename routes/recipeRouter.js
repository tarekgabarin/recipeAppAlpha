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
/// const reviewSchema = require('../model/review').reviewSchema;




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

/// Adding recipe

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

        User.update({_id: req.decoded.id, creationDate: req.decoded.creationDate}, {$push: {usersRecipes: [recipe._id, req.decoded.creationDate]}});

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

router.post('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next) {

    /// add a review of a recipe

      let reviewScore = (Number(req.body.howGoodTaste) + Number(req.body.wouldMakeAgain) + Number(req.body.howEasyToMake)) / 3;

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

        let checkThenGetRecipe = (name, category, userid) => {

            //// This checks through a users reviewsOfRecipe array, updates the votingRecord
            ///based on what it finds, and then returns the Recipe document in question



            return Recipe.findOne({name: name, category: category})

                .then((recipe) => {

                    console.log('1 - recipe is...' + recipe);

                    console.log('length of recipe.reviewsOfRecipe is..' + recipe.reviewsOfRecipe.length);

                    if (recipe){


                        if (recipe.reviewsOfRecipe.length !== 0){
                            for (let i = 0; i < recipe.reviewsOfRecipe.length - 1; i++) {
                                if (String(recipe.reviewsOfRecipe[i].postedBy) === String(userid)) {
                                    votingRecord.alreadyVoted = true;
                                    //  votingRecord.ranFirstProcess = true;
                                    if (Number(recipe.reviewsOfRecipe[i].rating) > 3) {
                                        votingRecord.alreadyUpvoted = true;
                                        votingRecord.alreadyDownvoted = false;
                                        console.log('checkThenGetRecipe is running');
                                        dataObj.chefsId = String(recipe.reviewsOfRecipe[i].chefsId);
                                        dataObj.chefsCreationDate = Number(recipe.reviewsOfRecipe[i].chefsCreationDate);
                                        dataObj.reviewOf = String(recipe.reviewsOfRecipe[i].reviewOf);
                                        ///    dataObj.postersCreationDate = Number(recipe.reviewsOfRecipe[i].postersCreationDate);
                                        ///    dataObj.postedBy = String(recipe.reviewsOfRecipe[i].postedBy);
                                        dataObj.newEntry = false;
                                        votingRecord.gotRecipeDocument = true;
                                        votingRecord.gotReviewData = true;
                                        return recipe;

                                    }
                                    else if (Number(recipe.reviewsOfRecipe[i].rating) < 3) {
                                        votingRecord.alreadyDownvoted = true;
                                        votingRecord.alreadyUpvoted = false;
                                        dataObj.chefsId = String(recipe.reviewsOfRecipe[i].chefsId);
                                        dataObj.chefsCreationDate = Number(recipe.reviewsOfRecipe[i].chefsCreationDate);
                                        dataObj.reviewOf = String(recipe.reviewsOfRecipe[i].reviewOf);
                                        ///    dataObj.postersCreationDate = Number(recipe.reviewsOfRecipe[i].postersCreationDate);
                                        ///    dataObj.postedBy = String(recipe.reviewsOfRecipe[i].postedBy);
                                        dataObj.newEntry = false;
                                        votingRecord.gotRecipeDocument = true;
                                        votingRecord.gotReviewData = true;
                                        return recipe;
                                    }
                                }
                                else {
                                    dataObj.chefsId = String(recipe.postedBy);
                                    dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
                                    /// When I commneted this out, I still got error
                                    dataObj.reviewOf = String(recipe._id);
                                    dataObj.newEntry = true;
                                    votingRecord.alreadyVoted = false;
                                    votingRecord.gotReviewData = true;
                                    votingRecord.gotRecipeDocument = true;
                                    return recipe;

                                }
                            }

                        }

                        else {

                            dataObj.chefsId = String(recipe.postedBy);
                            dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
                            /// When I commneted this out, I still got error
                            dataObj.reviewOf = String(recipe._id);
                            dataObj.newEntry = true;
                            votingRecord.alreadyVoted = false;
                            votingRecord.gotReviewData = true;
                            votingRecord.gotRecipeDocument = true;
                            return recipe;



                        }



                    }


                });
        };

        //// this

        let getUserDoc = () => {


            /// This returns the user document

            return User

                .findOne({_id: req.decoded.id, creationDate: req.decoded.creationDate})

                .then((user) => {
                    console.log('return value of getUserDoc is...' + user);
                    if (user !== null && user !== undefined) {
                        votingRecord.gotUserDocument = true;
                        return user
                    }
                    else {
                        console.log('User doc is undefined');
                    }

                })

                .catch((err) => {
                    console.log(err);
                });

        };

        let getUserPromise = () => {


            return new Promise((resolve, reject) => {

                getUserDoc().then((user) => {

                    if (user !== undefined || user !== null){
                        resolve(user);
                    }
                    else {
                        reject('user is undefined')
                    }

                })
            })


        };

        let getChefDoc = () => {

            return User

                .findOne({_id: dataObj.chefsId, creationDate: dataObj.chefsCreationDate})

                .then((chef) => {

                    if (chef !== undefined && chef !== null){
                        votingRecord.gotChefDocument = true;
                        return chef
                    }
                    else {
                        console.log('chef is either undefined or null :(')
                    }

                });

        };

        let gotChefPromise = () => {

            return new Promise((resolve, reject) => {

                getChefDoc().then((chef) => {

                    if (votingRecord.gotChefDocument === true && votingRecord.gotReviewData === true){
                        resolve(chef)
                    }
                    else{
                        console.log('Problem, votingRecord.gotChefDocument is still...' + votingRecord.gotChefDocument);
                        reject('chef is undefined')
                    }

                })


            })


        };

        /*

    let gotReviewDataPromise = (recipe) => {

        return new Promise((resolve,  reject) => {

            if (recipe !== undefined && recipe !== null) {
                if (votingRecord.gotRecipeDocument === true && votingRecord.gotReviewData === true) {
                    console.log('in resolve loop, recipe._id should be ...' + recipe._id);
                    console.log('The state of dataObj is...' + dataObj);
                    resolve(recipe);

                }
            }
            else {
                console.log('The state of dataObj is...' + dataObj.reviewOf);
                console.log('The state of recipe is...' + recipe);
                reject('Stuff is still undefined');

            }
        })

    };

    */

    /*


    checkThenGetRecipe(req.params.name, req.params.category, req.decoded.id).then((recipe) => {

        gotReviewDataPromise(recipe).then((recipe) => {


            console.log('in callback, recipeDoc._id should be ...' + recipe._id);
            console.log('The state of dataObj in callback is...' + dataObj);
            console.log('the state of votingRecord in callback is...' + votingRecord);

        });


    });

    */




        let gotReviewDataPromise = () => {

            return new Promise((resolve, reject) => {

                checkThenGetRecipe(req.params.name, req.params.category, req.decoded.id).then((recipe) => {

                    if (recipe !== undefined && recipe !== null) {
                        if (votingRecord.gotRecipeDocument === true && votingRecord.gotReviewData === true) {
                            console.log('in resolve loop, recipe._id should be ...' + recipe._id);
                            console.log('The state of dataObj is...' + dataObj);
                            resolve(recipe)

                        }
                    }
                    else {
                        console.log('The state of dataObj is...' + dataObj.reviewOf);
                        reject('Stuff is still undefined');

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

                ///// Don't use virtual types because you want Users to search for best and most reviewed recipes

                recipe.update({$inc: {'numberOfRatings': 1}});

                recipe.update({$inc: {'totalAddedRatings': reviewScore}});

                let newAverage = Number(recipe.totalAddedRatings) / Number(recipe.numberOfRatings);

                recipe.update({$set: {reviewAverage: newAverage}});

                recipe.save();

            }

            else if (reviewScore < 3 && votingRecord.alreadyUpvoted && votingRecord.alreadyVoted && !votingRecord.alreadyDownvoted){

                recipe.update({'reviewsOfRecipe.postedBy': dataObj.postedBy}, {$set: {
                    $set: {
                        'reviewsOfRecipe.$.wouldMakeAgain': req.body.wouldMakeAgain,
                        'reviewsOfRecipe.$.howGoodTaste': req.body.howGoodTaste,
                        'reviewsOfRecipe.$.howEasyToMake': req.body.howEasyToMake,
                        'reviewsOfRecipe.$.rating': reviewScore,
                        'reviewsOfRecipe.$.comment': req.body.comment
                    }
                }});

                recipe.update({$inc: {'totalAddedRatings': -reviewScore}});

                let newAverage = Number(recipe.totalAddedRatings) / Number(recipe.numberOfRatings);

                recipe.update({$set: {reviewAverage: newAverage}});

                recipe.save();

            }
            else if (reviewScore > 3 && !votingRecord.alreadyUpvoted && votingRecord.alreadyVoted && votingRecord.alreadyDownvoted){

                recipe.update({'reviewsOfRecipe.postedBy': dataObj.postedBy}, {$set: {
                    $set: {
                        'reviewsOfRecipe.$.wouldMakeAgain': req.body.wouldMakeAgain,
                        'reviewsOfRecipe.$.howGoodTaste': req.body.howGoodTaste,
                        'reviewsOfRecipe.$.howEasyToMake': req.body.howEasyToMake,
                        'reviewsOfRecipe.$.rating': reviewScore,
                        'reviewsOfRecipe.$.comment': req.body.comment
                    }
                }});

                recipe.update({$inc: {'totalAddedRatings': reviewScore}});

                let newAverage = Number(recipe.totalAddedRatings) / Number(recipe.numberOfRatings);

                recipe.update({$set: {reviewAverage: newAverage}});

                recipe.save();
            }

            getUserPromise().then((user) => {

                console.log('In getUserPromise callback, user is...' + user);

                if (votingRecord.alreadyVoted === false && dataObj.newEntry === true) {

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

                    users.update({$pull: {cookLater: [recipe._id, recipe.creationDate]}});

               //     recipe.reviewedBy.push([user._id, user.creationDate]); there is a better more efficient way

                    user.save();

                    if (reviewScore > 3) {

                        user.usersFavouriteRecipes.push([dataObj.reviewOf, dataObj.chefsCreationDate]);

                        /// this is for later use for updating everyones favouriteRecipes array when a recipe is deleted

                        recipe.likedBy.push([String(user._id), user.creationDate]);
                    }

                }

                else if (votingRecord.alreadyVoted === true && dataObj.newEntry === false) {

                    user.update({'usersReviews.reviewOf': dataObj.reviewOf}, {
                        $set: {
                            'usersReviews.$.wouldMakeAgain': req.body.wouldMakeAgain,
                            'usersReviews.$.howGoodTaste': req.body.howGoodTaste,
                            'usersReviews.$.howEasyToMake': req.body.howEasyToMake,
                            'usersReviews.$.rating': reviewScore,
                            'usersReviews.$.comment': req.body.comment
                        }
                    });

                    user.save();

                    if (reviewScore < 3 && votingRecord.alreadyUpvoted) {

                        user.update({$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

                        recipe.update({$pull: {likedBy: [String(user._id), user.creationDate]}});

                        user.save();


                    }
                }




            });

            gotChefPromise().then((chef_) => {

                //// Add an if statement that checks if the reviewer and the chef aren't the same person


                if (!votingRecord.alreadyUpvoted || (reviewScore > 3 && !votingRecord.alreadyVoted)) {

                    chef_.update({$addToSet: {'reviewedBy': [req.decoded.id, req.decoded.creationDate]}});

                    chef_.update({
                            $inc: {
                                chefKarma: 1
                            }
                        },
                        (err, doc) => {
                            if (err) console.log(err);
                            console.log(doc);
                        });

                    chef_.save();
                }

                else if (!votingRecord.alreadyDownvoted || ((reviewScore < 3) && !votingRecord.alreadyVoted)) {

                    chef_.update( {
                            $inc: {
                                chefKarma: -1
                            }
                        },
                        (err, doc) => {
                            if (err) console.log(err);
                            console.log(doc);
                        });

                    chef_.save();

                }




            })




        });







   /*

    let updateChefKarmaPromise = (chefDoc, reviewScore) => {

        /// when Promise is fulfilled, this updates the chefs karma

        return new Promise((resolve, reject) => {


            if (votingRecord.gotChefDocument === true && votingRecord.gotReviewData === true) {
                resolve(chefDoc, reviewScore);
            }
            else {
                console.log('Problem, votingRecord.gotChefDocument is still...' + votingRecord.gotChefDocument);
                console.log('Problem, votingRecord.gotUserDocument is still...' + votingRecord.gotChefDocument);
                reject('Problem with updateChefKarmaPromise and the functions lead to it');
            }
        })
    };

    */




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

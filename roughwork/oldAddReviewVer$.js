/*

router.post('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next) {

    /// add a review of a recipe

    // TODO I maybe be split this into a route that adds a new review and one that actually edits it

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
                                    /// This line below could be a problem since reviewOf is unresolved
                                    dataObj.reviewOf = String(recipe._id);
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
                                    dataObj.reviewOf = String(recipe._id);
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
                /// Todo this reject occurs whenever a user tries to edit review
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

            console.log('Inserting review into recipe document');

            console.log('recipe is....' + recipe);

            /// This stupid thing is finally fucking working


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



            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });



            console.log("In recipe document, reviewsOfRecipe is..." + recipe.reviewsOfRecipe);

            ///// Don't use virtual types because you want Users to search for best and most reviewed recipes

            // TODO : These don't work

            recipe.update({$inc: {numberOfRatings: 1}});


            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });

            // TODO Not working, there has to be a better way

            recipe.update({$inc: {totalAddedRatings: reviewScore}});

            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });

            /// I'm now getting this stupid error  CastError: Cast to number failed for value "NaN" at path "reviewAverage"



            console.log(typeof(recipe.totalAddedRatings));

            console.log(recipe.totalAddedRatings);

            console.log(typeof(recipe.numberOfRatings));

            console.log(recipe.numberOfRatings);

            console.log(typeof(recipe.reviewAverage));



            let newAverage = Number(req.body.totalAddedRatings) / Number(req.body.numberOfRatings);

            let numAverage = Number(newAverage);

            console.log('Below is newAverage');

            console.log(newAverage);

            //  console.log('Below is the type of newAverage');

            //    console.log(typeof(newAverage));

            console.log('Below is the type of numAverage');

            console.log(typeof(numAverage));

            // TODO The problem is that newAverage is NaN

            // console.log("newAverage is..." + String(newAverage));

            /// console.log(newAverage);

            /// Maybe I can't use $set on numbers?


            recipe.set('reviewAverage', numAverage);

            // recipe.update({$set: {reviewAverage: numAverage}});

            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });



            // recipe.updateReviewAverage(); ---> old approach


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

            recipe.update({$inc: {totalAddedRatings: -reviewScore}});



            let newAverage = Number(recipe.totalAddedRatings) / Number(recipe.numberOfRatings);

            recipe.update({$set: {reviewAverage: newAverage}});

            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });



            /// recipe.updateReviewAverage(); ---> Old

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

            recipe.save(function (err) {
                if (err) return handleError(err);
                console.log('Success!');
            });



            ////  recipe.updateReviewAverage(); ---> Old approach

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

                user.update({$pull: {cookLater: [recipe._id, recipe.creationDate]}});

                //     recipe.reviewedBy.push([user._id, user.creationDate]); there is a better more efficient way

                user.save(function (err) {
                    if (err) return handleError(err);
                    console.log('Success!');
                });

                if (reviewScore > 3) {

                    user.usersFavouriteRecipes.push([dataObj.reviewOf, dataObj.chefsCreationDate]);

                    user.save(function (err) {
                        if (err) return handleError(err);
                        console.log('Success!');
                    });



                    /// this is for later use for updating everyones favouriteRecipes array when a recipe is deleted


                    // TODO This is not adding the user info array into likedBy

                    recipe.likedBy.push([String(user._id), user.creationDate]);

                    recipe.save(function (err) {
                        if (err) return handleError(err);
                        console.log('Success!');
                    });
                }

            }

            else if (votingRecord.alreadyVoted === true && dataObj.newEntry === false) {

                user.update({'usersReviews.reviewOf': dataObj.reviewOf}, {
                    $set: {
                        'usersReviews.$.wouldMakeAgain': req.body.wouldMakeAgain,
                        'usersReviews.$.howGoodTaste': req.body.howGoodTaste,
                        'usersReviews.$.howEasyToMake': req.body.howEasyToMake,
                        'usersReviews.$.rating': reviewScore,
                        'usersReviews.$.comment': req.body.comment,
                        'usersReviews.$.chefsId': dataObj.chefsId
                    }
                });

                user.save(function (err) {
                    if (err) return handleError(err);
                    console.log('Success!');
                });

                if (reviewScore < 3 && votingRecord.alreadyUpvoted) {

                    user.update({$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

                    recipe.update({$pull: {likedBy: [String(user._id), user.creationDate]}});

                    user.save(function (err) {
                        if (err) return handleError(err);
                        console.log('Success!');
                    });


                }
            }




        });

        gotChefPromise().then((chef_) => {

            //// Add an if statement that checks if the reviewer and the chef aren't the same person

            console.log('in gotChefPromise callback, chef_ is' + chef_);

            /// TODO For some reason, this isn't updating the chefs karma, Lets test this one more time


            if ((votingRecord.alreadyUpvoted === false && reviewScore > 3) || (reviewScore > 3 && (votingRecord.alreadyVoted === false && votingRecord.newEntry === true))) {

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

                chef_.save(function (err) {
                    if (err) return handleError(err);
                    console.log('Success!');
                });
            }

            else if ((votingRecord.alreadyDownvoted === false && reviewScore < 3) || ((reviewScore < 3) && (votingRecord.alreadyVoted === false && votingRecord.newEntry === true))) {

                chef_.update( {
                        $inc: {
                            chefKarma: -1
                        }
                    },
                    (err, doc) => {
                        if (err) console.log(err);
                        console.log(doc);
                    });

                chef_.save(function (err) {
                    if (err) return handleError(err);
                    console.log('Success!');
                });

            }




        });




    });

*/

/*

 router.post('/:category/:name', authentication.verifyOrdinaryUser, function (req, res, next) {

 /// add a review of a recipe

 // TODO I maybe be split this into a route that adds a new review and one that actually edits it

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
 /// This line below could be a problem since reviewOf is unresolved
 dataObj.reviewOf = String(recipe._id);
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
 dataObj.reviewOf = String(recipe._id);
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

 .catch((err) => {

 console.log(err);
 })
 });


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
 /// Todo this reject occurs whenever a user tries to edit review
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
 console.log('dataObj.newEntry: ' + dataObj.newEntry);



 if (votingRecord.alreadyVoted === false && dataObj.newEntry === true){

 console.log('Inserting review into recipe document');

 console.log('recipe is....' + recipe);

 /// This stupid thing is finally fucking working


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



 recipe.save(function (err) {
 if (err) console.log(err);
 console.log('Success!');
 });



 console.log("In recipe document, reviewsOfRecipe is..." + recipe.reviewsOfRecipe);

 ///// Don't use virtual types because you want Users to search for best and most reviewed recipes


 // Fuck it, use the old method

 // // TODO Test it, fuck this, this seems less efficient but I have to use it cause fuck mongodb

 Recipe.findOneAndUpdate({_id: recipe._id, postersCreationDate: recipe.postersCreationDate},{$inc: {numberOfRatings: 1, totalAddedRatings: reviewScore}});

 /*
 recipe.save(function (err) {
 if (err) console.log(err);
 console.log('Success!');
 });


 recipe.update({$inc: {totalAddedRatings: reviewScore}});

 recipe.save(function (err) {
 if (err) console.log(err);
 console.log('Success!');
 });

 /// I'm now getting this stupid error  CastError: Cast to number failed for value "NaN" at path "reviewAverage"







console.log(typeof(recipe.totalAddedRatings));

console.log(recipe.totalAddedRatings);

console.log(typeof(recipe.numberOfRatings));

console.log(recipe.numberOfRatings);

console.log(typeof(recipe.reviewAverage));

// if (recipe.totalAddedRatings === 0 && recipe.numberOfRatings)

/// TODO 0/0 equals NaN that's why its not working

let newAverage = Number(req.body.totalAddedRatings) / Number(req.body.numberOfRatings);

let numAverage = Number(newAverage);

console.log('Below is newAverage');

console.log(newAverage);

//  console.log('Below is the type of newAverage');

//    console.log(typeof(newAverage));

console.log('Below is the type of numAverage');

console.log(typeof(numAverage));

// TODO The problem is that newAverage is NaN

// console.log("newAverage is..." + String(newAverage));

/// console.log(newAverage);

/// Maybe I can't use $set on numbers?


/// recipe.set('reviewAverage', numAverage); ---> This definitley doesn't work



// recipe.update({$set: {reviewAverage: numAverage}});




// recipe.updateReviewAverage(); ---> old approach




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

    recipe.update({$inc: {totalAddedRatings: -reviewScore}});



    let newAverage = Number(recipe.totalAddedRatings) / Number(recipe.numberOfRatings);

    recipe.update({$set: {reviewAverage: newAverage}});

    recipe.save(function (err) {
        if (err) console.log(err);
        console.log('Success!');
    });



    /// recipe.updateReviewAverage(); ---> Old

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

    recipe.save(function (err) {
        if (err) console.log(err);
        console.log('Success!');
    });



    ////  recipe.updateReviewAverage(); ---> Old approach

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

        user.update({$pull: {cookLater: [recipe._id, recipe.creationDate]}});

        //     recipe.reviewedBy.push([user._id, user.creationDate]); there is a better more efficient way

        user.save(function (err) {
            if (err) console.log(err);
            console.log('Success!');
        });

        if (reviewScore > 3) {

            user.usersFavouriteRecipes.push([dataObj.reviewOf, dataObj.chefsCreationDate]);

            user.save(function (err) {
                if (err) console.log(err);
                console.log('Success!');
            });



            /// this is for later use for updating everyones favouriteRecipes array when a recipe is deleted


            // TODO This is not adding the user info array into likedBy

            recipe.likedBy.push([String(user._id), user.creationDate]);

            recipe.save(function (err) {
                if (err) console.log(err);
                console.log('Success!');
            });
        }

    }

    else if (votingRecord.alreadyVoted === true && dataObj.newEntry === false) {

        user.update({'usersReviews.reviewOf': dataObj.reviewOf}, {
            $set: {
                'usersReviews.$.wouldMakeAgain': req.body.wouldMakeAgain,
                'usersReviews.$.howGoodTaste': req.body.howGoodTaste,
                'usersReviews.$.howEasyToMake': req.body.howEasyToMake,
                'usersReviews.$.rating': reviewScore,
                'usersReviews.$.comment': req.body.comment,
                'usersReviews.$.chefsId': dataObj.chefsId
            }
        });

        user.save(function (err) {
            if (err) console.log(err);
            console.log('Success!');
        });

        if (reviewScore < 3 && votingRecord.alreadyUpvoted) {

            user.update({$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

            recipe.update({$pull: {likedBy: [String(user._id), user.creationDate]}});

            user.save(function (err) {
                if (err) console.log(err);
                console.log('Success!');
            });


        }
    }




});

gotChefPromise().then((chef_) => {

    //// Add an if statement that checks if the reviewer and the chef aren't the same person

    console.log('in gotChefPromise callback, chef_ is' + chef_);

    /// TODO For some reason, this isn't updating the chefs karma, Lets test this one more time


    if ((votingRecord.alreadyUpvoted === false && reviewScore > 3) || (reviewScore > 3 && (votingRecord.alreadyVoted === false && votingRecord.newEntry === true))) {

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

        chef_.save(function (err) {
            if (err) console.log(err);
            console.log('Success!');
        });
    }

    else if ((votingRecord.alreadyDownvoted === false && reviewScore < 3) || ((reviewScore < 3) && (votingRecord.alreadyVoted === false && votingRecord.newEntry === true))) {

        chef_.update( {
                $inc: {
                    chefKarma: -1
                }
            },
            (err, doc) => {
                if (err) console.log(err);
                console.log(doc);
            });

        chef_.save(function (err) {
            if (err) console.log(err);
            console.log('Success!');
        });

    }




});




});












});

*/


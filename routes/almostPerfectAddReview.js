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



    return Recipe

        .findOne({name: name, category: category})

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

    let review_ = new reviewSchema({
        wouldMakeAgain: req.body.wouldMakeAgain,
        howGoodTaste: req.body.howGoodTaste,
        howEasyToMake: req.body.howEasyToMake,
        rating: reviewScore,
        chefsId: votingRecord.chefsId,
        postersCreationDate: req.decoded.creationDate,
        postedBy: req.decoded.id,
        reviewOf: dataObj.reviewOf,
        chefsCreationDate: dataObj.chefsCreationDate

    });

    if (votingRecord.alreadyVoted === false && dataObj.newEntry === true){

        recipe.reviewsOfRecipe.push(review_);

        ///// Don't use virtual types because you want Users to search for best and most reviewed recipes

        recipe.update({$inc: {'numberOfRatings': 1}});

        recipe.update({$inc: {'totalAddedRatings': reviewScore}});

        recipe.reviewAverage();

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

        recipe.reviewAverage();

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

        recipe.reviewAverage();
    }

    getUserPromise().then((user) => {

        console.log('In getUserPromise callback, user is...' + user);

        if (votingRecord.alreadyVoted !== true && dataObj.newEntry === true) {

            user.usersReviews.push(review_);

            user.save();

            if (reviewScore > 3) {

                user.usersFavouriteRecipes.push([dataObj.reviewOf, dataObj.chefsCreationDate])
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

                user.save();


            }
        }




    });

    gotChefPromise().then((chef_) => {

        //// Add an if statement that checks if the reviewer and the chef aren't the same person


        if (!votingRecord.alreadyUpvoted || (reviewScore > 3 && !votingRecord.alreadyVoted)) {

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


/**
 * Created by gabar on 2017-06-29.
 */

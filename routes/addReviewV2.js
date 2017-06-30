//// another version I am making that takes advantage of the creationDate stuff I am doing

let votingRecord = {
    alreadyVoted: undefined,
    alreadyDownvoted: undefined,
    alreadyUpvoted: undefined,
    gotReviewData: false,
    gotUserData: false,
    ranFirstProcess: false,
    gotChefDocument: false,
    gotUserDocument: false
};

let dataObj = {

  chefsId: undefined,
  chefsCreationDate: undefined,
  reviewOf: undefined,
  postersCreationDate: undefined,
  postedBy: undefined,
  newEntry: undefined
};

let userObj = {
  id: undefined,
  postersCreationDate: undefined
};

let reviewScore = (Number(req.body.howGoodTaste) + Number(req.body.wouldMakeAgain) + Number(req.body.howEasyToMake)) / 3;


let checkThenGetReview = (userid, recipeId) => {

  //// This checks through a users reviewsOfRecipe array, updates the votingRecord
  ///based on what it finds, and then returns the Recipe document in question

  return Recipe

    .findOne({_id: recipeId})

    .limit(1)

    .then((recipe) => {

      for (let i = 0; i < recipe.reviewsOfRecipe.length - 1; i++){
        if (String(recipe.reviewsOfRecipe[i].postedBy) === String(userid)){
          votingRecord.alreadyVoted = true;
          votingRecord.gotReviewData = true;
        //  votingRecord.ranFirstProcess = true;
          if (Number(recipe.reviewsOfRecipe[i].rating) > 3){
            votingRecord.alreadyUpvoted = true;
            votingRecord.alreadyDownvoted = false;
            dataObj.chefsId = String(recipe.reviewsOfRecipe[i].chefsId);
            dataObj.chefsCreationDate = Number(recipe.reviewsOfRecipe[i].chefsCreationDate);
            dataObj.reviewOf = String(recipe.reviewsOfRecipe[i].reviewOf);
            dataObj.postersCreationDate = Number(recipe.reviewsOfRecipe[i].postersCreationDate);
            dataObj.postedBy = String(recipe.reviewsOfRecipe[i].postedBy);
            dataObj.newEntry = false;
            return recipe;
            ///return user.reviewsOfRecipe

          }
          else if (Number(recipe.reviewsOfRecipe[i].rating) < 3){
            votingRecord.alreadyDownvoted = true;
            votingRecord.alreadyUpvoted = false;
            dataObj.chefsId = String(recipe.reviewsOfRecipe[i].chefsId);
            dataObj.chefsCreationDate = Number(recipe.reviewsOfRecipe[i].chefsCreationDate);
            dataObj.reviewOf = String(recipe.reviewsOfRecipe[i].reviewOf);
            dataObj.postersCreationDate = Number(recipe.reviewsOfRecipe[i].postersCreationDate);
            dataObj.postedBy = String(recipe.reviewsOfRecipe[i].postedBy);
            dataObj.newEntry = false;

            /// return user;
            return recipe;
          }
        }
        else {
          votingRecord.alreadyVoted = false;
          votingRecord.gotReviewData = true;
          dataObj.chefsId = String(recipe.postedBy);
          dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
          dataObj.reviewOf = String(recipe._id);
          dataObj.newEntry = true;
          return recipe;

        }
      }

    })
};

let getReviewer = (userid) => {


    if (dataObj.newEntry === true) {

      return User

        .findOne({_id: userid})

        .then((user) => {

          if (user !== null){
            votingRecord.gotUserDocument = true;
            userObj.id = String(user._id),
            userObj.postersCreationDate = Number(user.creationDate)
            console.log('Within getReviewerDoc, the returning thing is...' + user);
            return user

          }
        })

        .catch((err) => {
          console.log(err)
        });
      }

    else {

      return User

        .findOne({_id: userid, creationDate: dataObj.postersCreationDate})

        .then((user) => {

          if (user !== null){
            votingRecord.gotUserDocument = true;
            userObj.id = String(user._id),
            userObj.postersCreationDate = Number(user.creationDate)
            console.log('Within getReviewerDoc, the returning thing is...' + user);
            return user

          }
        })

        .catch((err) => {
          console.log(err)
        });

    }
};

let gotFirstDataPromise = (userid, recipeId) => {

  return new Promise((resolve, reject) => {

    let recipeDoc = checkThenGetReview(recipeId).then((recipe) => {
      console.log('recipe is ' + recipe);
      return recipe;
    });

    let userDoc = getReviewer(userid).then((voter) => {
            console.log("voter is " + voter);
            return voter;
        });

    if (votingRecord.gotUserDocument === true && votingRecord.gotReviewData === true){
      resolve(userDoc, recipeDoc)
    }
  });
}

let getChefDoc = (chefsId, chefsCreationDate) => {

  /// as input values, this takes the stingified _id and the chefsCreationDate from the dataObj
  /// returned by checkThenGetReview

  return User

        .findOne({_id: chefsId, creationDate: chefsCreationDate})

        .then((chef) => {

          if (chef !== null) {
            votingRecord.gotChefDocument = true;
            console.log('Within getChefDoc, the returning thing is....' + chef);
            return chef;
          }
        })

        .catch((err) => {
          console.log(err);
        });
};

let updateChefKarmaPromise = (chefDoc, reviewScore) => {

  return new Promise((resolve, reject) => {
      if (votingRecord.gotChefDocument === true && votingRecord.gotReviewData === true){
        resolve(chefDoc, reviewScore);
      }
      else{
        console.log('Problem, votingRecord.gotChefDocument is still...' + votingRecord.gotChefDocument);
        console.log('Problem, votingRecord.gotUserDocument is still...' + votingRecord.gotChefDocument);
        reject('Problem with updateChefKarmaPromise and the functions lead to it');
      }
  })
};

let updateFavouritesPromise = (userDoc) => {

  return new Promise((resolve, reject) => {
      if (votingRecord.gotUserDocument === true && votingRecord.ranFirstProcess === true){
        resolve(userDoc);
      }
      else {
        console.log('Problem, gotUserDocument is still...' + votingRecord.gotUserDocument);
        console.log('Problem, gotReviewData is still...' + votingRecord.gotReviewData);
        reject('Problem with updateFavouritesPromise');
      }
  });
}

let updateRecipeAndUserDoc = (userDoc, recipeDoc) => {

  return new Promise((resolve, reject) => {

    if (votingRecord.gotUserDocument === true && votingRecord.gotReviewData === true) {
        console.log('in updateRecipeAndUserDoc, userDoc...' + userDoc );
        console.log('in updateRecipeAndUserDoc, recipeDoc...' + recipeDoc);
        resolve(userDoc, recipeDoc);
    }
    else {
      reject('Problem with updateRecipeAndUserDoc');
    }
  })
};

gotFirstDataPromise(req.params.userid, req.params.recipeId).then((userDoc, recipeDoc) => {

  let chef_ = getChefDoc(dataObj.id, dataObj.chefsCreationDate).then((chef) => {
    if (chef !== null && chef !== undefined){
      votingRecord.gotChefDocument = true;
      console.log('within chef_ promise, gotUserDocument is...' + votingRecord.gotChefDocument);
      }
      return chef
    });

    updateChefKarmaPromise(chef_, reviewScore).then((chef_, reviewScore) => {



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

    });


    updateRecipeAndUserDoc(userDoc, recipeDoc).then((userDoc, recipeDoc) => {

      if (dataObj.newEntry) {

      let review_ = new Review({
        wouldMakeAgain: req.body.wouldMakeAgain,
        howGoodTaste: req.body.howGoodTaste,
        howEasyToMake: req.body.howEasyToMake,
        rating: reviewScore,
        chefsId: votingRecord.chefsId,
        postersCreationDate: userObj.postersCreationDate,
        postedBy: userObj.id,
        reviewOf: dataObj.reviewOf,
        chefsCreationDate: dataObj.chefsCreationDate

      });

      recipeDoc.reviewsOfRecipe.push(review_);

      recipeDoc.save();

      recipeDoc.reviewAverage;

      recipeDoc.save();

      if (reviewScore > 3){

        userDoc.usersFavouriteRecipes.push([dataObj.reviewOf, dataObj.chefsCreationDate]);

        userDoc.save();
      }


      /// already I am tired

      /// but here is the plan , do this asap.

      // if dataObj.newEntry = true, then update recipeDoc and insert it into
      // it's reviews array and call the virtual type function thing to update
      // its score.
      // then Within this

    }

    else {

      userDoc.update({reviewOf: dataObj.reviewOf}, {$set: {
          wouldMakeAgain: req.body.wouldMakeAgain,
          howGoodTaste: req.body.howGoodTaste,
          howEasyToMake: req.body.howEasyToMake,
          rating: reviewScore,
          comment: req.body.comment
      }});

      userDoc.save();

       if (reviewScore < 3 && votingRecord.alreadyUpvoted) {

         userDoc.update({$pull: {usersFavouriteRecipes: [dataObj.reviewOf, dataObj.chefsCreationDate]}});

         userDoc.save();

       }

    }

    })

});

/*

the fields for if the user already voted that you can get if alreadyReviewed is true

let chefsId = String(user.reviewsOfRecipe[i].chefsId);
let chefsCreationDate = Number(user.reviewsOfRecipe[i].chefsCreationDate);
let reviewOf = String(user.reviewsOfRecipe[i].reviewOf);
let postersCreationDate = Number(user.reviewsOfRecipe[i].postersCreationDate);



*/

/*
let updateReviewRecord = (score) => {

  // this should get called after either a user updated their review or submitted a review for the first time

    console.log('Fourth step...updating review record');

    if (score > 3){
        votingRecord.alreadyUpvoted = true;
        votingRecord.alreadyDownvoted = false;
        console.log('review.overallRating is...' + reviewScore + '  alreadyUpvoted is...' + votingRecord.alreadyVoted + ' alreadyDownvoted is ' + votingRecord.alreadyDownvoted);
        votingRecord.ranProcess = true;
        console.log("Updating process is done, votingRecord.ranProcess is " + votingRecord.ranProcess);

    }

    else if (score < 3){
        votingRecord.alreadyDownvoted = true;
        votingRecord.alreadyUpvoted = false;
        console.log('review.overallRating is...' + reviewScore + '  alreadyUpvoted is...' + votingRecord.alreadyVoted + ' alreadyDownvoted is ' + votingRecord.alreadyDownvoted);
        votingRecord.ranProcess = true;
        console.log("Updating process is done, votingRecord.ranProcess is " + votingRecord.ranProcess);

    }

};

*/


//// deleting a revi

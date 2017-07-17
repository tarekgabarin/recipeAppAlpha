const Recipe = require('../model/recipe');
const User = require('../model/user');


exports.checkThenGetRecipe = (dataObj, votingRecord, name, category, userid) => {

    //// This checks through a users reviewsOfRecipe array, updates the votingRecord
    ///based on what it finds, and then returns the Recipe document in question



    return Recipe.findOne({name: name, category: category})

        .then((recipe) => {

            console.log('1 - recipe is...' + recipe);

            console.log('length of recipe.reviewsOfRecipe is..' + recipe.reviewsOfRecipe.length);

            if (recipe){

                if (recipe.reviewsOfRecipe.length !== 0){
                    for (let i = 0; i <= recipe.reviewsOfRecipe.length; i++) {
                        if (String(recipe.reviewsOfRecipe[i].postedBy) === String(userid)) {
                            votingRecord.alreadyVoted = true;
                            dataObj.originalRating = recipe.reviewsOfRecipe[i].rating;
                            if (Number(recipe.reviewsOfRecipe[i].rating) > 3) {
                                votingRecord.alreadyUpvoted = true;
                                votingRecord.alreadyDownvoted = false;
                                console.log('checkThenGetRecipe is running');
                                dataObj.chefsId = String(recipe.postedBy);
                                dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
                                dataObj.reviewOf = String(recipe._id);
                                dataObj.newEntry = false;
                                dataObj.reviewIndex = i;
                                votingRecord.gotRecipeDocument = true;
                                votingRecord.gotReviewData = true;
                                return recipe;

                            }
                            else if (Number(recipe.reviewsOfRecipe[i].rating) < 3) {
                                votingRecord.alreadyDownvoted = true;
                                votingRecord.alreadyUpvoted = false;
                                dataObj.chefsId = String(recipe.postedBy);
                                dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
                                dataObj.reviewOf = String(recipe._id);
                                dataObj.newEntry = false;
                                dataObj.reviewIndex = i;
                                votingRecord.gotRecipeDocument = true;
                                votingRecord.gotReviewData = true;
                                return recipe;
                            }
                        }
                        else {
                            dataObj.chefsId = String(recipe.postedBy);
                            dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
                            dataObj.reviewOf = String(recipe._id);
                            dataObj.newEntry = true;
                            votingRecord.alreadyVoted = false;
                            votingRecord.gotReviewData = true;
                            votingRecord.gotRecipeDocument = true;
                            console.log('users did review recipe');
                            return recipe;

                        }
                    }

                }

                else {

                    dataObj.chefsId = String(recipe.postedBy);
                    dataObj.chefsCreationDate = Number(recipe.postersCreationDate);
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

exports.deleteRecipeAndUserData = (name, category, userId) => {


    let reviewCounter = 0;

    let updatePromise = () => {

        return new Promise((resolve, reject) => {


            Recipe.findOne({category: category, name: name}).then((recipe) => {




                for (let i = 0; i < recipe.reviewsOfRecipe.length; i++) {

                    console.log('running first loop');

                    console.log('recipe.reviewsOfRecipe[i].postedBy is...' + recipe.reviewsOfRecipe[i].postedBy);

                    console.log('recipe.reviewsOfRecipe[i].postersCreationDate is....' + recipe.reviewsOfRecipe[i].postersCreationDate);


                    User.findOne({_id: recipe.reviewsOfRecipe[i].postedBy, creationDate: recipe.reviewsOfRecipe[i].postersCreationDate}).then((user) => {

                        for (let i = 0; i < user.usersReviews.length; i++){

                            console.log('running second loop');

                            console.log('user.usersReviews[i].reviewOf is....' + user.usersReviews[i].reviewOf);

                            console.log('String(recipe._id) is.... ' + String(recipe._id));

                            if (user.usersReviews[i].reviewOf === String(recipe._id)){

                                user.usersReviews[i].recipeName = "Recipe was deleted by it's chef :(";


                                User.findOneAndUpdate({_id: user._id, creationDate: user.creationDate}, {$pull: {usersFavouriteRecipes: {recipeId: String(recipe._id)}}}).then(() => {
                                    console.log('item removed from usersFavouriteRecipes')
                                });

                                user.save();

                            }

                        }




                    });


                    reviewCounter += 1;




                }


                console.log('reviewCounter is...' + reviewCounter);


                if (recipe.reviewsOfRecipe.length === reviewCounter){

                    resolve(recipe);
                }
                else {
                    reject('Did not update process yet')
                }


            });




        });



    };





    updatePromise().then((recipe) => {

        if (userId === recipe.postedBy) {

            recipe.remove();




        }



    });





};
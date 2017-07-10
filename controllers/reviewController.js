const Recipe = require('../model/recipe');


exports.checkThenGetRecipe = (dataObj, votingRecord, name, category, userid) => {

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
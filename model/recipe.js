// const reviewSchema = require('../model/review');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/user');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

let reviewSchema = new Schema();

reviewSchema.add({


    rating: {
        type: Number,
        min: 1,
        max: 5,
        defualt: 0
    },

  /* here is how the overall score is calculated:

   let total = (this.howEasyToMake + this.howGoodTaste + wouldMakeAgain) / 3





   */

    howEasyToMake: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    howGoodTaste: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    wouldMakeAgain: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },


    comment: {
        type: String,
        default: ""
    },


    postedBy: {
        type: String,
        required: true,
        index: true
    },

    reviewOf: {
        type: String,
        required: true,
        index: true
    },

    postersCreationDate: {
        type: Number,
        required: true
    },

    chefsCreationDate: {
        type: Number,
        required: true
    },

    chefsId: {
        type: String,
        required: true
    }


});


let recipeSchema = new Schema({

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
  },

  steps: {
    type: String,
    required: true,
  },

  ingredients: {
    type: Array,
    default: ['1', '2', '3', '4']
  },

  category: {
    type: String,
    required: true,
    index: true
  },

  postedBy: {
    type: String,
    required: true,
  },

  /// Line below may not work

  //

  reviewsOfRecipe: [reviewSchema],

  /// postedBy: {type: Schema.Types.ObjectId, ref: 'User'},



  numberOfRatings: {
    type: Number,
    default: 0
  },

  totalAddedRatings: {
      type: Number,
      default: 0
  },

  reviewAverage: {
      type: Number,
      default: undefined
  },



  postersCreationDate: {
    type: Number,
    index: true
  },

  likedBy: {
      type: Array

  },

  reviewedBy: {
      type: Array
  }

  /// Maybe have the function that calculates the mean score here? Need to be check if mongoose is okay with functions in
    // in a Schema

  //// add the total added ratings, number of ratings, and the function

});

//recipeSchema.virtual('numberOfRatings').get(function(){

//})



recipeSchema.methods.updateReviewAverage = function(){

    let recipe = this;

    this.reviewAverage = this.totalAddedRatings / this.numberOfRatings;

};



/// So I learnt that by defining the string as "Recipe" in the model function, I will have to lower case it
/// and pluralize it when I use it with res.json and other such things (i.e. "Recipe" => recipes).

let Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe, reviewSchema;

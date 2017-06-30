// const reviewSchema = require('../model/review');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/user');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;
const reviewSchema = require('../model/review');



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


  reviewsOfRecipe: [reviewSchema],

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


});




recipeSchema.methods.updateReviewAverage = function(){

    let recipe = this;

    this.reviewAverage = this.totalAddedRatings / this.numberOfRatings;

};


let Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
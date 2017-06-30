const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const validator = require('validator');
const uuidV4 = require('uuid/v4');
// const {reviewSchema} = require('../model/review');
/// const {recipeSchema} = require('../model/recipe');
let Schema = mongoose.Schema;
const favouriteSchema = require('./favourite');
const jwt = require('jsonwebtoken');
/// const {SHA256} = require('crypto-js');
const _ = require('lodash');
/// remember to install crypto-js
const reviewSchema = require('../model/review').reviewSchema;

/*


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
/*

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

    recipeName: {
        type: String,
        required: true
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

*/


let User = new Schema({

    name: {
        type: String
    },

    // The passport plugin already inputs username and password into our Schema

    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    userId: {
        type: String,
        default: "Empty"
    },

    /*

    tokens: [{

        access: {
            type: String,
            required: true
        },

        token: {
            type: String,
            required: true
        }

    }],

    */

    profilePic: {
        type: String,
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },

            message: `{value} is not a valid email address.`
        }
    },

    admin: {
        type: Boolean,
        defualt: false
    },

    // submit the string _id's of the users created recipes into this array
    // to search for these, use the users creationDate as an index to optmize query performance
    usersRecipes: [],


    /// Just keeps track of all the recipes the user has cooked, regardless of their score

    cookedRecipes: {

        type: Array

    },


    /// The user saves a recipe he or she would later like to cook in this array, when the user reviews it, the
    // recipe is removed from this array

    cookLater: [],

    //usersRecipes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],

    usersReviews: [reviewSchema],


    /// Stick with just submitting the string _id's of the users liked recipes,
    /// maybe have it be nested arrays that are this ['string_id', here would be the recipes creationDate]
    usersFavouriteRecipes: [],

    creationDate: {
        type: Number,
        default: new Date().getMonth(),
        index: true
    },

    /// usersLikedRecipes: [LikedDish],

    chefKarma: {
        type: Number,
        default: 0
    },

    /// anyone who has ever reviewed a dish by thr user

    reviewedBy: {
        type: Array
    },

    /// all the people subscribed to the user

    followedBy: {
        type: Array
    },

    /// an array of sub arrays containing the _id and creation date of all the chefs the user follows

    subscribedTo: {

    }
});

User.methods.passwordComparison = function(candidate, callback){
    bcrypt.compare(candidate, this.password, function(err, doesMatch){
        if (err) {return callback(err)}
        callback(null, doesMatch);
    })
};

/*


User.methods.toJSON = function(){

  let account = this;

  let userObj = account.toObject();

  return _.pick(userObj, [ '_id', 'name', 'username', 'email', 'usersReviews', 'usersFavouriteRecipes', 'usersRecipes', 'profilePic', 'chefKarma']);

}

User.methods.generateAuthToken = function(){

  let user = this;

  let passNum = String(this.username).charCodeAt(0);

  let luckyNum = String((Number(passNum) * 769) + 'TLL')

    // --->
    // Maybe I shouldn't use this because the salty thing shouldn't change and uuidV4 generates random shit
    let salty = bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(luckyNum, salt, function(err, hash){
          if (err) throw err;
          return hash
      })
  })();
    //// var hash = SHA256(userid).toString();

    let access ='auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, salty).toString();
    user.token.push({access, token});
    user.save().then(() => {
      return token;
    });

}


User.methods.authenticateToke = function(token){






}

*/


let options = ({missingPasswordError: "Incorrect password, try again"});

User.plugin(passportLocalMongoose, options);

User = mongoose.model('User', User);

module.exports = {User, reviewSchema};

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
const reviewSchema = require('../model/review');




let User = new Schema({


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

    isActive: {
        type: Boolean,
        default: true
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
        default: false
    },

    // submit the string _id's of the users created recipes into this array
    // to search for these, use the users creationDate as an index to optmize query performance
    usersRecipes: [{

        recipeId: {
            type: String
        },

        creationDate: {
            type: Number
        },

        category: {
            type: String
        }


    }],


    /// Just keeps track of all the recipes the user has cooked, regardless of their score

    cookedRecipes: {

        type: Array

    },


    /// The user saves a recipe he or she would later like to cook in this array, when the user reviews it, the
    // recipe is removed from this array

    cookLater: [{

        recipeId: {
            type: String
        },

        creationDate: {
            type: Number
        }


    }],

    //usersRecipes: [{type: Schema.Types.ObjectId, ref: 'Recipe'}],

    usersReviews: [reviewSchema],


    /// Stick with just submitting the string _id's of the users liked recipes,
    /// maybe have it be nested arrays that are this ['string_id', here would be the recipes creationDate]
    usersFavouriteRecipes: [{

        recipeId: {
            type: String
        },

        creationDate: {
            type: Number
        }

    }],

    creationDate: {
        type: Number,
        default: function(){

            return Math.floor(Math.random() * 11);

        },
        index: true
    },

    /// usersLikedRecipes: [LikedDish],

    chefKarma: {
        type: Number,
        default: 0
    },

    /// anyone who has ever reviewed a dish by the user

    reviewedBy: [],


    /// all the people subscribed to the user

    followedBy: [{

       userid: {
           type: String
       },

        creationDate: {
           type: Number
        }
    }],

    /// an array of sub arrays containing the _id and creation date of all the chefs the user follows

    subscribedTo: [{

        userid: {
            type: String
        },

        creationDate: {
            type: Number
        }

    }],

    profilePic:{

        type: String,
        default: 'BLANK'

    },

    firstName: {
        type: String,
        required: true,
        defualt: ''
    },

    lastName: {
        type: String,
        required: true,
        default: ''
    },

    aboutMe: {
        type: String,
        default: ''

    },

    city: {
        type: String,
        required: true,
        default: ''

    },

    country: {
        type: String,
        required: true,
        default: ''
    }


});

User.methods.passwordComparison = function(candidate, callback){
    bcrypt.compare(candidate, this.password, function(err, doesMatch){
        if (err) {return callback(err)}
        callback(null, doesMatch);
    })
};




let options = ({missingPasswordError: "Incorrect password, try again"});

User.plugin(passportLocalMongoose, options);

User = mongoose.model('User', User);

module.exports = User;

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
        type: String
    },

    recipeName: {
        type: String
    },

    postersName: {
        type: String
    },

    isActive: {
        type: Boolean,
        default: true
    },

    postedAt: {
        type: String,
        default: new Date()
    }


});

module.exports = reviewSchema;
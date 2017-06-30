const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favouriteSchema = new Schema({

  recipeId: {
    type: String,
    required: true
  },
  postersCreationDate: {
    type: Number,
    required: true
  }
});

module.exports = favouriteSchema;

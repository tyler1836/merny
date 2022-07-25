const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const bagSchema = new Schema(
  {
    copper: Number,
    silver: Number,
    gold: Number,
    platinum: Number 
  },
  {
    toJSON: {
      getters: true
    }
  }
);

module.exports = model("Bag", bagSchema);
const mongoose = require('mongoose');

const birdSchema = new mongoose.Schema({
   quantity: {
    type: Number,
    required: true
  }
},{ timestamps: true })

birdSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Bird', birdSchema);
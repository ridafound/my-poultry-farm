const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    totalEggs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Stock', stockSchema);
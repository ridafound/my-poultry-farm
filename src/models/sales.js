const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    crates: {
      type: Number,
      required: [true, "Crates is required"],
      min: [1, "Crates must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be at least 1"],
    },
  },
  { timestamps: true }
);
salesSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Sale', salesSchema);
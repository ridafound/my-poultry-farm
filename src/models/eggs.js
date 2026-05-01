const mongoose = require("mongoose");

const eggSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

eggSchema.index({ createdAt: -1 });
module.exports = mongoose.model("Egg", eggSchema);
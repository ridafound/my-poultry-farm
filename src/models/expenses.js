const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      minlength: [5, "Purpose must be at least 5 characters long"],
      trim: true,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ createdAt: -1 });
module.exports = mongoose.model('Expense', expenseSchema);
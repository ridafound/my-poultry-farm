const Expense = require('../models/expenses');
const dayjs = require("dayjs");
const { BadRequestError } = require('../errors')
const { StatusCodes } = require('http-status-codes');

const addExpense = async (req, res) => {
  let { amount, purpose } = req.body;

  if (!amount || !purpose) {
    throw new BadRequestError("All fields required");
  }

  const amountNum = Number(amount);

  if (isNaN(amountNum) || amountNum <= 0) {
    throw new BadRequestError("Amount must be a number greater than 0");
  }

  const expense = await Expense.create({
    amount: amountNum,
    purpose: purpose.trim(),
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: expense,
    msg: "Expense recorded successfully",
  });
};



const getExpensesHistory = async (req, res) => {

  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (Number(page) - 1) * limit;

  const result = await Expense.aggregate([
    { $match: req.filter },
    {
      $facet: {
        history: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              amount: 1,
              purpose: 1,
              createdAt: 1,
              formattedDate: {
                $dateToString: {
                  format: "%d %b %Y",
                  date: "$createdAt",
                },
              },
            },
          },
        ],

        stats: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
              count: { $sum: 1 },
            }
          }
        ]
      }
    }
  ]);


  // Safe data extraction
  const history = result[0]?.history || [];
  const stats = result[0]?.stats[0] || { totalAmount: 0, count: 0 };

  const totalAmount = stats.totalAmount;
  const totalCount = stats.count;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      history,
      totalAmount,
      totalCount,
      pagination: {
      page: Number(page),
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
    }
   
  });

}
module.exports = { addExpense, getExpensesHistory }
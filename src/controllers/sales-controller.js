const Sale = require('../models/sales');
const Stock = require('../models/stocks');
const Expense = require('../models/expenses')
const { BadRequestError } = require('../errors')
const { StatusCodes } = require('http-status-codes');

const createSale = async (req, res) => {
  const { crates, price } = req.body;
  const cratesNum = Number(crates);
  const priceNum = Number(price);

  // 1. Validation
  if (isNaN(cratesNum) || isNaN(priceNum) || cratesNum < 1 || priceNum < 1) {
    throw new BadRequestError("Valid crates and price (greater than 0) are required");
  }

  const eggsToSubtract = cratesNum * 30;

  // 2. Check stock and update atomically
  // We use the filter to ensure totalEggs is sufficient before subtracting
  const stock = await Stock.findOneAndUpdate(
    { totalEggs: { $gte: eggsToSubtract } },
    { $inc: { totalEggs: -eggsToSubtract } },
    { new: true }
  );

  if (!stock) {
    throw new BadRequestError("Not enough eggs in stock to complete this sale!");
  }

  // 3. Create Sale record
  const sale = await Sale.create({
    crates: cratesNum,
    price: priceNum,
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      ...sale.toObject(),
      totalRevenue: cratesNum * priceNum,
      remainingCrates: Math.floor(stock.totalEggs / 30),
      remainingEggs: stock.totalEggs % 30
    },
    msg: "Sale recorded successfully!",
  });
};


//History
const getSalesHistory = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (Number(page) - 1) * limit;
  const filter = req.filter || {};

  // Parallelize Sales and Expenses queries
  const [salesData, expenseData] = await Promise.all([
    Sale.aggregate([
      { $match: filter },
      {
        $facet: {
          history: [
            { $sort: { createdAt: -1 } },
            { $addFields: { total: { $multiply: ["$crates", "$price"] } } },
            {
              $project: {
                crates: 1,
                price: 1,
                total: 1,
                createdAt: 1,
                formattedDate: {
                  $dateToString: {
                    format: "%d %b %Y",
                    date: "$createdAt",
                  },
                },
              },
            },
            { $skip: skip },
            { $limit: limit },
          ],
          stats: [
            {
              $group: {
                _id: null,
                totalSales: { $sum: { $multiply: ["$crates", "$price"] } },
                totalCratesSold: { $sum: "$crates" },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]),
    Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
    ])
  ]);

  // Safe Extraction
  const history = salesData[0]?.history || [];
  const salesStats = salesData[0]?.stats[0] || { totalSales: 0, totalCratesSold: 0, count: 0 };
  const totalExpense = expenseData[0]?.totalExpense || 0;

  const totalSales = salesStats.totalSales;
  const totalCrates = salesStats.totalCratesSold;
  const totalCount = salesStats.count;
  const profit = totalSales - totalExpense;

  res.status(StatusCodes.OK).json({
    success: true,
    data: history,
    summary: {
      totalSales,
      totalCrates,
      totalExpense,
      profit
    },
    pagination: {
      page: Number(page),
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  });
};

module.exports = { createSale, getSalesHistory }
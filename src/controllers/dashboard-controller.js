const dayjs = require("dayjs");
const Bird = require('../models/birds');
const Egg = require('../models/eggs');
const Sale = require("../models/sales");
const Expense = require("../models/expenses");
const Stock = require("../models/stocks");
const { StatusCodes } = require('http-status-codes');

const EGGS_PER_CRATE = 30;

const getDashboardStats = async (req, res) => {
  const startOfDay = dayjs().startOf("day").toDate();
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  // Parallel execution: all queries run at once
  const [
    birdResult,
    stock,
    dailyEggsResult,
    dailySalesAgg,
    monthlySalesAgg,
    monthlyExpensesAgg
  ] = await Promise.all([
    Bird.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }]),
    Stock.findOne(),
    Egg.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, totalEggs: { $sum: "$quantity" } } }
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$crates", "$price"] } } } }
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$crates", "$price"] } } } }
    ]),
    Expense.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);


  // 1. Calculate Inventory from totalEggs
  const totalEggsInStock = stock?.totalEggs || 0;
  const fullCrates = Math.floor(totalEggsInStock / EGGS_PER_CRATE);
  const looseEggs = totalEggsInStock % EGGS_PER_CRATE;


  // Extract values with 0 as default
  const totalBirds = birdResult[0]?.total || 0;
  const dailyEggs = dailyEggsResult[0]?.totalEggs || 0;
  const todaySales = dailySalesAgg[0]?.total || 0;
  const monthlySales = monthlySalesAgg[0]?.total || 0;
  const monthlyExpenses = monthlyExpensesAgg[0]?.total || 0;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      totalBirds,
      dailyEggs,
      inventory: {
        fullCrates,
        looseEggs
      },
      financials: {
        todaySales,
        monthlySales,
        monthlyExpenses,
        monthlyProfit: monthlySales - monthlyExpenses
      }
    }
  });
};

module.exports = { getDashboardStats };
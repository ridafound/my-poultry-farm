const dayjs = require("dayjs");
const Egg = require("../models/eggs");
const Expense = require("../models/expenses");
const Stock = require("../models/stocks");
const { StatusCodes } = require("http-status-codes");

const EGGS_PER_CRATE = 30;

const getInventoryStats = async (req, res) => {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  // Run all database queries in parallel
  const [eggResult, expenseResult, stock] = await Promise.all([
    Egg.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalEggs: { $sum: "$quantity" } } }
    ]),
    Expense.aggregate([
      { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
    ]),
    Stock.findOne()
  ]);

  // Extract Monthly Totals
  const monthlyEggs = eggResult?.[0]?.totalEggs || 0;
  const monthlyExpense = expenseResult?.[0]?.totalExpense || 0;

  // Calculate Cost Per SINGLE Egg first for precision
  const costPerEgg = monthlyEggs > 0 ? monthlyExpense / monthlyEggs : 0;
  const costPerCrate = costPerEgg * EGGS_PER_CRATE;

  // Inventory logic using totalEggs
  const totalEggsInStock = stock?.totalEggs || 0;
  const currentCrates = Math.floor(totalEggsInStock / EGGS_PER_CRATE);
  const remainingEggs = totalEggsInStock % EGGS_PER_CRATE;

  // Stock value  calculated by individual egg cost
  const totalStockValue = totalEggsInStock * costPerEgg;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      stock: {
        totalEggs: totalEggsInStock,
        crates: currentCrates,
        looseEggs: remainingEggs
      },
      metrics: {
        costPerCrate: Number(costPerCrate.toFixed(2)),
        stockValue: Number(totalStockValue.toFixed(2))
      }
    }
  });
};

module.exports = { getInventoryStats };
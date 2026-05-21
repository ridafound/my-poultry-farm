const dayjs = require("dayjs");
const Egg = require("../models/eggs");
const Expense = require("../models/expenses");
const Stock = require("../models/stocks");
const { StatusCodes } = require("http-status-codes");

const EGGS_PER_CRATE = 30;

const getInventoryStats = async (req, res) => {

  const [eggResult, expenseResult, stock] = await Promise.all([
    Egg.aggregate([
      { $group: { _id: null, totalEggs: { $sum: "$quantity" } } }
    ]),
    Expense.aggregate([
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } }
    ]),
    Stock.findOne()
  ]);

  // Extract Global Lifetime Historical Totals
  const totalEggsProduced = eggResult?.[0]?.totalEggs || 0;
  const totalFarmExpenses = expenseResult?.[0]?.totalExpense || 0;

  // Calculate Cost Per SINGLE Egg with an fallback safeguard to prevent NaN errors
  const costPerEgg = totalEggsProduced > 0 ? totalFarmExpenses / totalEggsProduced : 0;
  const costPerCrate = costPerEgg * EGGS_PER_CRATE;

  // Inventory logic using live stock data tracking
  const totalEggsInStock = stock?.totalEggs || 0;
  const currentCrates = Math.floor(totalEggsInStock / EGGS_PER_CRATE);
  const remainingEggs = totalEggsInStock % EGGS_PER_CRATE;

  
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
        stockValue: Number(totalStockValue.toFixed(2)),
        avgCostPerEgg: Number(costPerEgg.toFixed(2)) // Helpful metric for detailed UI rendering
      }
    }
  });
};

module.exports = { getInventoryStats };
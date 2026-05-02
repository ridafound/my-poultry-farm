const dayjs = require("dayjs");
const Egg = require("../models/eggs");
const Sale = require("../models/sales");
const Expense = require("../models/expenses");
const { StatusCodes } = require('http-status-codes');
const buildDateFilter = require("../utils/overviewDateFilter");
const { generateDateRange, fillMissingDates } = require("../utils/dateUtils")

const getOverview = async (req, res) => {
  const { filter, start, end } = buildDateFilter(req.query);

  const [eggsRaw, salesRaw, expenseRaw] = await Promise.all([
    //eggs
    Egg.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: "$quantity" },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]),

    //sales
    Sale.aggregate([
      { $match: filter },
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: {
            $multiply: ["$crates", "$price"],
          },
        },
      },
      {
        $group: {
          _id: "$date",
          revenue: { $sum: "$revenue" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
        },
      },
    ]),

    Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          expense: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          expense: 1,
        },
      },
    ])

  ]);

  //  build full timeline
  const dates = generateDateRange(start, end);

  const eggsMap = Object.fromEntries(eggsRaw.map(i => [i.date, i.count]));
  const salesMap = Object.fromEntries(salesRaw.map(i => [i.date, i.revenue]));
  const expenseMap = Object.fromEntries(expenseRaw.map(i => [i.date, i.expense]));

  const overview = dates.map(date => {
    const eggs = eggsMap[date] || 0;
    const sales = salesMap[date] || 0;
    const expenses = expenseMap[date] || 0;

    return {
      date,
      eggs,
      sales,
      expenses,
      profit: sales - expenses,
    };
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: overview
  })

}

module.exports = { getOverview }
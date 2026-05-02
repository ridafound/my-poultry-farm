const dayjs = require("dayjs");
const Egg = require('../models/eggs');
const Stock = require('../models/stocks')
const { BadRequestError } = require('../errors')
const { StatusCodes } = require('http-status-codes');

const EGGS_PER_CRATE = 30;

const addEggs = async (req, res) => {
  const { quantity } = req.body;
  const quantityNum = Number(quantity);

  if (isNaN(quantityNum) || quantityNum < 1) {
    throw new BadRequestError("Quantity must be a valid number greater than 0");
  }

  // 1. Record the daily collection
  const egg = await Egg.create({ quantity: quantityNum });

  // 2. Update the total egg count in stock atomically
  const stock = await Stock.findOneAndUpdate(
    {},
    { $inc: { totalEggs: quantityNum } },
    { upsert: true, returnDocument: "after" }
  );

  // 3. Calculate current crates for the response
  const currentCrates = Math.floor(stock.totalEggs / EGGS_PER_CRATE);
  const leftoverEggs = stock.totalEggs % EGGS_PER_CRATE;

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      egg,
      totalEggsInStock: stock.totalEggs,
      totalCrates: currentCrates,
      leftoverEggs: leftoverEggs
    },
    msg: `Added ${quantityNum} eggs. Total stock is now ${currentCrates} crates and ${leftoverEggs} eggs.`
  });
};


//DAILY QUANTITY
const getTodayTotal = async (req, res) => {


  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  const result = await Egg.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantity" }
      }
    }
  ]);

  const totalQuantity = result?.[0]?.totalQuantity || 0;

  res.status(StatusCodes.OK).json({
    success: true,
    totalQuantity,
  })

}

//HISTORY

const getHistory = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (Number(page) - 1) * limit;

  // Aggregate to get both the list and the overall sum
  const result = await Egg.aggregate([
    { $match: req.filter || {} }, // Added fallback for filter
    {
      $facet: {
        history: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              quantity: 1,
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
              totalQuantity: { $sum: "$quantity" }
            }
          }
        ],
        count: [
          { $count: "totalDocuments" }
        ]
      }
    }
  ]);

  // Safe extraction of data
  const history = result[0]?.history || [];
  const totalQuantity = result[0]?.stats[0]?.totalQuantity || 0;
  const totalDocuments = result[0]?.count[0]?.totalDocuments || 0;

  // Logic to show how many crates these eggs represent in total
  const totalCrates = Math.floor(totalQuantity / EGGS_PER_CRATE);
  const looseEggs = totalQuantity % EGGS_PER_CRATE;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      history,
      pagination: {
        page: Number(page),
        limit,
        totalDocuments,
        totalPages: Math.ceil(totalDocuments / limit) || 1,
      },
      totalQuantity, // Total eggs ever recorded (filtered)
      totalCrates,   // Total crates ever recorded (filtered)
      looseEggs, // The remainder
    }
  });
};

module.exports = { addEggs, getHistory, getTodayTotal }

const dayjs = require("dayjs");
const Bird = require('../models/birds');
const { BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');


const addBirds = async (req, res) => {
    const { quantity } = req.body;

    // Convert to a number explicitly
    const quantityNum = Number(quantity);


    if (isNaN(quantityNum) || quantityNum < 1) {
        throw new BadRequestError("Quantity must be a valid number greater than 0");
    }


    const bird = await Bird.create({ quantity: quantityNum });

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: bird,
        msg: `${quantityNum} Birds added to stock`
    });
};


// GET BIRD HISTORY
const getHistory = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const result = await Bird.aggregate([
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

                            // 👇 consistent formatted date
                            formattedDate: {
                                $dateToString: {
                                    format: "%d %b %Y",
                                    date: "$createdAt",
                                },
                            },
                        },
                    },
                ],

                count: [
                    { $count: "total" }
                ],
                totalBirds: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$quantity" },
                        },
                    },
                ],
            },
        }
    ]);
    const history = result[0]?.history || [];
    const total = result[0]?.count[0]?.total || 0;
     const totalBirds = result[0]?.totalBirds[0]?.total || 0;

    res.status(StatusCodes.OK).json({
        success: true,
        data: history,
        totalBirds,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        },
    });
};

module.exports = { addBirds, getHistory };
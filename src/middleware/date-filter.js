const buildDateFilter = require("../utils/dateFilter");



const dateFilterMiddleware = (req, res, next) => {
  req.filter = buildDateFilter(req.query);
  next();
};

module.exports = dateFilterMiddleware;
const Stock = require('../models/stock');

const getOrCreateStock = async () => {
  let stock = await Stock.findOne();

  if (!stock) {
    stock = await Stock.create({ crates: 0 });
  }

  return stock;
};
module.exports = getOrCreateStock
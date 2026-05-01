const dayjs = require("dayjs");


//Generate all dates between start and end

function generateDateRange(start, end) {
  const dates = [];
  let current = dayjs(start);

  while (current.isBefore(end) || current.isSame(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  return dates;
}



// dates - full list of dates
// data - raw DB data
// key - field to extract(e.g. "count", "revenue")

function fillMissingDates(dates, data, key = "count") {
  const map = new Map();

  data.forEach((item) => {
    map.set(item.date, item[key]);
  });

  return dates.map((date) => ({
    date,
    [key]: map.get(date) || 0,
  }));
}


module.exports = {generateDateRange,fillMissingDates,}
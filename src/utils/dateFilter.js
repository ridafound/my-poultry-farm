const dayjs = require("dayjs");
const { BadRequestError } = require('../errors')

const buildDateFilter = (query) => {
  const { range, start, end } = query;

  let startDate, endDate;

  if (start && end) {
    startDate = dayjs(start).startOf("day");
    endDate = dayjs(end).endOf("day");

    if (endDate.isBefore(startDate)) {
      throw new BadRequestError("Invalid date range");
    }

  } else if (range === "today") {
    startDate = dayjs().startOf("day");
    endDate = dayjs().endOf("day");

  } else if (range === "week") {
    startDate = dayjs().startOf("week");
    endDate = dayjs().endOf("week");

  } else if (range === "month") {
    startDate = dayjs().startOf("month");
    endDate = dayjs().endOf("month");

  } else if (range === "year") {
    startDate = dayjs().startOf("year");
    endDate = dayjs().endOf("year");

  } else {
    startDate = dayjs().startOf("month");
    endDate = dayjs().endOf("month");
  }

  return {
    createdAt: {
      $gte: startDate.toDate(),
      $lte: endDate.toDate(),
    },
  };
};

module.exports = buildDateFilter;
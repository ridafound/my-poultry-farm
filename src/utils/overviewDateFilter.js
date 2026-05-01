// utils/dateFilter.js
const dayjs = require("dayjs");
const { BadRequestError } = require("../errors");

const buildDateFilter = (query) => {
  const { range, start, end } = query;

  let startDate, endDate;

  // 🔹 1. Custom range (highest priority)
  if (start && end) {
    startDate = dayjs(start).startOf("day");
    endDate = dayjs(end).endOf("day");

    if (endDate.isBefore(startDate)) {
      throw new BadRequestError("Invalid date range");
    }

  // 🔹  Preset ranges
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

  //  3. Default fallback = last 7 days
  } else {
    endDate = dayjs().endOf("day");
    startDate = endDate.subtract(7, "day");
  }

  return {
    filter: {
      createdAt: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    },
    start: startDate.toDate(),
    end: endDate.toDate(),
  };
};

module.exports = buildDateFilter;
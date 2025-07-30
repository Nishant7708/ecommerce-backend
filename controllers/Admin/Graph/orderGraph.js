import Order from "../../../models/Order.js";
import moment from "moment";

export const orderGraph = async (req, res) => {
  try {
    const now = moment().endOf("day");
    const dateRanges = {
      daily: moment().subtract(29, "days").startOf("day"),
      weekly: moment().subtract(11, "weeks").startOf("isoWeek"),
      monthly: moment().subtract(11, "months").startOf("month"),
      yearly: moment().subtract(4, "years").startOf("year"),
    };

    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRanges.yearly.toDate(), $lte: now.toDate() },
        },
      },
      {
        $project: {
          createdAt: 1,
          status: 1,
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          week: { $dateToString: { format: "%G-%V", date: "$createdAt" } },
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          year: { $dateToString: { format: "%Y", date: "$createdAt" } },
        },
      },
    ]);

    const prepareStats = (groupBy, startMoment, totalUnits, unitType) => {
      const map = {};
      for (const p of orders) {
        const period = p[groupBy];
        if (!map[period]) {
          map[period] = {
            newlyCreated: 0,
            totalPending: 0,
            totalProcessing: 0,
            totalShipped: 0,
            totalDelivered: 0,
            totalCancelled: 0
          };
        }
        map[period].newlyCreated += 1;
        if (p.status === "pending") map[period].totalPending += 1;
        else if (p.status === "processing") map[period].totalProcessing += 1;
        else if (p.status === "shipped") map[period].totalShipped += 1;
        else if (p.status === "delivered") map[period].totalDelivered += 1;
        else if (p.status === "cancelled") map[period].totalCancelled += 1;
      }

      const result = [];
      let cumulativeTotal = 0;

      for (let i = 0; i < totalUnits; i++) {
        const current = moment(startMoment).add(i, unitType);
        const formatted =
          groupBy === "week"
            ? current.format("GGGG-ww")
            : current.format(
              groupBy === "day"
                ? "YYYY-MM-DD"
                : groupBy === "month"
                  ? "YYYY-MM"
                  : "YYYY"
            );

        const stats = map[formatted] || {
          newlyCreated: 0,
          totalPending: 0,
          totalProcessing: 0,
          totalShipped: 0,
          totalDelivered: 0,
          totalCancelled: 0
        };

        const totalOrders = stats.totalPending + stats.totalProcessing + stats.totalShipped + stats.totalDelivered + stats.totalCancelled;
        cumulativeTotal += totalOrders;

        result.push({
          period: current.valueOf(),
          ...stats,
          total: cumulativeTotal,
        });
      }

      const startIndex = result.findIndex((r) => r.total > 0);
      return startIndex !== -1 ? result.slice(startIndex) : [];
    };

    const dailyData = prepareStats("day", dateRanges.daily, 30, "days");
    const weeklyData = prepareStats("week", dateRanges.weekly, 12, "weeks");
    const monthlyData = prepareStats("month", dateRanges.monthly, 12, "months");
    const yearlyData = prepareStats("year", dateRanges.yearly, 5, "years");

    return res.status(200).json({
      success: true,
      data: {
        day: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData,
      },
    });
  } catch (error) {
    console.error("Order Graph Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Cannot Fetch Order Graph",
    });
  }
};

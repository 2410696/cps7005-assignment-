const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user });

    if (!expenses.length) {
      return res.json({
        categoryData: {},
        monthlyData: [],
        insights: ["No expenses yet. Start adding expenses to see insights."]
      });
    }

    const categoryData = {};
    expenses.forEach((e) => {
      categoryData[e.category] = (categoryData[e.category] || 0) + e.amount;
    });

    const monthlyData = {};
    expenses.forEach((e) => {
      const month = new Date(e.date).toLocaleString("default", { month: "short", year: "numeric" });
      monthlyData[month] = (monthlyData[month] || 0) + e.amount;
    });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const highestCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];
    const averageMonthly =
      Object.values(monthlyData).reduce((a, b) => a + b, 0) /
      Object.keys(monthlyData).length;

    const insights = [
      `Your total spending so far is $${totalSpent.toFixed(2)}.`,
      highestCategory
        ? `Your largest expense category is ${highestCategory[0]} with $${highestCategory[1].toFixed(2)} spent.`
        : "You have a balanced spending pattern across categories.",
      `On average, you spend about $${averageMonthly.toFixed(2)} per month.`,
      averageMonthly > 500
        ? "Consider setting stricter budgets to reduce monthly spending."
        : "Your monthly spending is within a healthy range.",
      highestCategory && highestCategory[0] === "Dining"
        ? "You're spending a lot on dining out. Try cooking at home to save more."
        : "Keep tracking your expenses to find more ways to save."
    ];

    res.json({
      categoryData,
      monthlyData: Object.entries(monthlyData).map(([month, amount]) => ({
        month,
        amount
      })),
      insights
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

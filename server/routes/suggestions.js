const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user });

    if (expenses.length === 0) {
      return res.json({ suggestions: ["Add some expenses to get personalized suggestions."] });
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categories = {};

    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    const highestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    let suggestions = [
      `You spent a total of $${totalSpent.toFixed(2)} this month.`,
      highestCategory
        ? `Your highest spending was on ${highestCategory[0]} ($${highestCategory[1].toFixed(2)}). Consider reducing this category.`
        : "Track more expenses for better insights.",
      "Try setting a budget goal to control overspending.",
      "Save at least 10% of your income to build an emergency fund."
    ];

    res.json({ suggestions }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

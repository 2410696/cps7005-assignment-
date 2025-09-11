const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Reminder = require("../models/reminder");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  auth,
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const userId = new mongoose.Types.ObjectId(req.user);

      const expense = new Expense({ ...req.body, user: userId });
      await expense.save();

      const budgets = await Budget.find({ user: userId });
      const categoryBudget = budgets.find((b) => b.category === req.body.category);

      if (categoryBudget) {
        const totalSpent = await Expense.aggregate([
          { $match: { user: userId, category: req.body.category } },
          { $group: { _id: "$category", total: { $sum: "$amount" } } },
        ]);

        if (totalSpent.length > 0) {
          const spent = totalSpent[0].total;

          if (spent > categoryBudget.limit) {
            const overspend = spent - categoryBudget.limit;

            const overspendMsg = `Overspending alert: You exceeded your ${req.body.category} budget by $${overspend}. (Spent $${spent}, Limit $${categoryBudget.limit})`;

            const saveSuggestion = `Suggestion: Try reducing your ${req.body.category} spending by 10% next month to save ~$${(
              spent * 0.1
            ).toFixed(2)}.`;

            await new Reminder({ user: userId, message: overspendMsg }).save();
            await new Reminder({ user: userId, message: saveSuggestion }).save();
          }
        }
      }

      res.status(201).json(expense);
    } catch (err) {
      console.error("Error saving expense:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user);
    const expenses = await Expense.find({ user: userId });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Reminder = require("../models/reminder");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user });
    const today = new Date();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const expenses = await Expense.aggregate([
      { $match: { user: req.user, date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const autoReminders = [];

    budgets.forEach((budget) => {
  const exp = expenses.find((e) => e._id === budget.category);
  if (exp && exp.total > budget.limit) {
    const overBy = exp.total - budget.limit;

    autoReminders.push(
      `Overspending alert: ${budget.category} is over budget by $${overBy}`
    );

    autoReminders.push(
      `Suggestion: Try cutting ${budget.category} spending by 20% next month to save ~$${(
        exp.total * 0.2
      ).toFixed(2)}`
    );
  }
  });

    if (today.getDate() === 15) {
      autoReminders.push("Mid-month check: review your budget and adjust if needed!");
    }

    if (today.getDate() > 27) {
      autoReminders.push("Reminder: Download your monthly financial report before next month starts!");
    }

    for (let msg of autoReminders) {
      const exists = await Reminder.findOne({
        user: req.user,
        message: msg,
        date: { $gte: startOfMonth },
      });
      if (!exists) {
        await new Reminder({ user: req.user, message: msg }).save();
      }
    }

    const reminders = await Reminder.find({ user: req.user }).sort({ date: -1 });
    res.json({ reminders });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const reminder = new Reminder({
      user: req.user,
      message: req.body.message,
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { read: true },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ msg: "Reminder not found" });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

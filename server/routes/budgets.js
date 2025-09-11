const express = require("express");
const { body, validationResult } = require("express-validator");
const Budget = require("../models/Budget");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  auth,
  [body("category").notEmpty(), body("limit").isNumeric()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const budget = new Budget({ ...req.body, user: req.user });
      await budget.save();
      res.status(201).json(budget);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { limit } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { limit },
      { new: true }
    );
    if (!budget) return res.status(404).json({ msg: "Budget not found" });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Budget", budgetSchema);

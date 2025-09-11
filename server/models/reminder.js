const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});


module.exports =
  mongoose.models.Reminder || mongoose.model("Reminder", ReminderSchema);

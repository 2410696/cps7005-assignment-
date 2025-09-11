const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");
const budgetRoutes = require("./routes/budgets");
const analyticsRoutes = require("./routes/analytics");
const suggestionsRoutes = require("./routes/suggestions");
const reminderRoutes = require("./routes/reminders");
const reportsRoutes = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json());

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/reports", reportsRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log("DB connection error:", err.message));

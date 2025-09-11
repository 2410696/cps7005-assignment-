const express = require("express");
const router = express.Router();
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

router.get("/csv", auth, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select("name email");

    const expenses = await Expense.find({ user: userId }).sort({ date: -1 }).lean();
    const budgets = await Budget.find({ user: userId }).lean();

    const expenseRows = expenses.map((e) => ({
      category: e.category,
      amount: e.amount,
      date: fmtDate(e.date),
      id: e._id.toString(),
    }));

    const parser = new Parser({ fields: ["id", "category", "amount", "date"] });
    const csvExpenses = parser.parse(expenseRows);

    const budgetsRows = budgets.map((b) => ({
      category: b.category,
      amount: b.amount,
      month: b.month,
      id: b._id.toString(),
    }));
    const parserBud = new Parser({ fields: ["id", "category", "amount", "month"] });
    const csvBudgets = parserBud.parse(budgetsRows);

    const header = `SmartSpend Report for ${user.name || user.email}\nGenerated: ${new Date().toLocaleString()}\n\n`;
    const combined = `${header}=== Expenses ===\n${csvExpenses}\n\n=== Budgets ===\n${csvBudgets}\n`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="smartspend_report_${userId}.csv"`);
    return res.send(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate CSV report" });
  }
});

router.get("/pdf", auth, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).select("name email");
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 }).lean();
    const budgets = await Budget.find({ user: userId }).lean();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="smartspend_report_${userId}.pdf"`);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("SmartSpend - Financial Report", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`User: ${user.name || user.email}`, { align: "left" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: "left" });
    doc.moveDown();

    doc.fontSize(14).text("Expenses", { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text("Category", 50, tableTop);
    doc.text("Amount", 220, tableTop);
    doc.text("Date", 300, tableTop);
    doc.moveDown(0.5);

    expenses.forEach((e) => {
      doc.text(e.category, 50);
      doc.text(e.amount.toString(), 220);
      doc.text(fmtDate(e.date), 300);
      doc.moveDown(0.2);
    });

    doc.addPage();

    doc.fontSize(14).text("Budgets", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    budgets.forEach((b) => {
      doc.text(`Category: ${b.category}`, { continued: false });
      doc.text(`Amount: ${b.amount}`, { indent: 20 });
      doc.text(`Month: ${b.month}`, { indent: 20 });
      doc.moveDown(0.4);
    });

    doc.moveDown(1);
    doc.fontSize(12).text("End of Report", { align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});

module.exports = router;

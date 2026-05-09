import ExcelJS from "exceljs";
import Transaction from "../../models/Transaction.js";

export const exportExcelReport = async (userId) => {
  const workbook = new ExcelJS.Workbook();

  const incomeSheet = workbook.addWorksheet("Income");
  const expenseSheet = workbook.addWorksheet("Expenses");
  const summarySheet = workbook.addWorksheet("Summary");

  const transactions = await Transaction.find({ user: userId }).lean();

  const income = transactions.filter(t => t.type === "income");
  const expenses = transactions.filter(t => t.type === "expense");

  // ======================
  // INCOME SHEET
  // ======================
  incomeSheet.columns = [
    { header: "Title", key: "title" },
    { header: "Amount", key: "amount" },
    { header: "Date", key: "date" },
  ];

  income.forEach(t => incomeSheet.addRow(t));

  // ======================
  // EXPENSE SHEET
  // ======================
  expenseSheet.columns = [
    { header: "Title", key: "title" },
    { header: "Amount", key: "amount" },
    { header: "Category", key: "category" },
  ];

  expenses.forEach(t => expenseSheet.addRow(t));

  // ======================
  // SUMMARY SHEET
  // ======================
  summarySheet.addRow(["Total Income", income.reduce((a,b)=>a+b.amount,0)]);
  summarySheet.addRow(["Total Expenses", expenses.reduce((a,b)=>a+b.amount,0)]);
  summarySheet.addRow(["Net", income.reduce((a,b)=>a+b.amount,0) - expenses.reduce((a,b)=>a+b.amount,0)]);

  return workbook;
};
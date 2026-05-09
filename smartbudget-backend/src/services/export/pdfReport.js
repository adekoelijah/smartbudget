import PDFDocument from "pdfkit";
import Transaction from "../../models/Transaction.js";
import { analyzeFinancials } from "../ai/financialAnalyzer.js";

export const generateAIReportPDF = async (req, res) => {
  const userId = req.user.id;

  const transactions = await Transaction.find({ user: userId }).lean();
  const analysis = analyzeFinancials(transactions);

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=ai-report.pdf");

  doc.pipe(res);

  // HEADER
  doc.fontSize(20).text("SmartBudget AI Financial Report");
  doc.moveDown();

  // INSIGHTS
  doc.fontSize(14).text(`Income: ₦${analysis.income}`);
  doc.text(`Expenses: ₦${analysis.expense}`);
  doc.text(`Savings: ₦${analysis.savings}`);
  doc.moveDown();

  doc.text(`Risk Score: ${analysis.riskScore}/100`);
  doc.moveDown();

  doc.text(`AI Insight: ${analysis.summary}`);

  doc.end();
};
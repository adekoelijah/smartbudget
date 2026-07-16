// backend/config/controllers/exportController.js


import Transaction from "../../models/Transaction.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/* =========================================
   HELPERS
========================================= */

const getUserRole = (req) => req.user?.role || "user";

const getExportLimit = (role) => {
  if (role === "admin") return 100000;
  return 5000; // normal user limit
};

const buildQuery = (req) => {
  const query = { user: req.user._id };

  // optional filters
  if (req.query.type) query.type = req.query.type;
  if (req.query.category) query.category = req.query.category;

  if (req.query.startDate || req.query.endDate) {
    query.date = {};

    if (req.query.startDate) {
      query.date.$gte = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      query.date.$lte = new Date(req.query.endDate);
    }
  }

  return query;
};

const calculateSummary = (rows) => {
  let income = 0;
  let expenses = 0;

  rows.forEach((item) => {
    if (item.type === "income") income += item.amount;
    else expenses += item.amount;
  });

  return {
    income,
    expenses,
    balance: income - expenses,
    total: rows.length,
  };
};

/* =========================================
   CSV STREAM EXPORT
   GET /api/export/csv-stream
========================================= */

export const exportCSVStream = async (req, res) => {
  try {
    const role = getUserRole(req);
    const limit = getExportLimit(role);

    const query = buildQuery(req);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions-${Date.now()}.csv`
    );

    res.write("Title,Type,Category,Amount,Date,Note\n");

    const cursor = Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .cursor();

    for await (const tx of cursor) {
      const row = [
        `"${tx.title || ""}"`,
        tx.type,
        `"${tx.category || ""}"`,
        tx.amount,
        new Date(tx.date).toISOString().split("T")[0],
        `"${tx.note || ""}"`,
      ].join(",");

      res.write(row + "\n");
    }

    res.end();
  } catch (error) {
    console.error("CSV Export Error:", error);
    res.status(500).json({
      success: false,
      message: "CSV export failed",
    });
  }
};

/* =========================================
   XLSX EXPORT
   GET /api/export/xlsx
========================================= */

export const exportXLSX = async (req, res) => {
  try {
    const role = getUserRole(req);
    const limit = getExportLimit(role);

    const query = buildQuery(req);

    const rows = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const workbook = new ExcelJS.Workbook();

    /* ======================
       SHEET 1 - SUMMARY
    ====================== */
    const summarySheet = workbook.addWorksheet("Summary");

    const summary = calculateSummary(rows);

    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 20 },
    ];

    summarySheet.addRows([
      { metric: "Total Transactions", value: summary.total },
      { metric: "Total Income", value: summary.income },
      { metric: "Total Expenses", value: summary.expenses },
      { metric: "Net Balance", value: summary.balance },
    ]);

    /* ======================
       SHEET 2 - Income
    ====================== */
    const incomeSheet = workbook.addWorksheet("Income");

    incomeSheet.columns = [
      { header: "Title", key: "title", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 18 },
    ];

    rows
      .filter((item) => item.type === "income")
      .forEach((item) => {
        incomeSheet.addRow({
          title: item.title,
          category: item.category,
          amount: item.amount,
          date: new Date(item.date).toLocaleDateString(),
        });
      });

    /* ======================
       SHEET 3 - Expenses
    ====================== */
    const expenseSheet = workbook.addWorksheet("Expenses");

    expenseSheet.columns = [
      { header: "Title", key: "title", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 18 },
    ];

    rows
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        expenseSheet.addRow({
          title: item.title,
          category: item.category,
          amount: item.amount,
          date: new Date(item.date).toLocaleDateString(),
        });
      });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=smartbudget-${Date.now()}.xlsx`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("XLSX Export Error:", error);

    res.status(500).json({
      success: false,
      message: "Excel export failed",
    });
  }
};

/* =========================================
   PDF EXPORT
   GET /api/export/pdf
========================================= */

export const exportPDF = async (req, res) => {
  try {
    const role = getUserRole(req);
    const limit = getExportLimit(role);

    const query = buildQuery(req);

    const rows = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const summary = calculateSummary(rows);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=financial-report-${Date.now()}.pdf`
    );

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    doc.pipe(res);

    /* HEADER */
    doc.fontSize(22).text("SmartBudget Financial Report", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(11).text(`Generated: ${new Date().toLocaleString()}`);

    doc.moveDown();

    /* SUMMARY */
    doc.fontSize(16).text("Summary");

    doc.moveDown(0.5);

    doc.fontSize(11).text(`Total Transactions: ${summary.total}`);
    doc.text(`Total Income: ₦${summary.income.toLocaleString()}`);
    doc.text(`Total Expenses: ₦${summary.expenses.toLocaleString()}`);
    doc.text(`Net Balance: ₦${summary.balance.toLocaleString()}`);

    doc.moveDown();

    /* INSIGHTS */
    doc.fontSize(16).text("AI Insights");

    doc.moveDown(0.5);

    if (summary.balance > 0) {
      doc.fontSize(11).text(
        "Excellent cash flow trend. You are operating with positive balance."
      );
    } else {
      doc.fontSize(11).text(
        "Warning: Expenses currently exceed income. Reduce spend or increase income."
      );
    }

    if (summary.expenses > summary.income * 0.7) {
      doc.text(
        "High expense ratio detected. Consider reviewing subscriptions and recurring spend."
      );
    }

    doc.moveDown();

    /* RECENT TRANSACTIONS */
    doc.fontSize(16).text("Recent Transactions");
    doc.moveDown(0.5);

    rows.slice(0, 15).forEach((tx) => {
      doc
        .fontSize(10)
        .text(
          `${tx.title} | ${tx.type} | ₦${tx.amount.toLocaleString()} | ${new Date(
            tx.date
          ).toLocaleDateString()}`
        );
    });

    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);

    res.status(500).json({
      success: false,
      message: "PDF export failed",
    });
  }
};
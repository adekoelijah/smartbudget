// import express from "express";
// import { allowRoles } from "../middleware/roleMiddleware.js";

// import {
//   exportExcel,
// } from "../controllers/exportController.js";

// import {
//   streamCSV
// } from "../services/export/csvStreamer.js";

// import {
//   generateAIReportPDF
// } from "../services/export/pdfReport.js";

// const router = express.Router();

// // 🔐 ADMIN ONLY EXCEL EXPORT
// router.get("/excel", allowRoles("admin"), exportExcel);

// // ⚡ STREAMING CSV (ALL USERS)
// router.get("/csv", streamCSV);

// // 🧠 AI PDF REPORT (ALL USERS)
// router.get("/pdf/ai", generateAIReportPDF);

// export default router;


// current added files before crash




import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  exportCSVStream,
  exportXLSX,
  exportPDF,
} from "../config/controllers/exportController.js";

const router = express.Router();

router.get("/csv-stream", protect, exportCSVStream);
router.get("/xlsx", protect, exportXLSX);
router.get("/pdf", protect, exportPDF);

export default router;
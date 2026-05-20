




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
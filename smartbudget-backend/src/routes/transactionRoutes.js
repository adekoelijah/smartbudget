// // import express from "express";
// // import protect from "../middleware/authMiddleware.js";
// // import asyncHandler from "../utils/asyncHandler.js";
// // import {
// //   getTransactions,
// //   createTransaction,
// //   updateTransaction,
// //   deleteTransaction,
// // } from "../config/controllers/transactionController.js";

// // const router = express.Router();

// // router.use(protect);

// // router.route("/").get(asyncHandler(getTransactions)).post(asyncHandler(createTransaction));
// // router.route("/:id").put(asyncHandler(updateTransaction)).delete(asyncHandler(deleteTransaction));

// // export default router;


// import express from "express";

// import {  getTransactions,
//   createTransaction,
//   updateTransaction,
//   deleteTransaction,} from 
//   "../config/controllers/transactionController.js";

// import protect from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/", protect, createTransaction);
// router.get("/", protect, getTransactions);

// export default router;




import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../config/controllers/transactionController.js";

const router = express.Router();

router.use(protect);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
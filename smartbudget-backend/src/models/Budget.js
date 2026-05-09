import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, default: 0 },
    category: { type: String, required: true, default: "expense", trim: true },
    spent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

export default Budget;

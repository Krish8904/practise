import mongoose from "mongoose";

const expenseTypeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },   // display name
    value: { type: String, required: true, trim: true },   // stored value
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

expenseTypeSchema.index({ value: 1 }, { unique: true });

export default mongoose.model("ExpenseType", expenseTypeSchema, "expensetypes");
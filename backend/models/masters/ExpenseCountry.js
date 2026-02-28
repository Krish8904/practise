import mongoose from "mongoose";

const expenseCountrySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // display name
    value: { type: String, required: true, trim: true }, // stored value (e.g., "IN")
    code: { type: String, trim: true },                 // e.g., country code
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

expenseCountrySchema.index({ value: 1 }, { unique: true });

export default mongoose.model("ExpenseCountry", expenseCountrySchema, "expensecountries");
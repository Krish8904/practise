import mongoose from "mongoose";

const expenseCurrencySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // display name
    value: { type: String, required: true, trim: true }, // stored value (e.g., "USD")
    code: { type: String, trim: true },                  // e.g., "$"
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

expenseCurrencySchema.index({ value: 1 }, { unique: true });

export default mongoose.model("ExpenseCurrency", expenseCurrencySchema, "expensecurrencies");
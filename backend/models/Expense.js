import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, sparse: true },
    date: { type: Date, required: true },
    month: { type: Number },

    // ✅ CHANGED: now references ExpenseCountry
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCountry",
    },

    company: { type: String, required: true },

    // ✅ CHANGED: now references ExpenseType
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseType",
      required: true,
    },

    department: { type: String },
    counterparty: { type: String },
    description: { type: String },
    account: { type: String },

    amount: { type: Number, required: true },

    // ✅ CHANGED: now references ExpenseCurrency
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCurrency",
    },

    fx: { type: Number, default: 1 },
    inrAmount: { type: Number },
    sign: { type: Number, enum: [1, -1], default: 1 },
  },
  { timestamps: true }
);

// 👇 AUTO TRANSACTION ID (unchanged)
expenseSchema.pre("save", async function () {
  if (this.transactionId) return;

  const ExpenseModel = this.constructor;

  const docs = await ExpenseModel.find({}, { transactionId: 1 });

  const numbers = docs
    .map((d) => {
      if (!d.transactionId) return null;
      const n = parseInt(d.transactionId.replace("EXCP", ""), 10);
      return isNaN(n) ? null : n;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  let nextNumber = 1;

  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      nextNumber = i + 1;
      break;
    }
    nextNumber = numbers.length + 1;
  }

  this.transactionId = `EXCP${String(nextNumber).padStart(5, "0")}`;
});

export default mongoose.model("Expense", expenseSchema);
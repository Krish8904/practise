import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, sparse: true },
    date: { type: Date, required: true },
    month: { type: Number },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCountry",
    },

    company: { type: String, required: true },

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

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;


  this.transactionId = `EXCP${String(nextNumber).padStart(5, "0")}`;
});

export default mongoose.model("Expense", expenseSchema);